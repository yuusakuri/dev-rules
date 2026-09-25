# テンプレート

文書を書き始めるためのひな形である。`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

## テンプレート一覧

| 分類 | テンプレート | 概要 | 備考 |
| --- | --- | --- | --- |
| 要件定義 | [Product Requirements Document](documentation/product-requirements-document.md) | 解決する課題、成功指標、対象の利用者、機能と非機能の要求、リリースまでの計画と体制を定め、何をなぜ作るのかを関係者が承認できるようにするテンプレート。 | なし |
| 要件定義 | [Software Requirements Specification](documentation/software-requirements-specification.md) | 製品が満たす外部インターフェース、機能、サービス品質を、識別子と検証方法を付けて一つずつ定義し、実装とテストが従う契約にするテンプレート。 | IEEE 830とISO/IEC/IEEE 29148に準拠する。 |
| 設計 | [Software Design Description](documentation/software-design-description.md) | 利害関係者の関心事ごとに設計ビューを分け、構成要素、責務、相互作用と、その根拠となる設計上の決定を定義し、どの要求をどの構造が満たすのかを追跡できるようにするテンプレート。 | IEEE 1016とISO/IEC/IEEE 42010に準拠する。 |
| テスト | [Test Plan](documentation/test-plan.md) | テストの目的、範囲、リスク、設計方針、日程、判定基準、環境とデータの要件、体制を定め、テスト設計、実装、実行の指針にするテンプレート。 | ISO/IEC/IEEE 29119-3のテスト計画書との対応を[テスト文書ガイドライン](../guidelines/documentation/test-documentation-guidelines.md)に示す。 |
| テスト | [Test Design Specification](documentation/test-design-specification.md) | テスト対象と観点を細分化し、テストマップ、機能動作確認一覧、テスト明細を経てテストケースへ落とし込むテンプレート。 | ISO/IEC/IEEE 29119-3のテストモデル仕様書との対応を[テスト文書ガイドライン](../guidelines/documentation/test-documentation-guidelines.md)に示す。 |
| テスト | [Test Case Specification](documentation/test-case-specification.md) | 実行前に、テスト対象、観点、実行条件、実行手順、期待結果、参照を定めるテンプレート。 | ISO/IEC/IEEE 29119-3のテストケース仕様書との対応を[テスト文書ガイドライン](../guidelines/documentation/test-documentation-guidelines.md)に示す。 |
