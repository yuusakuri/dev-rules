# MarkdownからDOCXへの変換

## 1 適用範囲

このガイドラインは，Markdownを編集可能なDOCXに変換する場合に適用する。Googleドキュメントへの変換も扱う。

## 2 変換方針

Markdownファイルを正本として扱う。内容を変更する場合は，その都度Markdownを修正し，DOCXを再生成する。

## 3 変換方法

### 3.1 環境

変換に必要な環境を[表1](#table-1)に示す。

<a id="table-1"></a>表1−変換環境

| 項目 | 要件 |
| --- | --- |
| Node.js | 20.9.0以上。 |
| pnpm | 10.28.2。 |

### 3.2 手順

MarkdownからDOCXへの変換には，このリポジトリの`tools/markdown-to-docx/convert.mjs`を使用する。dev-rulesのルートで次のコマンドを実行する。

```shell
pnpm --dir tools/markdown-to-docx install --frozen-lockfile
node tools/markdown-to-docx/convert.mjs --input-file "<input.md>" --output-file "<output.docx>" --style docx
```

1行目で依存パッケージをインストールし，2行目でDOCXを生成する。2行目のパラメーターを[表2](#table-2)に示す。

<a id="table-2"></a>表2−変換コマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `--input-file` | `<input.md>`：変換対象のMarkdownファイル。相対パス又は絶対パスを指定する。 |
| `--output-file` | `<output.docx>`：出力するDOCXファイル。相対パス又は絶対パスを指定する。 |
| `--style` | `docx`：DOCXを最終成果物とする場合の書式。<br>`google-docs`：Googleドキュメントへ取り込む場合の書式。 |

先頭の`#`見出しをタイトルにし，冒頭のYAMLフロントマターに`subtitle: ...`があればサブタイトルにする。

Googleドキュメントが必要な場合は，生成したDOCXをGoogleドライブにアップロードし，Googleドキュメント形式に変換する。

## 4 書式

### 4.1 最終的な成果物がDOCXの場合

DOCXを最終成果物とする場合の書式を[表3](#table-3)に示す。

<a id="table-3"></a>表3−DOCX向けの書式

| 要素 | Markdown | スタイル | フォント | 文字サイズ |
| --- | --- | --- | --- | ---: |
| タイトル | `#` | Title | Aptos Display | 28 pt |
| サブタイトル | フロントマターの`subtitle` | Subtitle | Aptos Display | 14 pt |
| 見出し1 | `##` | Heading 1 | Aptos Display | 16 pt |
| 見出し2 | `###` | Heading 2 | Aptos Display | 14 pt |
| 見出し3 | `####` | Heading 3 | Aptos Display | 12 pt |
| 見出し4 | `#####` | Heading 4 | Aptos Display | 12 pt |
| 見出し5 | `######` | Heading 5 | Aptos Display | 11 pt |
| 通常のテキスト | 段落 | Normal | Aptos | 12 pt |
| インラインコード | 行内のコード | Normal内の文字書式 | Consolas | 11 pt |
| コードブロック | コードフェンス | Normal | Consolas | 9 pt |

### 4.2 最終的な成果物がGoogleドキュメントの場合

Googleドキュメント向けの書式を[表4](#table-4)に示す。DOCXを生成する際に各要素へ表4の書式を設定し，Googleドキュメント形式へ変換する。

<a id="table-4"></a>表4−Googleドキュメント向けの書式

| 要素 | Markdown | スタイル | フォント | 文字サイズ |
| --- | --- | --- | --- | ---: |
| タイトル | `#` | タイトル | Arial | 26 pt |
| サブタイトル | フロントマターの`subtitle` | サブタイトル | Arial | 15 pt |
| 見出し1 | `##` | 見出し1 | Arial | 20 pt |
| 見出し2 | `###` | 見出し2 | Arial | 16 pt |
| 見出し3 | `####` | 見出し3 | Arial | 14 pt |
| 見出し4 | `#####` | 見出し4 | Arial | 12 pt |
| 見出し5 | `######` | 見出し5 | Arial | 11 pt |
| 通常のテキスト | 段落 | 標準テキスト | Arial | 11 pt |
| インラインコード | 行内のコード | 標準テキスト内の文字書式 | Roboto Mono | 11 pt |
| コードブロック | コードフェンス | 標準テキストの段落 | Roboto Mono | 9 pt |

[表3](#table-3)及び[表4](#table-4)のフォント欄は欧文に適用し，日本語にはYu Gothicを指定する。

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章 | [Google ドライブにファイルやフォルダをアップロードする - パソコン - Google ドライブ ヘルプ](https://support.google.com/drive/answer/2424368?hl=ja) | DOCXのアップロードとGoogleドキュメント形式への変換を説明する文書。 |
