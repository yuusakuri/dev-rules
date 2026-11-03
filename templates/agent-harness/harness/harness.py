#!/usr/bin/env python3
"""コーディングエージェントを長時間自律で動かすハーネスの操作CLI。

起動、評価、記録、環境の操作、フックの処理を、Claude CodeとCodexで共通の1か所にまとめる。
"""

import argparse
import datetime as dt
import fcntl
import json
import math
import os
import re
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
SCORE_LINE = re.compile(r"^SCORE\s+(\S+)\s*$")


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
    noise = (max(scores) - min(scores)) / abs(median) if len(scores) >= 2 and median else 0.0
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
    if baseline["median"] == 0:
        # 基準が0の場合は相対変化を定義できないため、スコアの向きだけで判断する。
        if median > 0:
            return f"keep（基準0から{median:+g}）"
        if median < 0 or len(candidates) >= config["baseline_runs"]:
            return f"revert（基準0から{median:+g}）"
        return f"remeasure（基準0から{median:+g}、{len(candidates)}回測定済み）"
    threshold = max(config["keep_margin"], baseline["noise"])
    change = (median - baseline["median"]) / abs(baseline["median"])
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


def is_finite_number(text):
    try:
        return math.isfinite(float(text))
    except ValueError:
        return False


def group_alive(pgid):
    try:
        os.killpg(pgid, 0)
        return True
    except (ProcessLookupError, PermissionError):
        # macOSでは、回収前の終了済みプロセスだけが残るグループへの送信がPermissionErrorになる。
        return False


def stop_process_group(process, grace_seconds):
    """プロセスグループ全体を止め、子プロセスを残さない。"""
    stop_group(process.pid, grace_seconds, process)
    process.wait()


def stop_group(pgid, grace_seconds, process=None):
    try:
        os.killpg(pgid, signal.SIGTERM)
    except (ProcessLookupError, PermissionError):
        return
    limit = time.monotonic() + grace_seconds
    while time.monotonic() < limit:
        if (process is None or process.poll() is not None) and not group_alive(pgid):
            return
        time.sleep(0.2)
    try:
        os.killpg(pgid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


def stop_running_evaluation(run_dir):
    """エージェントと一緒に止まらない、別グループの評価を止める。"""
    marker = run_dir / "evaluating.pid"
    if marker.exists():
        stop_group(int(marker.read_text(encoding="utf-8")), 15)
        marker.unlink(missing_ok=True)


def evaluate_once(config, run_dir, label):
    with (run_dir / "evaluate.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        number = len(read_history(run_dir)) + 1
        log = run_dir / "logs" / f"eval-{number:04d}.log"
        started = now()
        with log.open("w", encoding="utf-8") as out:
            process = subprocess.Popen([str(PROJECT_DIR / "evaluate.sh")], cwd=ROOT, stdout=out, stderr=subprocess.STDOUT, start_new_session=True)
            # 評価は別のプロセスグループで動くため、この処理が止められた時と起動スクリプトの停止時に止められるようにする。
            marker = run_dir / "evaluating.pid"
            marker.write_text(str(process.pid), encoding="utf-8")
            previous = {signum: signal.signal(signum, lambda *_: (stop_process_group(process, 5), sys.exit(1))) for signum in (signal.SIGTERM, signal.SIGHUP, signal.SIGINT)}
            try:
                exit_code = process.wait(timeout=config["evaluate_timeout_seconds"])
            except subprocess.TimeoutExpired:
                # 評価が起動した子プロセスを残すと、次の評価や復元と重なる。
                stop_process_group(process, 15)
                out.write("\n評価がタイムアウトした。\n")
                exit_code = -1
            finally:
                for signum, handler in previous.items():
                    signal.signal(signum, handler)
                marker.unlink(missing_ok=True)
        finished = now()
        scores = [SCORE_LINE.match(line) for line in log.read_text(encoding="utf-8", errors="replace").splitlines()]
        # 最後のSCOREの行を採用し、数値として不正なら評価を失敗とする。
        scores = [match.group(1) for match in scores if match][-1:]
        scores = [score for score in scores if is_finite_number(score)]
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
    for _ in range(args.repeat):
        row = evaluate_once(config, run_dir, args.label)
        print(f"評価 #{row['no']} label={row['label']} commit={row['commit']} passed={row['passed']} score={row['score'] or '-'} log={row['log']}")
    rows = read_history(run_dir)
    baseline = baseline_of(config, rows)
    if baseline:
        print(f"基準: {baseline['commit']} の中央値 {baseline['median']}（{baseline['runs']}回、揺れ {baseline['noise']:.1%}）")
    verdict = verdict_of(config, rows, row["commit"]) if args.label == "candidate" else None
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
            stop_process_group(process, 15)
            stop_running_evaluation(run_dir)
            return
        finished.wait(5)


def raise_interrupt(signum, frame):
    raise KeyboardInterrupt


def cmd_run(args):
    for signum in (signal.SIGTERM, signal.SIGHUP):
        signal.signal(signum, raise_interrupt)
    config = load_config()
    run_dir = run_dir_of(config)
    spec = config["agents"][args.agent]
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
            # 起動スクリプトが途中で止まっても、次の起動で同じセッションを再開できるように保存する。
            write_json(session_file, session)
            finished = threading.Event()
            watcher = threading.Thread(target=watch, args=(process, config, run_dir, finished), daemon=True)
            watcher.start()
            try:
                for line in process.stdout:
                    log.write(line)
                    log.flush()
                    if source != "generate" and not session["id"]:
                        session["id"] = extract_session_id(line, source)
                        write_json(session_file, session)
                process.wait()
            except BaseException:
                # 起動スクリプトが止められた時も、エージェントと評価を残さない。
                stop_process_group(process, 15)
                stop_running_evaluation(run_dir)
                raise
            finally:
                finished.set()
                # 停止の処理が終わる前に起動スクリプトが終わると、子プロセスと評価が残る。
                watcher.join()
            if phase_at(config, now()) == "ended" or (run_dir / "STOP").exists():
                stop_group(process.pid, 15)
                stop_running_evaluation(run_dir)
        write_json(session_file, session)
        print(f"{now():%H:%M:%S} エージェントが終了した（終了コード {process.returncode}）。", flush=True)
        prompt = read_prompt("resume")
        if time.monotonic() - started < 60 and phase_at(config, now()) != "ended" and not (run_dir / "STOP").exists():
            time.sleep(config["restart_backoff_seconds"])
    print(f"{now():%H:%M:%S} ハーネスを終了する。", flush=True)


# ---- フック ----


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


HOOKS = {"post-tool-use": post_tool_use, "stop": stop, "session-start": session_start}


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
