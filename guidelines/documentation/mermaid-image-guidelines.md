# Mermaid図の画像変換ガイドライン

## 1 適用範囲

このガイドラインは，Mermaidで記述した図をSVG又はPNGに変換し，Markdownに埋め込んでDOCXへ変換する場合に適用する。

MarkdownからDOCXへの変換方法は，[MarkdownからDOCXへの変換ガイドライン](docx-export-guidelines.md)による。

## 2 変換方針

図の定義ファイルを正本として扱う。図を変更する場合は，定義ファイルを修正して画像を再生成する。生成した画像は直接編集しない。

画像の形式はSVGを標準とする。MarkdownからDOCXへの変換ツールは，SVGを保持し，SVGに対応しない表示環境のためのPNGを併せて格納する。PNGは，SVGを扱えない変換ツール又は表示先へ画像を渡す場合に限って生成する。

ラベルの文字は，SVGの`text`要素で描画する。Mermaidは，既定ではラベルをHTMLで描画し，SVG内に`foreignObject`要素を出力する。`foreignObject`の中身は，Wordなど多くのSVG表示環境及びDOCX変換ツールが互換表示用のPNGを生成する処理で描画されず，ラベルの文字が欠落する。このため，[6章](#6-設定ファイル)の設定でHTMLラベルを無効にする。

## 3 変換環境

変換に必要な環境を[表1](#table-1)に示す。

<a id="table-1"></a>表1−変換環境

| 項目 | 要件 |
| --- | --- |
| Node.js | 22.13.0以上。Mermaid CLI 12.0.0の動作要件である。 |
| Mermaid CLI | `@mermaid-js/mermaid-cli` 12.0.0。プロジェクトの開発依存関係として版を固定し，ロックファイルで管理する。 |
| Chromium | Mermaid CLIは，Chromiumで図を描画する。Mermaid CLIのインストール時にPuppeteerが取得する。 |
| 日本語フォント | 日本語を描画できるフォント。変換環境に導入されていない場合，日本語の文字が正しく描画されない。 |

プロジェクトのルートで次のコマンドを実行し，Mermaid CLIを導入する。

```shell
npm install --save-dev --save-exact @mermaid-js/mermaid-cli@12.0.0
```

## 4 ファイルの配置

ファイルの配置を[表2](#table-2)に示す。

<a id="table-2"></a>表2−ファイルの配置

| パス | 内容 |
| --- | --- |
| `mermaid-config.json` | Mermaidの設定ファイル。プロジェクトのルートに置く。 |
| `docs/diagrams/<name>.mmd` | 図の定義ファイル。1ファイルに1図を記述する。 |
| `docs/images/<name>.svg` | 定義ファイルから生成したSVG。定義ファイルと同じ名前にする。 |
| `docs/images/<name>.png` | 定義ファイルから生成したPNG。必要な場合に限って生成する。 |

DOCX変換ツールはMarkdownから参照されたローカルの画像ファイルを読み込むため，生成した画像は定義ファイルと同じコミットに含める。

## 5 図の定義

図の定義には，`accTitle`で図の題名を，`accDescr`で図の内容の説明を記述する。これらは，SVGの`title`要素及び`desc`要素になり，[7.3](#73-markdown内のコードブロックの変換)の変換では画像の代替テキストになる。

次の例は，注文処理の流れを示すフローチャートの定義である。

```text
flowchart LR
  accTitle: 注文処理の流れ
  accDescr: 注文を受け付けて在庫を確認し，在庫があれば出荷する流れ
  A[注文を受け付ける] --> B{在庫がある?}
  B -- はい --> C[出荷する]
  B -- いいえ --> D[入荷を待つ]
```

## 6 設定ファイル

`mermaid-config.json`に次の設定を記述し，HTMLラベルを無効にする。

```json
{
  "htmlLabels": false
}
```

設定ファイルは，変換コマンドの`-c`で指定する。図ごとのフロントマターでも設定できるが，全ての図に同じ設定を適用するため，設定ファイルを用いる。

## 7 変換手順

### 7.1 SVGへの変換

次のコマンドで，定義ファイルをSVGに変換する。

```shell
npx mmdc -c mermaid-config.json -i docs/diagrams/order-flow.mmd -o docs/images/order-flow.svg
```

変換コマンドのパラメーターを[表3](#table-3)に示す。

<a id="table-3"></a>表3−変換コマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `-c` | Mermaidの設定ファイル。 |
| `-i` | 入力ファイル。定義ファイル又はMarkdownファイルを指定する。 |
| `-o` | 出力ファイル。拡張子で出力形式が決まる。 |
| `-a` | 入力がMarkdownファイルの場合に，画像を出力するディレクトリ。 |
| `--size` | PNGの長辺のピクセル数。 |

### 7.2 PNGへの変換

PNGは，長辺3840ピクセル以上で生成する。`--size`を指定しない場合，PNGは図の表示サイズと同じピクセル数になり，解像度が不足する。

```shell
npx mmdc -c mermaid-config.json -i docs/diagrams/order-flow.mmd -o docs/images/order-flow.png --size 3840
```

`--size`は，図の種類によって効かない場合がある。生成後に，PNGの長辺が3840ピクセル以上であることを確認する。

### 7.3 Markdown内のコードブロックの変換

Markdownに`mermaid`のコードブロックで図を記述した場合は，Markdownファイルを入力にする。Mermaid CLIは，コードブロックごとに画像を生成し，コードブロックを画像への参照に置き換えたMarkdownを出力する。

```shell
npx mmdc -c mermaid-config.json -i docs/guide.md -o docs/guide.export.md -a docs/export
```

変換後のMarkdownは，元のMarkdownと同じディレクトリに出力する。別のディレクトリへ出力すると，元のMarkdownにある他の画像やリンクの相対パスが変わる。

コードブロックに`accDescr`がない場合，代替テキストは`diagram`になる。全てのコードブロックに`accTitle`及び`accDescr`を記述する。

変換後のMarkdown及び画像は生成物として扱い，編集しない。DOCXへは，変換後のMarkdownを入力して変換する。

### 7.4 Dockerでの変換

Node.jsを導入しない環境では，公式のDockerイメージで変換する。イメージには，Chromium及び日本語フォントが含まれる。

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/data" \
  ghcr.io/mermaid-js/mermaid-cli/mermaid-cli:12.0.0 \
  -c mermaid-config.json -i docs/diagrams/order-flow.mmd -o docs/images/order-flow.svg
```

イメージは，`/data`を作業ディレクトリとしてMermaid CLIを実行する。パラメーターは[表3](#table-3)と同じである。

Docker Desktopは使用しない。Docker Engineを使用する（[フリーソフト使用規則](../development/free-software-usage-rules.md)参照）。

## 8 DOCXへの埋込み

Markdownには，画像を単独の段落として記載し，Markdownファイルからの相対パスで参照する。代替テキストには，`accTitle`と同じ図の題名を記載する。

```markdown
![注文処理の流れ](images/order-flow.svg)
```

画像を埋め込んだMarkdownは，[MarkdownからDOCXへの変換ガイドライン](docx-export-guidelines.md)の手順でDOCXに変換する。

## 9 確認

変換後に，[表4](#table-4)の項目を確認する。

<a id="table-4"></a>表4−確認項目

| 項目 | 確認方法 |
| --- | --- |
| 変換の成否 | 変換コマンドの終了ステータスが0である。図の構文に誤りがある場合，Mermaid CLIは0以外で終了し，画像を出力しない。 |
| HTMLラベル | `grep -l foreignObject docs/images/*.svg`の出力が空である。 |
| PNGの解像度 | PNGの長辺が3840ピクセル以上である。 |
| 文字 | 生成した画像及びDOCX内の図で，ラベルの文字が欠けず，日本語が正しく表示される。 |
| 代替テキスト | Markdownの画像及びDOCX内の図に，図の題名が代替テキストとして設定されている。 |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章<br>7章 | [GitHub - mermaid-js/mermaid-cli: Command line tool for the Mermaid library · GitHub](https://github.com/mermaid-js/mermaid-cli) | Mermaid CLIの導入方法，パラメーター，Markdownの変換及びDockerでの実行方法を説明する文書。 |
| 5章 | [Accessibility Options \| Mermaid](https://mermaid.js.org/config/accessibility.html) | `accTitle`及び`accDescr`による図の題名及び説明の記述方法を説明する文書。 |
| 6章 | [Mermaid Config Schema \| Mermaid](https://mermaid.js.org/config/schema-docs/config.html) | `htmlLabels`を含むMermaidの設定項目を定義する文書。 |
| 7.4 | [mermaid-cli/Dockerfile at 12.0.0 · mermaid-js/mermaid-cli · GitHub](https://github.com/mermaid-js/mermaid-cli/blob/12.0.0/Dockerfile) | 公式Dockerイメージの作業ディレクトリ，実行ユーザー及び起動コマンドを定義するファイル。 |
| 7.4 | [mermaid-cli/install-dependencies.sh at 12.0.0 · mermaid-js/mermaid-cli · GitHub](https://github.com/mermaid-js/mermaid-cli/blob/12.0.0/install-dependencies.sh) | 公式DockerイメージへChromium及び日本語を含むフォントを導入するスクリプト。 |
