#!/usr/bin/env python3
"""コーディングエージェントを長時間自律で動かすハーネスの操作CLI。

起動、評価、記録、環境の操作、フックの処理を、Claude CodeとCodexで共通の1か所にまとめる。
"""

import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
import re
import shlex
import signal
import statistics
import subprocess
import sys
import threading
import time
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HARNESS_DIR = ROOT / "harness"
CONFIG_FILE = HARNESS_DIR / "config.json"
PROMPT_DIR = HARNESS_DIR / "prompts"
PROJECT_DIR = HARNESS_DIR / "project"
HISTORY_COLUMNS = ["no", "time", "commit", "label", "passed", "score", "log"]
SCORE_LINE = re.compile(r"^SCORE\s+(-?\d+(?:\.\d+)?)\s*$")
WRITE_COMMANDS = {"rm", "mv", "cp", "tee", "truncate", "chmod", "chown", "ln", "install", "rsync", "dd", "touch", "unlink"}
GIT_WRITE_SUBCOMMANDS = {"checkout", "restore", "rm", "mv", "clean", "apply"}
REDIRECT_TARGET = re.compile(r">{1,2}\|?\s*([^\s;&|<>]+)")
PROTECTED_NOTE = "。ハーネス、評価器、記録はエージェントが変更する対象ではない。"
PATCH_FILE_LINE = re.compile(r"^\*\*\* (?:Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$", re.MULTILINE)


def load_config():
    return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))


def now():
    return dt.datetime.now().astimezone()


def deadline_of(config):
    return dt.datetime.fromisoformat(config["deadline"])


def phase_at(config, at):
    deadline = deadline_of(config)
    if at >= deadline:
        return "ended"
    if at >= deadline - dt.timedelta(minutes=config["final_phase_minutes"]):
        return "final"
    return "improve"


def run_dir_of(config):
    path = ROOT / config["run_dir"]
    (path / "logs").mkdir(parents=True, exist_ok=True)
    (path / "hypotheses").mkdir(exist_ok=True)
    return path


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def read_prompt(name, **values):
    return (PROMPT_DIR / f"{name}.md").read_text(encoding="utf-8").format(**values).strip()


# ---- 改ざんの検知 ----


def harness_digest(config):
    digest = hashlib.sha256()
    for entry in sorted(config["protected_paths"]):
        path = ROOT / entry
        files = sorted(path.rglob("*")) if path.is_dir() else [path]
        for file in files:
            if file.is_file() and "__pycache__" not in file.parts:
                digest.update(str(file.relative_to(ROOT)).encode())
                digest.update(file.read_bytes())
    return digest.hexdigest()


def check_integrity(config, run_dir):
    recorded = run_dir / "harness.sha256"
    current = harness_digest(config)
    if not recorded.exists():
        recorded.write_text(current, encoding="utf-8")
        return
    if recorded.read_text(encoding="utf-8").strip() != current:
        sys.exit("ハーネスのファイルが起動時から変更されている。評価を記録しない。変更を元に戻すまで評価できない。")


# ---- 評価の記録 ----


def read_history(run_dir):
    path = run_dir / "history.tsv"
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()[1:]
    return [dict(zip(HISTORY_COLUMNS, line.split("\t"))) for line in lines if line]


def append_history(run_dir, row):
    path = run_dir / "history.tsv"
    if not path.exists():
        path.write_text("\t".join(HISTORY_COLUMNS) + "\n", encoding="utf-8")
    with path.open("a", encoding="utf-8") as out:
        out.write("\t".join(str(row[column]) for column in HISTORY_COLUMNS) + "\n")


def current_commit():
    head = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return f"{head}-dirty" if dirty else head or "unknown"


def passed_scores(rows):
    return [float(row["score"]) for row in rows if row["passed"] == "true"]


def baseline_of(config, rows):
    baseline_rows = [row for row in rows if row["label"] == "baseline" and row["passed"] == "true"]
    if not baseline_rows:
        return None
    commit = baseline_rows[-1]["commit"]
    scores = [float(row["score"]) for row in baseline_rows if row["commit"] == commit][-config["baseline_runs"]:]
    median = statistics.median(scores)
    noise = (max(scores) - min(scores)) / median if len(scores) >= 2 and median else 0.0
    return {"commit": commit, "median": median, "runs": len(scores), "noise": noise}


def verdict_of(config, rows, commit):
    baseline = baseline_of(config, rows)
    candidates = [row for row in rows if row["label"] == "candidate" and row["commit"] == commit]
    if not candidates:
        return None
    if any(row["passed"] != "true" for row in candidates):
        return "revert（評価に失敗した実行がある）"
    if baseline is None:
        return "基準が未測定。evaluate --label baseline で基準を測る"
    median = statistics.median(passed_scores(candidates))
    threshold = max(config["keep_margin"], baseline["noise"])
    change = median / baseline["median"] - 1
    if change >= threshold:
        return f"keep（{change:+.1%}、しきい値 {threshold:+.1%}）"
    if change <= 0 or len(candidates) >= config["baseline_runs"]:
        return f"revert（{change:+.1%}、しきい値 {threshold:+.1%}）"
    return f"remeasure（{change:+.1%}、しきい値 {threshold:+.1%}、{len(candidates)}回測定済み）"


def last_improvement_time(rows):
    best = None
    improved_at = None
    for row in rows:
        if row["passed"] != "true":
            continue
        score = float(row["score"])
        if best is None or score > best:
            best = score
            improved_at = dt.datetime.fromisoformat(row["time"])
    return improved_at


def tail(path, lines):
    content = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return "\n".join(content[-lines:])


def evaluate_once(config, run_dir, label):
    with (run_dir / "evaluate.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        number = len(read_history(run_dir)) + 1
        log = run_dir / "logs" / f"eval-{number:04d}.log"
        started = now()
        with log.open("w", encoding="utf-8") as out:
            try:
                result = subprocess.run([str(PROJECT_DIR / "evaluate.sh")], cwd=ROOT, stdout=out, stderr=subprocess.STDOUT, timeout=config["evaluate_timeout_seconds"])
                exit_code = result.returncode
            except subprocess.TimeoutExpired:
                out.write("\n評価がタイムアウトした。\n")
                exit_code = -1
        finished = now()
        scores = [SCORE_LINE.match(line) for line in log.read_text(encoding="utf-8", errors="replace").splitlines()]
        scores = [match.group(1) for match in scores if match]
        row = {
            "no": number,
            "time": finished.isoformat(timespec="seconds"),
            "commit": current_commit(),
            "label": label,
            "passed": "true" if exit_code == 0 and scores else "false",
            "score": scores[-1] if scores else "",
            "log": str(log.relative_to(ROOT)),
        }
        append_history(run_dir, row)
    collect = PROJECT_DIR / "collect.sh"
    if collect.exists():
        output_dir = run_dir / "logs" / f"eval-{number:04d}-collect"
        output_dir.mkdir(exist_ok=True)
        env = dict(os.environ, EVAL_START=started.isoformat(), EVAL_END=finished.isoformat())
        with (output_dir / "collect.log").open("w", encoding="utf-8") as out:
            subprocess.run([str(collect), str(output_dir)], cwd=ROOT, stdout=out, stderr=subprocess.STDOUT, env=env)
    return row


def status_text(config, run_dir):
    at = now()
    rows = read_history(run_dir)
    scores = passed_scores(rows)
    baseline = baseline_of(config, rows)
    remaining = deadline_of(config) - at
    lines = [
        f"現在時刻: {at.isoformat(timespec='minutes')}",
        f"終了時刻: {config['deadline']}（残り {max(remaining.total_seconds(), 0) / 60:.0f}分）",
        f"段階: {phase_at(config, at)}（improve: 改善、final: 最終段階、ended: 終了）",
        f"最高スコア: {max(scores) if scores else '未測定'}",
    ]
    if baseline:
        lines.append(f"基準: {baseline['commit']} の中央値 {baseline['median']}（{baseline['runs']}回、揺れ {baseline['noise']:.1%}）")
    lines.append("直近の評価:")
    lines.extend("  " + "\t".join(row[column] for column in HISTORY_COLUMNS) for row in rows[-10:])
    journal = run_dir / "journal.md"
    if journal.exists():
        entries = journal.read_text(encoding="utf-8").split("\n## ")
        lines.append("直近の記録:\n## " + entries[-1].strip() if len(entries) > 1 else "")
    return "\n".join(lines)


# ---- サブコマンド ----


def cmd_status(args):
    config = load_config()
    print(status_text(config, run_dir_of(config)))


def cmd_evaluate(args):
    config = load_config()
    run_dir = run_dir_of(config)
    check_integrity(config, run_dir)
    for _ in range(args.repeat):
        row = evaluate_once(config, run_dir, args.label)
        print(f"評価 #{row['no']} label={row['label']} commit={row['commit']} passed={row['passed']} score={row['score'] or '-'} log={row['log']}")
    rows = read_history(run_dir)
    baseline = baseline_of(config, rows)
    if baseline:
        print(f"基準: {baseline['commit']} の中央値 {baseline['median']}（{baseline['runs']}回、揺れ {baseline['noise']:.1%}）")
    verdict = verdict_of(config, rows, row["commit"])
    if verdict:
        print(f"判定の目安: {verdict}")
    print(f"--- {row['log']} の末尾 ---")
    print(tail(ROOT / row["log"], config["log_tail_lines"]))


def cmd_journal(args):
    config = load_config()
    run_dir = run_dir_of(config)
    entry = (
        f"\n## {now():%H:%M} {args.purpose}\n\n"
        f"- 目的: {args.purpose}\n- 変更: {args.change}\n- 予想: {args.expected}\n"
        f"- 結果: {args.result}\n- 理由: {args.reason}\n- 判断: {args.decision}\n"
    )
    with (run_dir / "journal.md").open("a", encoding="utf-8") as out:
        out.write(entry)
    print(entry.strip())


def cmd_project(args):
    config = load_config()
    run_dir = run_dir_of(config)
    script = PROJECT_DIR / f"{args.command}.sh"
    log = run_dir / "logs" / f"{args.command}-{now():%H%M%S}.log"
    with log.open("w", encoding="utf-8") as out:
        result = subprocess.run([str(script), *args.args], cwd=ROOT, stdout=out, stderr=subprocess.STDOUT)
    print(f"{args.command}: 終了コード {result.returncode} log={log.relative_to(ROOT)}")
    print(tail(log, config["log_tail_lines"]))
    sys.exit(result.returncode)


def cmd_finish(args):
    config = load_config()
    run_dir = run_dir_of(config)
    if phase_at(config, now()) == "improve":
        sys.exit("最終段階より前は終了できない。改善を続ける。")
    (run_dir / "DONE").write_text(args.report, encoding="utf-8")
    print("終了を記録した。")


# ---- 起動 ----


def extract_session_id(line, source):
    try:
        event = json.loads(line)
    except json.JSONDecodeError:
        return None
    if not isinstance(event, dict) or any(event.get(key) != value for key, value in source["event"].items()):
        return None
    return event.get(source["field"])


def watch(process, config, run_dir, finished):
    deadline = deadline_of(config) + dt.timedelta(seconds=config["hard_stop_grace_seconds"])
    while not finished.is_set():
        if now() >= deadline or (run_dir / "STOP").exists():
            os.killpg(process.pid, signal.SIGTERM)
            if not finished.wait(15):
                os.killpg(process.pid, signal.SIGKILL)
            return
        finished.wait(5)


def cmd_run(args):
    config = load_config()
    run_dir = run_dir_of(config)
    spec = config["agents"][args.agent]
    check_integrity(config, run_dir)
    session_file = run_dir / "session.json"
    session = read_json(session_file, {})
    if session.get("agent") != args.agent:
        session = {"agent": args.agent, "id": None, "started": now().isoformat(timespec="seconds")}
    source = spec["session_id"]
    if source == "generate" and not session["id"]:
        session["id"] = str(uuid.uuid4())
        session["new"] = True
    write_json(session_file, session)
    prompt = read_prompt("resume" if session["id"] and not session.get("new") else "first")
    while phase_at(config, now()) != "ended" and not (run_dir / "STOP").exists() and not (run_dir / "DONE").exists():
        resume = not session.pop("new", False) and session["id"] is not None
        template = spec["resume"] if resume else spec["start"]
        command = [part.format(prompt=prompt, session_id=session["id"] or "", root=str(ROOT)) for part in template]
        started = time.monotonic()
        with (run_dir / f"agent-{args.agent}.jsonl").open("a", encoding="utf-8") as log, (run_dir / f"agent-{args.agent}.stderr.log").open("a", encoding="utf-8") as errors:
            process = subprocess.Popen(command, cwd=ROOT, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=errors, text=True, start_new_session=True)
            finished = threading.Event()
            threading.Thread(target=watch, args=(process, config, run_dir, finished), daemon=True).start()
            for line in process.stdout:
                log.write(line)
                log.flush()
                if source != "generate" and not session["id"]:
                    session["id"] = extract_session_id(line, source)
                    write_json(session_file, session)
            process.wait()
            finished.set()
        write_json(session_file, session)
        print(f"{now():%H:%M:%S} エージェントが終了した（終了コード {process.returncode}）。", flush=True)
        prompt = read_prompt("resume")
        if time.monotonic() - started < 60:
            time.sleep(config["restart_backoff_seconds"])
    print(f"{now():%H:%M:%S} ハーネスを終了する。", flush=True)


# ---- フック ----


def resolve_under_root(token, cwd):
    token = token.strip("'\"")
    if not token or token.startswith("-"):
        return None
    path = Path(token)
    path = (Path(cwd) / path) if not path.is_absolute() else path
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return None


def is_protected(relative, config):
    if relative is None:
        return False
    targets = config["protected_paths"] + [str(Path(config["run_dir"]) / "history.tsv")]
    return any(relative == entry.rstrip("/") or relative.startswith(entry.rstrip("/") + "/") for entry in targets)


def protected_write_in_shell(command, cwd, config):
    for pattern in config["deny_command_patterns"]:
        if re.search(pattern, command):
            return f"禁止されたコマンドに一致した: {pattern}"
    for segment in re.split(r"&&|\|\||;|\|", command):
        try:
            tokens = shlex.split(segment)
        except ValueError:
            tokens = segment.split()
        for match in REDIRECT_TARGET.finditer(segment):
            if is_protected(resolve_under_root(match.group(1), cwd), config):
                return f"保護されたファイルへの書き込み: {match.group(1)}{PROTECTED_NOTE}"
        if not tokens:
            continue
        name = Path(tokens[0]).name
        writes = name in WRITE_COMMANDS or (name == "sed" and any(token.startswith("-i") for token in tokens)) or (name == "git" and len(tokens) > 1 and tokens[1] in GIT_WRITE_SUBCOMMANDS)
        if writes and any(is_protected(resolve_under_root(token, cwd), config) for token in tokens[1:]):
            return f"保護されたファイルを変更するコマンド: {segment.strip()}{PROTECTED_NOTE}"
    return None


def pre_tool_use(payload, config, run_dir):
    tool = payload.get("tool_name", "")
    tool_input = payload.get("tool_input") or {}
    cwd = payload.get("cwd") or str(ROOT)
    reason = None
    if tool == "Bash":
        reason = protected_write_in_shell(tool_input.get("command", ""), cwd, config)
    elif tool == "apply_patch":
        for match in PATCH_FILE_LINE.finditer(tool_input.get("command", "")):
            target = match.group(1) or match.group(2)
            if is_protected(resolve_under_root(target.strip(), cwd), config):
                reason = f"保護されたファイルへのパッチ: {target.strip()}{PROTECTED_NOTE}"
    else:
        target = tool_input.get("file_path") or tool_input.get("notebook_path")
        if target and is_protected(resolve_under_root(target, cwd), config):
            reason = f"保護されたファイルの編集: {target}{PROTECTED_NOTE}"
    if reason:
        return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": reason}}
    return None


def post_tool_use(payload, config, run_dir):
    state_file = run_dir / "triggers.json"
    state = read_json(state_file, {})
    at = now()
    phase = phase_at(config, at)
    messages = []
    inbox = run_dir / "inbox.md"
    if inbox.exists() and inbox.read_text(encoding="utf-8").strip():
        content = inbox.read_text(encoding="utf-8").strip()
        with (run_dir / "inbox.delivered.md").open("a", encoding="utf-8") as out:
            out.write(f"\n## {at.isoformat(timespec='seconds')}\n\n{content}\n")
        inbox.write_text("", encoding="utf-8")
        messages.append(read_prompt("inbox", content=content))
    if phase == "final" and not state.get("final"):
        state["final"] = at.isoformat()
        messages.append(read_prompt("final", deadline=config["deadline"]))
    if phase == "ended" and not state.get("ended"):
        state["ended"] = at.isoformat()
        messages.append(read_prompt("ended"))
    if phase == "improve":
        session = read_json(run_dir / "session.json", {})
        candidates = [last_improvement_time(read_history(run_dir)), state.get("stall") and dt.datetime.fromisoformat(state["stall"]), session.get("started") and dt.datetime.fromisoformat(session["started"])]
        reference = max((value for value in candidates if value), default=at)
        if at - reference >= dt.timedelta(minutes=config["stall_minutes"]):
            state["stall"] = at.isoformat()
            messages.append(read_prompt("stall", minutes=config["stall_minutes"]))
    write_json(state_file, state)
    if messages:
        return {"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": "\n\n".join(messages)}}
    return None


def stop(payload, config, run_dir):
    phase = phase_at(config, now())
    if (run_dir / "STOP").exists() or phase == "ended" or (phase == "final" and (run_dir / "DONE").exists()):
        return None
    state_file = run_dir / "triggers.json"
    state = read_json(state_file, {})
    evaluations = len(read_history(run_dir))
    idle_stops = state.get("idle_stops", 0) + 1 if state.get("evaluations_at_stop") == evaluations else 1
    state.update(idle_stops=idle_stops, evaluations_at_stop=evaluations)
    write_json(state_file, state)
    reason = read_prompt("continue", status=status_text(config, run_dir))
    if idle_stops >= 3:
        reason += "\n\n" + read_prompt("stall", minutes=config["stall_minutes"])
    return {"decision": "block", "reason": reason}


def session_start(payload, config, run_dir):
    context = read_prompt("session-start", status=status_text(config, run_dir))
    return {"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": context}}


HOOKS = {"pre-tool-use": pre_tool_use, "post-tool-use": post_tool_use, "stop": stop, "session-start": session_start}


def cmd_hook(args):
    payload = json.loads(sys.stdin.read() or "{}")
    config = load_config()
    run_dir = run_dir_of(config)
    try:
        output = HOOKS[args.event](payload, config, run_dir)
    except Exception as error:  # フックの失敗でエージェントを止めない。
        with (run_dir / "hook-errors.log").open("a", encoding="utf-8") as out:
            out.write(f"{now().isoformat()} {args.event} {error!r}\n")
        return
    if output:
        print(json.dumps(output, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    commands = parser.add_subparsers(dest="subcommand", required=True)

    run = commands.add_parser("run", help="エージェントを起動し、終了時刻まで再開を繰り返す。")
    run.add_argument("--agent", choices=["claude", "codex"], required=True)
    run.set_defaults(handler=cmd_run)

    commands.add_parser("status", help="残り時間、最高スコア、基準、直近の評価と記録を表示する。").set_defaults(handler=cmd_status)

    evaluate = commands.add_parser("evaluate", help="評価を実行し、結果を記録する。")
    evaluate.add_argument("--label", choices=["baseline", "candidate", "final"], required=True)
    evaluate.add_argument("--repeat", type=int, default=1)
    evaluate.set_defaults(handler=cmd_evaluate)

    journal = commands.add_parser("journal", help="判断の記録を6項目で追記する。")
    for name in ("purpose", "change", "expected", "result", "reason"):
        journal.add_argument(f"--{name}", required=True)
    journal.add_argument("--decision", choices=["keep", "revert", "remeasure", "none"], required=True)
    journal.set_defaults(handler=cmd_journal)

    for name, help_text in (("deploy", "現在のコミットを環境へ反映する。"), ("rollback", "指定したコミットの状態へ、コード以外も含めて環境を戻す。"), ("verify-restart", "環境を再起動し、状態が復元されることを確かめる。")):
        project = commands.add_parser(name, help=help_text)
        project.add_argument("args", nargs="*")
        project.set_defaults(handler=cmd_project, command=name)

    finish = commands.add_parser("finish", help="最終段階の作業を終えたことを記録する。")
    finish.add_argument("--report", required=True)
    finish.set_defaults(handler=cmd_finish)

    hook = commands.add_parser("hook", help="Claude CodeとCodexのフックから呼ばれる。")
    hook.add_argument("event", choices=sorted(HOOKS))
    hook.set_defaults(handler=cmd_hook)

    args = parser.parse_args()
    args.handler(args)


if __name__ == "__main__":
    main()
