#!/usr/bin/env bash
# 引数で指定したコミットの状態へ環境を戻す。
# コードに加えて、データベースのスキーマと設定、OSとミドルウェアの設定、常駐プロセスも戻す。
set -euo pipefail

commit="${1:?戻す先のコミットを指定する}"
echo "rollback.sh が未実装である（戻す先: ${commit}）。" >&2
exit 1
