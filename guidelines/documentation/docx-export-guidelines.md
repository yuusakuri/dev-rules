# MarkdownからDOCXへの変換ガイドライン

## 1 適用範囲

このガイドラインは，Markdownを編集可能なDOCXに変換する場合に適用する。Googleドキュメントへの変換も扱う。

## 2 変換方針

Markdownファイルを正本として扱う。内容を変更する場合は，その都度Markdownを修正し，DOCXを再生成する。

MarkdownからDOCXへの変換は，スクリプトで自動実行する。例えば，`sdv-study`では`scripts/export_docx.mjs`がMarkdownをDOCXへ変換し，次のコマンドで資料のDOCXを生成する。

```shell
pnpm docs:docx
```

Googleドキュメントが必要な場合は，生成したDOCXをGoogleドライブにアップロードし，Googleドキュメント形式に変換する。Googleドライブの設定で「アップロードしたファイルを Google ドキュメント エディタ形式に変換する」を有効にしてからアップロードする。

## 3 書式

### 3.1 最終的な成果物がDOCXの場合

DOCXの書式は，対象文書で指定されたWordのスタイル又はテンプレートに従う。Markdownの見出しは，対応するWordの見出しスタイルに変換する。

### 3.2 最終的な成果物がGoogleドキュメントの場合

Googleドキュメント向けの書式を[表1](#table-1)に示す。DOCXを生成する際に表の書式を設定し，Googleドキュメント形式へ変換する。

<a id="table-1"></a>表1−Googleドキュメント向けの書式

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
