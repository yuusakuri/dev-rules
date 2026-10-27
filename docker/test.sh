#!/usr/bin/env bash
# Builds the tools image and runs the commands that guidelines/documentation describes.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
image="${IMAGE:-dev-rules-tools}"
# Docker Desktop alternatives such as Colima share only the home directory, so work inside the repository.
work="$(mktemp -d "$root/.docker-test.XXXXXX")"
trap '[ -n "${KEEP:-}" ] || rm -rf "$work"' EXIT

run() { docker run --rm -u "$(id -u):$(id -g)" -v "$work:/data" "$image" "$@"; }
long_side() { run magick identify -format '%[fx:max(w,h)]' "$1"; }
fail() { echo "FAIL: $*" >&2; exit 1; }
step() { echo "== $*"; }

step "build"
docker build -q -t "$image" -f "$root/docker/Dockerfile" "$root" >/dev/null

step "unit tests"
run sh -c 'cd /opt/dev-rules/tools/svg-to-png && node --test convert.test.mjs' >/dev/null
run sh -c 'cd /opt/dev-rules/tools/markdown-to-docx && node --test convert.test.mjs' >/dev/null

step "mermaid"
mkdir -p "$work/docs/diagrams" "$work/docs/images"
echo '{ "htmlLabels": false }' > "$work/mermaid-config.json"
cat > "$work/docs/diagrams/order-flow.mmd" <<'EOF'
flowchart LR
  accTitle: 注文処理の流れ
  accDescr: 注文を受け付けて在庫を確認し，在庫があれば出荷する流れ
  A[注文を受け付ける] --> B{在庫がある?}
  B -- はい --> C[出荷する]
  B -- いいえ --> D[入荷を待つ]
EOF
run mmdc -c mermaid-config.json -i docs/diagrams/order-flow.mmd -o docs/images/order-flow.svg >/dev/null
grep -q foreignObject "$work/docs/images/order-flow.svg" && fail "mermaid SVG has foreignObject"
grep -q '注文を受け付ける' "$work/docs/images/order-flow.svg" || fail "mermaid SVG lacks the label"
run mmdc -c mermaid-config.json -i docs/diagrams/order-flow.mmd -o docs/images/order-flow.png --size 3840 >/dev/null
[ "$(long_side docs/images/order-flow.png)" -ge 3840 ] || fail "mermaid PNG is smaller than 3840 pixels"
printf '# 手順\n\n```mermaid\nflowchart LR\n  accTitle: 流れ\n  accDescr: 開始から終了まで\n  A[開始] --> B[終了]\n```\n' > "$work/docs/guide.md"
run mmdc -c mermaid-config.json -i docs/guide.md -o docs/guide.export.md -a docs/export >/dev/null
grep -q '](./export/' "$work/docs/guide.export.md" || grep -q '](export/' "$work/docs/guide.export.md" || fail "mermaid Markdown was not rewritten"

step "plantuml"
cat > "$work/docs/diagrams/order-sequence.puml" <<'EOF'
@startuml
title 注文の受付
actor 利用者
participant API
database 注文DB
利用者 -> API : 注文を送信する
API -> 注文DB : 注文を保存する
API --> 利用者 : 受付番号を返す
@enduml
EOF
run plantuml --check-syntax --charset UTF-8 "docs/diagrams/*.puml" >/dev/null
run plantuml --check-before-run --charset UTF-8 --svg --output-dir ../images "docs/diagrams/*.puml" >/dev/null
grep -q '注文の受付' "$work/docs/images/order-sequence.svg" || fail "PlantUML SVG lacks the title"
run svg-to-png --input-file docs/images/order-sequence.svg --output-file docs/images/order-sequence.png >/dev/null
[ "$(long_side docs/images/order-sequence.png)" -eq 3840 ] || fail "PlantUML PNG long side is not 3840 pixels"
mkdir -p "$work/bad/diagrams"
printf '@startuml\nA -> B : ok\nthis is not valid ((\n@enduml\n' > "$work/bad/diagrams/broken.puml"
if run plantuml --check-before-run --charset UTF-8 --svg --output-dir ../images "bad/diagrams/*.puml" >/dev/null 2>&1; then
  fail "PlantUML accepted a broken diagram"
fi
[ -z "$(ls -A "$work/bad/images" 2>/dev/null)" ] || fail "PlantUML wrote images for a broken diagram"

step "pdf"
# A page with a vector figure above a raster image that has a transparency mask.
run magick -size 40x20 xc:none -fill '#0050a0' -draw 'rectangle 0,0 19,19' badge.png
cat > "$work/page.html" <<'EOF'
<!doctype html>
<style>@page { size: 400pt 300pt; margin: 0 } body { margin: 0 }</style>
<svg style="position:absolute; left:40pt; top:40pt" width="120pt" height="60pt" viewBox="0 0 120 60">
  <rect x="1" y="1" width="118" height="58" fill="none" stroke="#000" stroke-width="2"/>
</svg>
<img src="badge.png" style="position:absolute; left:40pt; top:200pt; width:40pt; height:20pt">
EOF
run chromium --headless --no-pdf-header-footer --print-to-pdf=/data/input.pdf file:///data/page.html >/dev/null 2>&1
images="$(run pdfimages -list -f 1 -l 1 input.pdf)"
grep -q ' image ' <<<"$images" || fail "pdfimages did not list the raster image"
grep -q ' smask ' <<<"$images" || fail "pdfimages did not list the transparency mask"
run pdftotext -f 1 -l 1 -bbox-layout input.pdf 1.html
# Search area: 0,0 to 400x150 pt, rendered at 288 dpi.
run pdftocairo -png -singlefile -r 288 -f 1 -l 1 -x 0 -y 0 -W 1600 -H 600 input.pdf area
read -r w h x y <<<"$(run magick area.png -fuzz 3% -trim -format '%w %h %X %Y' info:)"
x=${x#+}; y=${y#+}
# Convert pixels to points, widen by 2 pt on each side, and round outwards.
fig_x=$(( x / 4 - 2 )); fig_y=$(( y / 4 - 2 ))
fig_w=$(( (x + w + 3) / 4 + 2 - fig_x )); fig_h=$(( (y + h + 3) / 4 + 2 - fig_y ))
[ "$fig_x" -eq 37 ] && [ "$fig_y" -eq 37 ] && [ "$fig_w" -eq 125 ] && [ "$fig_h" -eq 65 ] || fail "unexpected figure area: $fig_x $fig_y $fig_w $fig_h"
# The page is landscape, so the paper width and height are swapped.
run pdftocairo -pdf -f 1 -l 1 -x "$fig_x" -y "$fig_y" -W "$fig_w" -H "$fig_h" -paperw "$fig_h" -paperh "$fig_w" input.pdf figure.pdf
run pdftocairo -svg figure.pdf figure.svg
grep -q "width=\"${fig_w}\" height=\"${fig_h}\"" "$work/figure.svg" || fail "figure SVG does not match the cropped area"
run svg-to-png --input-file figure.svg --output-file figure.png >/dev/null
[ "$(long_side figure.png)" -eq 3840 ] || fail "figure PNG long side is not 3840 pixels"
run pdfimages -all -f 1 -l 1 input.pdf img
run magick img-000.png img-001.png -compose CopyOpacity -composite badge-out.png
[ "$(run magick identify -format '%w %h %A' badge-out.png)" = "$(run magick identify -format '%w %h' img-000.png) Blend" ] || fail "raster image lost its pixels or alpha"
[ "$(run magick badge-out.png -format '%[pixel:p{30,10}]' info:)" = "srgba(0,0,0,0)" ] || fail "transparent area is not transparent"

step "markdown-to-docx"
cp "$work/docs/images/order-sequence.png" "$work/docs/order.png"
printf '# 注文\n\n![注文の受付](order.png)\n' > "$work/docs/doc.md"
run markdown-to-docx --input-file docs/doc.md --output-file docs/doc.docx --style docx >/dev/null
[ -s "$work/docs/doc.docx" ] || fail "DOCX was not written"
printf '# 注文\n\n![注文の受付](images/order-sequence.svg)\n' > "$work/docs/svg.md"
if run markdown-to-docx --input-file docs/svg.md --output-file docs/svg.docx --style docx >/dev/null 2>&1; then
  fail "markdown-to-docx accepted an SVG image"
fi

echo "OK"
