# MarkdownからDOCXへの変換

## 1 適用範囲

このガイドラインは，Markdownを編集可能なDOCXに変換する場合に適用する。Googleドキュメントへの変換も扱う。

## 2 変換方針

Markdownファイルを正本として扱う。内容を変更する場合は，その都度Markdownを修正し，DOCXを再生成する。

アンカー及びコメントだけの行は，空段落として出力しない。アンカーIDは内部リンクの参照先の検査に用い，DOCXの本文には表示しない。

リスト又は引用の中の表など，変換できない要素がある場合は，その内容を省略せずに変換を中止する。

表及びコードブロックと後続の本文の間隔は，段落の書式で設定する。表の直後には間隔のための空段落を挿入せず，空の表セル内の段落及び連続した別々の表を区別する最小の段落は保持する。

## 3 変換方法

### 3.1 環境

変換には，dev-rulesの[`docker/Dockerfile`](../../docker/Dockerfile)で作成するDockerイメージを用いる。dev-rulesのルートで次のコマンドを実行し，イメージを作成する。

```shell
docker build -t dev-rules-tools -f docker/Dockerfile .
```

### 3.2 手順

変換するMarkdownファイルがあるディレクトリで次のコマンドを実行し，DOCXを生成する。

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/data" dev-rules-tools markdown-to-docx --input-file "<input.md>" --output-file "<output.docx>" --style docx
```

コンテナは，現在のディレクトリを`/data`として読み書きする。ファイルは，現在のディレクトリからの相対パスで指定する。`markdown-to-docx`のパラメーターを[表1](#table-1)に示す。

<a id="table-1"></a>表1−変換コマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `--input-file` | `<input.md>`：変換対象のMarkdownファイル。 |
| `--output-file` | `<output.docx>`：出力するDOCXファイル。 |
| `--style` | `docx`：DOCXを最終成果物とする場合の書式。<br>`google-docs`：Googleドキュメントへ取り込む場合の書式。 |

先頭の`#`見出しをタイトルにし，冒頭のYAMLフロントマターに`subtitle: ...`があればサブタイトルにする。それ以外の見出しは，Markdownの`#`の数と同じ段階の見出しスタイルへ変換する。例えば，`##`は見出し2，`###`は見出し3になる。

“目次”の見出しには目次専用のスタイルを設定し，直後のリンク付きリストをTOCフィールドへ変換する。このフィールドは，章に用いる見出し2から目次を生成する。

Googleドキュメントが必要な場合は，生成したDOCXをGoogleドライブにアップロードし，Googleドキュメント形式に変換する。

### 3.3 図の形式及び解像度

図を画像に変換又は取得する方法は，[表2](#table-2)のガイドラインによる。

<a id="table-2"></a>表2−図の画像化に用いるガイドライン

| 図 | ガイドライン |
| --- | --- |
| Mermaidで記述した図 | [Mermaid図の画像変換ガイドライン](mermaid-image-guidelines.md) |
| PlantUMLで記述した図 | [PlantUML図の画像変換ガイドライン](plantuml-image-guidelines.md) |
| SVGの図 | [SVGからPNGへの変換ガイドライン](svg-to-png-guidelines.md) |
| PDFに含まれる図 | [PDFからの画像抽出ガイドライン](pdf-image-extraction-guidelines.md) |
| Webページに含まれる図 | [Webページからの画像取得ガイドライン](web-image-guidelines.md) |

SVGなどのベクター形式の図は，PNGに変換してからDOCXに埋め込む。Markdownから参照したSVGは，変換ツールがエラーにする。

図をドキュメントの幅に収める場合は，表示サイズを調整する。画像の解像度を下げてはならない。

元からPNG又はJPEGなどの画像である図は，元の解像度を保持する。低解像度の画像を拡大するだけで高精細な図として扱わない。

図を追加または変更する場合は，提供元の図と上下左右の端にある図形を照合し，線及び文字が途中で切れていないことを確認する。

## 4 書式

### 4.1 最終的な成果物がDOCXの場合

DOCXを最終成果物とする場合の書式を[表3](#table-3)に示す。

<a id="table-3"></a>表3−DOCX向けの書式

| 要素 | Markdown | スタイル | フォント | 文字サイズ |
| --- | --- | --- | --- | ---: |
| タイトル | 先頭の`#` | Title | Aptos Display | 28 pt |
| サブタイトル | フロントマターの`subtitle` | Subtitle | Aptos Display | 14 pt |
| 見出し1 | タイトル以外の`#` | Heading 1 | Aptos Display | 16 pt |
| 見出し2 | `##` | Heading 2 | Aptos Display | 14 pt |
| 見出し3 | `###` | Heading 3 | Aptos Display | 12 pt |
| 見出し4 | `####` | Heading 4 | Aptos Display | 12 pt |
| 見出し5 | `#####` | Heading 5 | Aptos Display | 11 pt |
| 見出し6 | `######` | Heading 6 | Aptos Display | 11 pt |
| 通常のテキスト | 段落 | Normal | Aptos | 12 pt |
| インラインコード | 行内のコード | Normal内の文字書式 | Consolas | 11 pt |
| コードブロック | コードフェンス | Normal | Consolas | 9 pt |

### 4.2 最終的な成果物がGoogleドキュメントの場合

Googleドキュメント向けの書式を[表4](#table-4)に示す。DOCXを生成する際に各要素へ表4の書式を設定し，Googleドキュメント形式へ変換する。

<a id="table-4"></a>表4−Googleドキュメント向けの書式

| 要素 | Markdown | スタイル | フォント | 文字サイズ |
| --- | --- | --- | --- | ---: |
| タイトル | 先頭の`#` | タイトル | Arial | 26 pt |
| サブタイトル | フロントマターの`subtitle` | サブタイトル | Arial | 15 pt |
| 見出し1 | タイトル以外の`#` | 見出し1 | Arial | 20 pt |
| 見出し2 | `##` | 見出し2 | Arial | 16 pt |
| 見出し3 | `###` | 見出し3 | Arial | 14 pt |
| 見出し4 | `####` | 見出し4 | Arial | 12 pt |
| 見出し5 | `#####` | 見出し5 | Arial | 11 pt |
| 見出し6 | `######` | 見出し6 | Arial | 11 pt |
| 通常のテキスト | 段落 | 標準テキスト | Arial | 11 pt |
| インラインコード | 行内のコード | 標準テキスト内の文字書式 | Roboto Mono | 11 pt |
| コードブロック | コードフェンス | 標準テキストの段落 | Roboto Mono | 9 pt |

[表3](#table-3)及び[表4](#table-4)のフォント欄は欧文に適用し，日本語にはYu Gothicを指定する。

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章 | [Google ドライブにファイルやフォルダをアップロードする - パソコン - Google ドライブ ヘルプ](https://support.google.com/drive/answer/2424368?hl=ja) | DOCXのアップロードとGoogleドキュメント形式への変換を説明する文書。 |
