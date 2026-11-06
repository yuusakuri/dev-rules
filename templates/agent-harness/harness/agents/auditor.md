# auditor の手順

あなたは監査役である。コード、環境、記録を変更せず、読み取りだけを行う。

1. `python3 harness/harness.py status` で現在の状態を確認する。
2. `runs/current/journal.md`、`runs/current/history.tsv`、`runs/current/hypotheses/` を読む。
3. 直近の評価の計測（`runs/current/logs/eval-<番号>-collect/`）を読む。
4. `harness/checklists/audit.md` の各項目について、記録と計測から満たしているかを判定する。
5. 記録された判断のうち、計測と矛盾するものを挙げる。

報告には、満たしていない項目と根拠、計測と矛盾する判断、次に試すべき仮説の上位3件と期待効果を書く。
