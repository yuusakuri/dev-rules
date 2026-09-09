# テンプレート

文書と設定ファイルを書き始めるためのひな形である。

## テンプレート一覧

| 分類 | テンプレート | 概要 | 備考 |
| --- | --- | --- | --- |
| 要件定義 | [Requirements Definition Document](documentation/requirements-definition-document.md) | 何を作り、なぜ作るのかを関係者と合意するためのテンプレート。 | なし |
| 要件定義 | [Software Requirements Specification](documentation/software-requirements-specification.md) | 合意した内容を、実装と検証ができる要求へ落とし込むためのテンプレート。 | IEEE 830とISO/IEC/IEEE 29148に準拠する。 |
| 設計 | [Software Design Description](documentation/software-design-description.md) | その要求をどのような構造で実現するのかを示すためのテンプレート。 | IEEE 1016とISO/IEC/IEEE 42010に準拠する。 |
| 開発環境 | [Claude Codeの設定ファイル](claude/settings.json) | Claude Codeへ確認を求めさせずにツールを実行させるためのテンプレート。 | `mcp__*__send_later`だけを禁止する。リポジトリへコミットして共有し、個人の設定は`.claude/settings.local.json`へ書く。 |

## 取得方法

ファイルを置くディレクトリで次のコマンドを実行し、テンプレートを取得する。`<テンプレートのパス>`は、テンプレート一覧のリンク先のパスへ置き換える。配置先は[リポジトリガイドライン](../guidelines/development/repository-guidelines.md)の構成に従う。

```bash
curl -O https://raw.githubusercontent.com/yuusakuri/dev-rules/main/templates/<テンプレートのパス>
```

特定のバージョンを取得する場合は、URL中の`main`をタグ名へ置き換える。

## 文書のテンプレートの使い方

1. 取得したファイルを、対象を指す名称を付けたファイル名へ変更する。
2. 文書情報と変更履歴を記入する。
3. 本文の`<>`で囲んだ箇所を、プロジェクトの内容へ置き換える。
4. 該当しない項目は行を削除せず、「対象外」と理由を記載する。検討漏れと記入漏れを区別できるようにするため。
5. 同じ構成の対象が複数ある場合は、対象ごとに章を複製する。

## 設定ファイルのテンプレートの使い方

1. 取得したファイルを`.claude/settings.json`へ配置する。
2. 実行させないツールがある場合は、`permissions.deny`へツール名を書き足す。禁止は`bypassPermissions`でも適用されるため、確認を求めない設定と併用できる。

`defaultMode`を`bypassPermissions`にすると、Claude Codeは権限の確認を求めずにツールを実行する。この設定では`permissions.allow`は働かないため、許可する対象を挙げる必要はない。取り消しの効かない操作もそのまま実行されるため、コンテナや使い捨ての環境のように、被害が及ばない場所で使う。
