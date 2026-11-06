# エージェントハーネス

評価コマンドで測定する目標に向けて、Claude Code又はCodexの実行を終了時刻まで継続するひな形。

構成は、[ハーネスエンジニアリングガイドライン](../../guidelines/ai/harness-engineering-guidelines.md)に、実行の反復及び終了は、[ループエンジニアリングガイドラインの9.5](../../guidelines/ai/loop-engineering-guidelines.md#95-期限付きの最適化のループ)に従う。

## インストール

Linux又はmacOS上で、Python 3.9以降、Git及び利用するエージェントのCLIを用意する。

1. このディレクトリの内容を、対象のGitリポジトリのルートへコピーする。`.claude/skills`は、`.agents/skills`へのシンボリックリンクとして配置する。
2. `CONDITIONS.md`の記入欄に、目標、評価方法及び作業範囲を記載する。
3. `harness/config.json`の`deadline`に、終了時刻をタイムゾーン付きのISO 8601形式で設定する。
4. `harness/project/`のスクリプトを、対象環境に合わせて実装する。
5. ファイルをコミットする。

各スクリプトが担当する処理は、次の表による。

| スクリプト | 実装する処理 |
| --- | --- |
| `evaluate.sh` | 評価を1回実行する。合格時は終了コード0で終了し、最後に`SCORE <数値>`を出力する。数値は大きいほど良い値とし、0、負の値及び指数表記を受け付ける。タイムアウト時は、評価が起動した子プロセスも停止する。 |
| `deploy.sh` | 現在のコミットを全ての対象ホストへ反映する。 |
| `rollback.sh` | 引数で指定したコミットの状態へ、コード、データ及び設定を復元する。 |
| `verify-restart.sh` | 全ての対象ホストを再起動し、状態が復元されることを確認する。 |
| `collect.sh` | 環境変数`EVAL_START`から`EVAL_END`までの計測結果を、全ての対象ホストから引数のディレクトリへ収集し、`summary.txt`に要約する。 |

## 使い方

Claude Codeで実行する場合は、次のコマンドを使用する。

```bash
python3 harness/harness.py run --agent claude
```

Codexで実行する場合は、次のコマンドを使用する。

```bash
python3 harness/harness.py run --agent codex
```

起動したプロセスは、終了時刻又は最終段階の完了まで、エージェントの再開を繰り返す。端末を閉じた後も継続する場合は、`tmux`などのセッション内で実行する。

モデルは、`harness/config.json`の`agents`にある起動コマンドで指定する。Claude Codeには`--model <モデル名>`を、Codexには`-m <モデル名>`を指定する。

実行中の確認及び操作は、次の表による。

| 目的 | 操作 |
| --- | --- |
| 状態を確認する。 | `python3 harness/harness.py status`を実行する。 |
| 判断の経緯を確認する。 | `runs/current/journal.md`を読む。 |
| エージェントへ指示する。 | `runs/current/inbox.md`へ記載する。次のツール実行後にエージェントへ届く。 |
| 実行を停止する。 | `runs/current/STOP`を作成する。 |

## 予行

本番の前に、終了時刻を数十分後に設定し、継続、通知及び終了の動作を確認する。予行後は`runs/current/`を`runs/archive/<日時>/`へ移動し、記録で確認した失敗の原因をハーネスの設定又は手順で解消する。

## ドキュメント

作業時の指示は[AGENTS.md](AGENTS.md)に、目標及び終了時の状態は[CONDITIONS.md](CONDITIONS.md)に記載する。
