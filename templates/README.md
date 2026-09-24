# テンプレート

文書を書き始めるためのひな形である。`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

## テンプレート一覧

| 分類 | テンプレート | 概要 | 備考 |
| --- | --- | --- | --- |
| 要件定義 | [Product Requirements Document](documentation/product-requirements-document.md) | 解決する課題、成功指標、対象の利用者、機能と非機能の要求、リリースまでの計画と体制を定め、何をなぜ作るのかを関係者が承認できるようにするテンプレート。 | なし |
| 要件定義 | [Software Requirements Specification](documentation/software-requirements-specification.md) | 製品が満たす外部インターフェース、機能、サービス品質を、識別子と検証方法を付けて一つずつ定義し、実装とテストが従う契約にするテンプレート。 | IEEE 830とISO/IEC/IEEE 29148に準拠する。 |
| 設計 | [Software Design Description](documentation/software-design-description.md) | 利害関係者の関心事ごとに設計ビューを分け、構成要素、責務、相互作用と、その根拠となる設計上の決定を定義し、どの要求をどの構造が満たすのかを追跡できるようにするテンプレート。 | IEEE 1016とISO/IEC/IEEE 42010に準拠する。 |
| テスト | [Test Model Specification](documentation/test-model-specification.md) | テスト対象のうちテストで焦点を当てる特性や品質をテストモデルとして定め、テストカバレッジ項目を特定する基にするテンプレート。 | ISO/IEC/IEEE 29119-3:2021に準拠する。 |
| テスト | [Test Case Specification](documentation/test-case-specification.md) | テストモデルから特定したテストカバレッジ項目と、それを実行するテストケースの事前条件、入力、期待結果を定めるテンプレート。 | ISO/IEC/IEEE 29119-3:2021に準拠する。 |
| テスト | [Test Procedure Specification](documentation/test-procedure-specification.md) | テストケースを実行順に並べ、開始の操作、ほかの手順との関係、停止と後始末を定めるテンプレート。 | ISO/IEC/IEEE 29119-3:2021に準拠する。 |
| テスト | [Test Data Requirements](documentation/test-data-requirements.md) | テストに必要なテストデータの性質、責任、必要な期間、リセット、保管または廃棄を定めるテンプレート。 | ISO/IEC/IEEE 29119-3:2021に準拠する。 |
| テスト | [Test Environment Requirements](documentation/test-environment-requirements.md) | テスト環境の要素ごとに、必要な性質、責任、必要な期間を定めるテンプレート。 | ISO/IEC/IEEE 29119-3:2021に準拠する。 |
