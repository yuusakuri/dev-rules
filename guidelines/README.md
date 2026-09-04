# 規則の選び方

このファイルを規則文書の索引と適用判断の正とする。作業内容に一致する行をすべて選び、上から順に読む。

## 規則一覧

| 分類 | 文書 | 概要 | 先に読む文書 |
| --- | --- | --- | --- |
| 共通 | [共通設計原則](core/software-design-guidelines.md) | 責務の分離、依存関係の管理、複雑性の制御など、ソフトウェア開発に共通する設計原則。 | なし |
| 共通 | [アプリケーション設計規則](core/application-design-guidelines.md) | アプリケーションの設計規則。 | 共通設計原則 |
| 共通 | [リポジトリ規則](core/repository-guidelines.md) | リポジトリに共通するファイル、ディレクトリの役割。 | なし |
| 共通 | [Git規則](core/git-guidelines.md) | Gitを使った開発フローの規則。 | なし |
| 実装 | [TypeScript](implementation/typescript-guidelines.md) | TypeScript固有の追加規則。 | 共通設計原則、アプリケーション設計規則 |
| 実装 | [Rust](implementation/rust-guidelines.md) | Rust固有の規則。 | 共通設計原則、アプリケーション設計規則 |
| 実装 | [Flutter](implementation/flutter-guidelines.md) | Flutterアプリケーションの言語、フレームワーク固有規則。 | 共通設計原則、アプリケーション設計規則 |
| 実装 | [Windows PowerShellモジュール](implementation/windows-powershell-module-guidelines.md) | Windows PowerShell 5.1向けモジュールの開発に関する規則。 | 共通設計原則、リポジトリ規則 |
| デザイン | [デザインシステム](ui/design-system.md) | UIを持つWebプロジェクトの視覚表現、レイアウト、状態、動きを変更する。 | 実装を伴う場合は共通設計原則、アプリケーション設計規則、該当する実装規則 |
| デザイン | [Web UI](ui/web-ui-guidelines.md) | 特定のフレームワーク、ライブラリ、言語に依存しないWebデザイン基盤。 | デザインシステム。実装を伴う場合は共通設計原則、アプリケーション設計規則、該当する実装規則 |
| 仕様書 | [仕様書共通規則](specifications/specification-guidelines.md) | 仕様書全般に共通する規則。 | なし |
| 仕様書 | [UI仕様書](specifications/ui-specification-guidelines.md) | UI仕様書の作成規則。 | 仕様書共通規則 |

## 適用手順

1. 作業対象がコード、デザイン、仕様書のどれに当たるか特定する。
2. 規則一覧から一致する文書と、その「先に読む文書」を読む。
3. 利用側プロジェクトの要件、採用技術、既存の仕様、ADRを確認する。
4. 規則を実装または成果物へ反映する。
5. 完了前に、各文書の検証項目とレビュー項目を確認する。
