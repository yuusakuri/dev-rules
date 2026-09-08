# テンプレート

文書を書き始めるためのひな形である。各ファイルの`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

## テンプレート一覧

| 工程 | テンプレート | 記載内容 |
| --- | --- | --- |
| 要件定義 | [Requirements Definition Document](documentation/requirements-definition-document.md) | 解決する課題、目的と成功指標、利用者とユースケース、機能要件と非機能要件、リリース計画、リスク、体制。 |
| 要件定義 | [Software Requirements Specification](documentation/software-requirements-specification.md) | 製品の範囲と前提、外部インターフェース、機能要求、サービス品質、法令と規格への適合、設計と実装の制約、AIと機械学習の要求、検証。 |
| 設計 | [Software Design Description](documentation/software-design-description.md) | 設計の対象範囲、利害関係者の関心事、選択したビューポイント、設計ビュー、設計上の決定。 |

Requirements Definition Documentは、何を作り、なぜ作るのかを関係者と合意するために書く。Software Requirements Specificationは、合意した内容を実装と検証ができる要求へ落とし込むために書く。Software Design Descriptionは、その要求をどのような構造で実現するのかを示すために書く。

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
