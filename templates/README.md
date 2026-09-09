# テンプレート

文書を書き始めるためのひな形である。各ファイルの`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

## テンプレート一覧

| 分類 | テンプレート | 概要 | 備考 |
| --- | --- | --- | --- |
| 要件定義 | [Requirements Definition Document](documentation/requirements-definition-document.md) | 何を作り、なぜ作るのかを関係者と合意するためのテンプレート。 | なし |
| 要件定義 | [Software Requirements Specification](documentation/software-requirements-specification.md) | 合意した内容を、実装と検証ができる要求へ落とし込むためのテンプレート。 | IEEE 830とISO/IEC/IEEE 29148に準拠する。 |
| 設計 | [Software Design Description](documentation/software-design-description.md) | その要求をどのような構造で実現するのかを示すためのテンプレート。 | IEEE 1016とISO/IEC/IEEE 42010に準拠する。 |

## 取得方法

文書を置くディレクトリで次のコマンドを実行し、テンプレートを取得する。`<テンプレートのファイル名>`は、テンプレート一覧のリンク先のファイル名へ置き換える。配置先は[リポジトリガイドライン](../guidelines/development/repository-guidelines.md)の構成に従う。

```bash
curl -O https://raw.githubusercontent.com/yuusakuri/dev-rules/main/templates/documentation/<テンプレートのファイル名>
```

特定のバージョンを取得する場合は、URL中の`main`をタグ名へ置き換える。

## 使い方

1. 取得したファイルを、対象を指す名称を付けたファイル名へ変更する。
2. 文書情報と変更履歴を記入する。
3. 本文の`<>`で囲んだ箇所を、プロジェクトの内容へ置き換える。
4. 該当しない項目は行を削除せず、「対象外」と理由を記載する。検討漏れと記入漏れを区別できるようにするため。
5. 同じ構成の対象が複数ある場合は、対象ごとに章を複製する。
