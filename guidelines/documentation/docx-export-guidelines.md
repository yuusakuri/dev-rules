# MarkdownからDOCXへの変換

## 1 適用範囲

このガイドラインは，Markdownを編集可能なDOCXに変換する場合に適用する。Googleドキュメントへの変換も扱う。

## 2 変換方針

Markdownファイルを正本として扱う。内容を変更する場合は，その都度Markdownを修正し，DOCXを再生成する。

MarkdownからDOCXへの変換には，このリポジトリの`tools/markdown-to-docx/convert.mjs`を使用する。Node.jsとpnpmを用意し，dev-rulesのルートで次のコマンドを実行する。1行目で変換スクリプトの依存パッケージをインストールし，2行目でこのガイドラインをDOCXへ変換する。

```shell
pnpm --dir tools/markdown-to-docx install --frozen-lockfile
node tools/markdown-to-docx/convert.mjs guidelines/documentation/docx-export-guidelines.md docx-export-guidelines.docx --target docx
```

別のMarkdownを変換する場合は，2行目の入力ファイルと出力ファイルを指定し直す。パスはコマンドを実行するディレクトリからの相対パス又は絶対パスで指定できる。先頭の`#`見出しをタイトルにし，冒頭のYAMLフロントマターに`subtitle: ...`があればサブタイトルにする。Googleドキュメントへ取り込むDOCXには`--target google-docs`を指定する。

Googleドキュメントが必要な場合は，生成したDOCXをGoogleドライブにアップロードし，Googleドキュメント形式に変換する。

## 3 書式

### 3.1 最終的な成果物がDOCXの場合

DOCXを最終成果物とする場合の書式を[表1](#table-1)に示す。

<a id="table-1"></a>表1−DOCX向けの書式

| 要素 | スタイル | フォント | 文字サイズ |
| --- | --- | --- | ---: |
| タイトル | Title | Aptos Display | 28 pt |
| サブタイトル | Subtitle | Aptos Display | 14 pt |
| 見出し1 | Heading 1 | Aptos Display | 16 pt |
| 見出し2 | Heading 2 | Aptos Display | 14 pt |
| 見出し3 | Heading 3 | Aptos Display | 12 pt |
| 通常のテキスト | Normal | Aptos | 12 pt |
| インラインコード | Normal内の文字書式 | Consolas | 11 pt |
| コードブロック | Normal | Consolas | 9 pt |

### 3.2 最終的な成果物がGoogleドキュメントの場合

Googleドキュメント向けの書式を[表2](#table-2)に示す。DOCXを生成する際に表の書式を設定し，Googleドキュメント形式へ変換する。

<a id="table-2"></a>表2−Googleドキュメント向けの書式

| 要素 | スタイル | フォント | 文字サイズ |
| --- | --- | --- | ---: |
| タイトル | タイトル | Arial | 26 pt |
| サブタイトル | サブタイトル | Arial | 15 pt |
| 見出し1 | 見出し1 | Arial | 20 pt |
| 見出し2 | 見出し2 | Arial | 16 pt |
| 見出し3 | 見出し3 | Arial | 14 pt |
| 通常のテキスト | 標準テキスト | Arial | 11 pt |
| インラインコード | 標準テキスト内の文字書式 | Roboto Mono | 11 pt |
| コードブロック | 標準テキストの段落 | Roboto Mono | 9 pt |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2章 | [Google ドライブにファイルやフォルダをアップロードする - パソコン - Google ドライブ ヘルプ](https://support.google.com/drive/answer/2424368?hl=ja) | DOCXのアップロードとGoogleドキュメント形式への変換を説明する文書。 |
| 3章 | [ドキュメントにタイトル、見出し、目次を追加する - パソコン - Google ドキュメント エディタ ヘルプ](https://support.google.com/docs/answer/116338?hl=ja) | Googleドキュメントのタイトル及び見出しスタイルを説明する文書。 |
