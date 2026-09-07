# テンプレート

設計工程で作成する設計書のひな形である。各ファイルの`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

Markdownのテンプレートは、Nablarch開発標準が配布する設計書フォーマットと、その記入例であるサンプルプロジェクトの設計書を読み取り、章立てと表の列を保ったまま移したものである。Excelのまま使う場合は、提供元のフォーマットを直接ダウンロードする。

## テンプレート一覧

| 工程 | 分類 | テンプレート | 記載内容 |
| --- | --- | --- | --- |
| 要件定義 | 画面設計 | [画面一覧](<documentation/010_要件定義/040_画面設計/画面一覧.md>) | 機能ごとの画面IDと画面名の一覧。 |
| アプリ設計 | システム機能設計 | [システム機能一覧](<documentation/030_アプリ設計/010_システム機能設計/システム機能一覧.md>) | 機能と取引の一覧、および処理方式。 |
| アプリ設計 | システム機能設計 | [リクエスト一覧](<documentation/030_アプリ設計/010_システム機能設計/リクエスト一覧.md>) | HTTPメソッドとURLの一覧。 |
| アプリ設計 | システム機能設計 | [システム機能設計書(画面)](<documentation/030_アプリ設計/010_システム機能設計/システム機能設計書(画面).md>) | 画面の項目定義、入出力、画面イベントとその詳細。 |
| アプリ設計 | システム機能設計 | [システム機能設計書(バッチ)](<documentation/030_アプリ設計/010_システム機能設計/システム機能設計書(バッチ).md>) | バッチの起動パラメータ、処理結果、入出力データ定義、処理詳細。 |
| アプリ設計 | システム機能設計 | [システム機能設計書(Webサービス)](<documentation/030_アプリ設計/010_システム機能設計/システム機能設計書(Webサービス).md>) | APIの入出力、HTTPステータスコード別の処理結果、処理詳細。 |
| アプリ設計 | インタフェース設計 | [外部インタフェース一覧](<documentation/030_アプリ設計/030_インタフェース設計/外部インタフェース一覧.md>) | 授受するファイルと電文の一覧。 |
| アプリ設計 | インタフェース設計 | [外部インタフェース設計書](<documentation/030_アプリ設計/030_インタフェース設計/外部インタフェース設計書.md>) | ファイルまたは電文の仕様、レコード構成、データレイアウト。 |
| アプリ設計 | メッセージ設計 | [メッセージ設計書](<documentation/030_アプリ設計/050_メッセージ設計/メッセージ設計書.md>) | メッセージIDと表示文言。 |
| アプリ設計 | コード設計 | [コード設計書](<documentation/030_アプリ設計/060_コード設計/コード設計書.md>) | コードID、コード値、名称、パターン。 |
| アプリ設計 | データモデル設計 | [テーブル一覧](<documentation/030_アプリ設計/070_データモデル設計/テーブル一覧.md>) | 論理テーブル名と物理テーブル名の一覧。 |
| アプリ設計 | データモデル設計 | [テーブル定義書](<documentation/030_アプリ設計/070_データモデル設計/テーブル定義書.md>) | テーブルごとの項目定義、主キー、索引。 |
| アプリ設計 | データモデル設計 | [ドメイン定義書](<documentation/030_アプリ設計/070_データモデル設計/ドメイン定義書.md>) | 項目の型と桁数を横断的に定めるドメインと、そのバリデーション。 |
| アプリ設計 | データモデル設計 | [採番一覧](<documentation/030_アプリ設計/070_データモデル設計/採番一覧.md>) | 採番対象ごとのフォーマットとシーケンス定義。 |
| アプリ設計 | テスト仕様書 | [単体テスト仕様書](<documentation/030_アプリ設計/110_テスト仕様書/単体テスト仕様書.md>) | リクエスト単体と取引単体のテストケース。 |

## Excelフォーマットの入手先

「フォーマット」は記入前のExcelファイル、「記入例」は同じフォーマットへサンプルシステムの内容を記入したExcelファイルである。リンクを開くとファイルのダウンロードが始まる。

| テンプレート | フォーマット | 記入例 |
| --- | --- | --- |
| 画面一覧 | [画面一覧][fmt-screen-list] | [画面一覧_A1_プロジェクト管理システム][ex-screen-list] |
| システム機能一覧 | [システム機能一覧][fmt-function-list] | [システム機能一覧_A1_プロジェクト管理システム][ex-function-list] |
| リクエスト一覧 | [リクエスト一覧][fmt-request-list] | [リクエスト一覧_A1_プロジェクト管理システム][ex-request-list] |
| システム機能設計書(画面) | [システム機能設計書(画面)][fmt-func-screen] | [WA10201_プロジェクト登録][ex-func-screen] |
| システム機能設計書(バッチ) | [システム機能設計書(バッチ)][fmt-func-batch] | [BA10601_期間内プロジェクト一覧出力バッチ][ex-func-batch] |
| システム機能設計書(Webサービス) | [システム機能設計書(Webサービス)][fmt-func-ws] | [B10103_顧客登録][ex-func-ws] |
| 外部インタフェース一覧 | [外部インタフェース一覧][fmt-if-list] | [外部インタフェース一覧_A1_プロジェクト管理システム][ex-if-list] |
| 外部インタフェース設計書 | [I／Fファイル用][fmt-if-file]<br>[JSON電文用][fmt-if-json] | [N21AA002_期間内プロジェクト一覧][ex-if-file]<br>[B10103C_顧客登録要求電文][ex-if-json] |
| メッセージ設計書 | [メッセージ設計書][fmt-message] | [メッセージ設計書(画面)_A1_プロジェクト管理システム][ex-message] |
| コード設計書 | [コード設計書][fmt-code] | [コード設計書_サンプルプロジェクト][ex-code] |
| テーブル一覧 | [テーブル一覧][fmt-table-list] | [テーブル一覧_A1_プロジェクト管理システム][ex-table-list] |
| テーブル定義書 | [テーブル定義書][fmt-table-def] | [テーブル定義書_A1_プロジェクト管理システム][ex-table-def] |
| ドメイン定義書 | [ドメイン定義書][fmt-domain] | [ドメイン定義書_サンプルプロジェクト][ex-domain] |
| 採番一覧 | [採番一覧][fmt-numbering] | [採番一覧_A1_プロジェクト管理システム][ex-numbering] |
| 単体テスト仕様書 | [単体テスト仕様書(画面)][fmt-ut-screen] | [WA10201_プロジェクト登録][ex-ut-screen] |

フォーマットの全体は [Nablarch開発標準の設計ドキュメントフォーマット](https://github.com/nablarch-development-standards/nablarch-development-standards/tree/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88) に、記入例の全体は [サンプルプロジェクトの設計書](https://github.com/Fintan-contents/spring-sample-project/tree/main/%E8%A8%AD%E8%A8%88%E6%9B%B8) にある。上表にないメッセージング、帳票、メール、共通コンポーネント、ジョブフローのフォーマットも提供されている。

これらのExcelファイルは [Fintan コンテンツ 使用許諾条項](https://fintan.jp/page/295/) に基づいて提供されている。利用する際は許諾条項を確認する。

## ディレクトリ構成

```text
templates/
└── documentation/
    ├── 010_要件定義/
    │   └── 040_画面設計/
    │       └── 画面一覧.md
    └── 030_アプリ設計/
        ├── 010_システム機能設計/
        │   ├── システム機能一覧.md
        │   ├── リクエスト一覧.md
        │   ├── システム機能設計書(画面).md
        │   ├── システム機能設計書(バッチ).md
        │   └── システム機能設計書(Webサービス).md
        ├── 030_インタフェース設計/
        │   ├── 外部インタフェース一覧.md
        │   └── 外部インタフェース設計書.md
        ├── 050_メッセージ設計/
        │   └── メッセージ設計書.md
        ├── 060_コード設計/
        │   └── コード設計書.md
        ├── 070_データモデル設計/
        │   ├── テーブル一覧.md
        │   ├── テーブル定義書.md
        │   ├── ドメイン定義書.md
        │   └── 採番一覧.md
        └── 110_テスト仕様書/
            └── 単体テスト仕様書.md
```

## 取得方法

導入先のリポジトリのルートで次のコマンドを実行すると、`docs/specifications/`へMarkdownのテンプレート一式が展開される。

```bash
mkdir -p docs/specifications
curl -L https://github.com/yuusakuri/dev-rules/archive/refs/heads/main.tar.gz \
  | tar -xz -f - -C docs/specifications --strip-components=3 dev-rules-main/templates/documentation
```

特定のバージョンを取得する場合は、URL中の`main`をタグ名へ置き換え、`dev-rules-main`も`dev-rules-<タグ名>`へ置き換える。

## 使い方

1. 取得したファイルのうち、作成する設計書のテンプレートを、対象の識別子と名称を付けたファイル名へ変更する。
2. 文書情報と変更履歴を記入する。
3. 本文の`<>`で囲んだ箇所を、プロジェクトの内容へ置き換える。
4. 該当しない項目は行を削除せず、`-`または「なし」と記載する。検討漏れと記入漏れを区別できるようにするため。
5. 1つの文書に同じ構成の対象が複数含まれる場合は、対象ごとに章を複製する。

[fmt-screen-list]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/040_%E7%94%BB%E9%9D%A2%E8%A8%AD%E8%A8%88/%E7%94%BB%E9%9D%A2%E4%B8%80%E8%A6%A7_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-function-list]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E4%B8%80%E8%A6%A7_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-request-list]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E4%B8%80%E8%A6%A7_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-func-screen]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88%E6%9B%B8%28%E7%94%BB%E9%9D%A2%29_%28%E5%8F%96%E5%BC%95ID%29_%28%E5%8F%96%E5%BC%95%E5%90%8D%29.xlsx
[fmt-func-batch]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88%E6%9B%B8%28%E3%83%90%E3%83%83%E3%83%81%29_%28%E5%8F%96%E5%BC%95ID%29_%28%E5%8F%96%E5%BC%95%E5%90%8D%29.xlsx
[fmt-func-ws]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88%E6%9B%B8%28Web%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%29_%28%E5%8F%96%E5%BC%95ID%29_%28%E5%8F%96%E5%BC%95%E5%90%8D%29.xlsx
[fmt-if-list]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/030_%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88/%E5%A4%96%E9%83%A8%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E4%B8%80%E8%A6%A7_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-if-file]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/030_%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88/%E5%A4%96%E9%83%A8%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88%E6%9B%B8_%28%E3%83%95%E3%82%A1%E3%82%A4%E3%83%ABID%29_%28%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%90%8D%29_%28I%EF%BC%8FF%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%29.xlsx
[fmt-if-json]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/030_%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88/%E5%A4%96%E9%83%A8%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88%E6%9B%B8_%28%E9%9B%BB%E6%96%87ID%29_%28%E9%9B%BB%E6%96%87%E5%90%8D%29_%28JSON%29.xlsx
[fmt-message]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/070_%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E8%A8%AD%E8%A8%88/%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E8%A8%AD%E8%A8%88%E6%9B%B8_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-code]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/080_%E3%82%B3%E3%83%BC%E3%83%89%E8%A8%AD%E8%A8%88/%E3%82%B3%E3%83%BC%E3%83%89%E8%A8%AD%E8%A8%88%E6%9B%B8.xlsx
[fmt-table-list]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/090_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E4%B8%80%E8%A6%A7.xlsx
[fmt-table-def]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/090_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E5%AE%9A%E7%BE%A9%E6%9B%B8_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-domain]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/090_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E5%AE%9A%E7%BE%A9%E6%9B%B8.xlsx
[fmt-numbering]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/090_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E6%8E%A1%E7%95%AA%E4%B8%80%E8%A6%A7_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0ID%29_%28%E3%82%B5%E3%83%96%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%90%8D%29.xlsx
[fmt-ut-screen]: https://github.com/nablarch-development-standards/nablarch-development-standards/raw/main/030_%E8%A8%AD%E8%A8%88%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/010_%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88/110_%E3%83%86%E3%82%B9%E3%83%88%E4%BB%95%E6%A7%98%E6%9B%B8/%E5%8D%98%E4%BD%93%E3%83%86%E3%82%B9%E3%83%88%E4%BB%95%E6%A7%98%E6%9B%B8%28%E7%94%BB%E9%9D%A2%29_%28%E5%8F%96%E5%BC%95ID%29_%28%E5%8F%96%E5%BC%95%E5%90%8D%29.xlsx
[ex-screen-list]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/010_%E8%A6%81%E4%BB%B6%E5%AE%9A%E7%BE%A9/040_%E7%94%BB%E9%9D%A2%E8%A8%AD%E8%A8%88/%E7%94%BB%E9%9D%A2%E4%B8%80%E8%A6%A7_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-function-list]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E4%B8%80%E8%A6%A7_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-request-list]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E4%B8%80%E8%A6%A7_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-func-screen]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88%E6%9B%B8%28%E7%94%BB%E9%9D%A2%29_WA10201_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%99%BB%E9%8C%B2.xlsx
[ex-func-batch]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88%E6%9B%B8%28%E3%83%90%E3%83%83%E3%83%81%29_BA10601%EF%BC%8F%E6%9C%9F%E9%96%93%E5%86%85%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E4%B8%80%E8%A6%A7%E5%87%BA%E5%8A%9B%E3%83%90%E3%83%83%E3%83%81.xlsx
[ex-func-ws]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/B1_%E9%A1%A7%E5%AE%A2%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/010_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A9%9F%E8%83%BD%E8%A8%AD%E8%A8%88%E6%9B%B8%28Web%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%29_B10103_%E9%A1%A7%E5%AE%A2%E7%99%BB%E9%8C%B2.xlsx
[ex-if-list]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/030_%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88/%E5%A4%96%E9%83%A8%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E4%B8%80%E8%A6%A7_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-if-file]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/030_%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88/%E5%A4%96%E9%83%A8%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88%E6%9B%B8%28I%EF%BC%8FF%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%29_N21AA002%EF%BC%8F%E6%9C%9F%E9%96%93%E5%86%85%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E4%B8%80%E8%A6%A7.xlsx
[ex-if-json]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/B1_%E9%A1%A7%E5%AE%A2%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/030_%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88/%E5%A4%96%E9%83%A8%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E8%A8%AD%E8%A8%88%E6%9B%B8_B10103C_%E9%A1%A7%E5%AE%A2%E7%99%BB%E9%8C%B2%E8%A6%81%E6%B1%82%E9%9B%BB%E6%96%87_%28JSON%29.xlsx
[ex-message]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/050_%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E8%A8%AD%E8%A8%88/%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E8%A8%AD%E8%A8%88%E6%9B%B8%28%E7%94%BB%E9%9D%A2%29_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-code]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/060_%E3%82%B3%E3%83%BC%E3%83%89%E8%A8%AD%E8%A8%88/%E3%82%B3%E3%83%BC%E3%83%89%E8%A8%AD%E8%A8%88%E6%9B%B8_%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88.xlsx
[ex-table-list]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/070_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E4%B8%80%E8%A6%A7_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-table-def]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/070_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E5%AE%9A%E7%BE%A9%E6%9B%B8_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-domain]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/070_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E5%AE%9A%E7%BE%A9%E6%9B%B8_%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88.xlsx
[ex-numbering]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/070_%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB%E8%A8%AD%E8%A8%88/%E6%8E%A1%E7%95%AA%E4%B8%80%E8%A6%A7_A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.xlsx
[ex-ut-screen]: https://github.com/Fintan-contents/spring-sample-project/raw/main/%E8%A8%AD%E8%A8%88%E6%9B%B8/A1_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/030_%E3%82%A2%E3%83%97%E3%83%AA%E8%A8%AD%E8%A8%88/110_%E3%83%86%E3%82%B9%E3%83%88%E4%BB%95%E6%A7%98%E6%9B%B8/%E5%8D%98%E4%BD%93%E3%83%86%E3%82%B9%E3%83%88%E4%BB%95%E6%A7%98%E6%9B%B8_%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%83%BB%E5%8F%96%E5%BC%95%E5%8D%98%E4%BD%93%28%E7%94%BB%E9%9D%A2%29_WA10201_%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E7%99%BB%E9%8C%B2.xlsx
