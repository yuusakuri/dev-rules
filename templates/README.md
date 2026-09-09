# テンプレート

文書と設定ファイルを書き始めるためのひな形である。文書のテンプレートは、`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

## テンプレート一覧

| 分類 | テンプレート | 概要 | 備考 |
| --- | --- | --- | --- |
| 要件定義 | [Requirements Definition Document](documentation/requirements-definition-document.md) | 解決する課題、目的と成功指標、対象の利用者、リリースまでの計画を定め、何をなぜ作るのかを関係者が承認できるようにするテンプレート。 | なし |
| 要件定義 | [Software Requirements Specification](documentation/software-requirements-specification.md) | 製品が満たす外部インターフェース、機能、サービス品質を、識別子と検証方法を付けて一つずつ定義し、実装とテストが従う契約にするテンプレート。 | IEEE 830とISO/IEC/IEEE 29148に準拠する。 |
| 設計 | [Software Design Description](documentation/software-design-description.md) | 利害関係者の関心事ごとに設計ビューを分け、構成要素、責務、相互作用と、その根拠となる設計上の決定を定義し、どの要求をどの構造が満たすのかを追跡できるようにするテンプレート。 | IEEE 1016とISO/IEC/IEEE 42010に準拠する。 |
| 開発環境 | [Claude Codeの設定ファイル](claude/settings.json) | Claude Codeがプロジェクト全体へ適用する権限、フック、環境変数を定義するテンプレート。 |  |
