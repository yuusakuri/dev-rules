# エージェントハーネス

評価コマンドで成果を測れる目標に向けて、Claude CodeまたはCodexを終了時刻まで自律で動かすハーネスのひな形。構成は[ハーネスエンジニアリングガイドライン](../../guidelines/ai/harness-engineering-guidelines.md)に、ループの設計は[ループエンジニアリングガイドライン](../../guidelines/ai/loop-engineering-guidelines.md)の期限付きの最適化のループに従う。

## 必要なもの

- LinuxまたはmacOS
- Python 3.9以降
- Git
- Claude CodeまたはCodexのCLI

## 導入

1. このディレクトリの内容を、作業対象のGitリポジトリのルートへコピーする。`.claude/skills` は `.agents/skills` へのシンボリックリンクのままにする。
2. `CONDITIONS.md` の `<>` で囲んだ箇所を、今回の条件へ置き換える。
3. `harness/config.json` の `deadline` に終了時刻を、タイムゾーン付きのISO 8601形式で設定する。
4. `harness/project/` の各スクリプトを、作業対象に合わせて実装する。

| スクリプト | 実装する処理 |
| --- | --- |
| `evaluate.sh` | 評価を1回実行する。合格のときは終了コード0で終了し、最後に `SCORE <数値>` の行を出力する。スコアは大きいほど良い値とし、0や負の値も使える。タイムアウトした場合は、評価が起動した子プロセスも含めて停止する。 |
| `deploy.sh` | 現在のコミットを全ての対象ホストへ反映する。 |
| `rollback.sh` | 引数のコミットの状態へ、コード以外も含めて環境を戻す。 |
| `verify-restart.sh` | 全ての対象ホストを再起動し、状態が復元されることを確かめる。 |
| `collect.sh` | 環境変数 `EVAL_START` から `EVAL_END` までの計測を、全ての対象ホストから引数のディレクトリへ集め、`summary.txt` へ要約する。 |

5. 変更をコミットする。

## 起動

使用するツールに合わせて、次のどちらかを実行する。

Claude Codeを使う場合:

```bash
python3 harness/harness.py run --agent claude
```

Codexを使う場合:

```bash
python3 harness/harness.py run --agent codex
```

起動したプロセスは、終了時刻を過ぎるか、エージェントが最終段階の作業を終えるまで、エージェントの再開を繰り返す。端末を閉じても止まらないように、`tmux` などの中で実行する。

モデルを指定する場合は、`harness/config.json` の `agents` にある起動コマンドへ、Claude Codeでは `--model <モデル名>` を、Codexでは `-m <モデル名>` を加える。

## 実行中の操作

| 目的 | 操作 |
| --- | --- |
| 状態を確認する | `python3 harness/harness.py status` を実行する。 |
| 判断の経緯を確認する | `runs/current/journal.md` を読む。 |
| エージェントへ指示する | `runs/current/inbox.md` に指示を書く。次のツール実行の後にエージェントへ届く。 |
| 停止する | `runs/current/STOP` を作成する。 |

## 予行

本番の前に、`deadline` を数十分後に設定した予行を行い、継続、通知、終了の動作を確かめる。予行の後は `runs/current/` を `runs/archive/<日時>/` へ移し、記録から見つかった失敗をハーネスへ反映する。
