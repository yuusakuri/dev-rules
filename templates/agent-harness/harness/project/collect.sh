#!/usr/bin/env bash
# 評価の時間帯（環境変数 EVAL_START から EVAL_END まで）の計測を、全ての対象ホストから引数のディレクトリへ集める。
# 集めた結果から、処理時間の合計が大きい順の上位と、前回の評価との差を summary.txt へ要約する。
set -euo pipefail

output_dir="${1:?出力先のディレクトリを指定する}"
echo "collect.sh が未実装である。" > "${output_dir}/summary.txt"
