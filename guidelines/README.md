# ガイドラインの選び方

ガイドラインの一覧と適用条件をまとめた索引である。作業内容に一致する文書が複数ある場合は、そのすべてを適用する。

## ガイドライン一覧

| 分類 | 文書 | 概要 | 先に読む文書 |
| --- | --- | --- | --- |
| ソフトウェア設計 | [ソフトウェア設計ガイドライン](software/software-design-guidelines.md) | ソフトウェア開発の設計ガイドライン。 | なし |
| ソフトウェア設計 | [アプリケーション設計ガイドライン](software/application-design-guidelines.md) | アプリケーション設計のガイドライン。 | ソフトウェア設計ガイドライン |
| 開発 | [リポジトリガイドライン](development/repository-guidelines.md) | リポジトリのファイルとディレクトリの役割を定めるガイドライン。 | なし |
| 開発 | [Git規則](development/git-guidelines.md) | Gitを使った開発フローの規則。 | なし |
| 開発 | [バージョニング規則](development/versioning-guidelines.md) | バージョン番号を決める。 | なし |
| 実装 | [TypeScript実装ガイドライン](implementation/typescript-guidelines.md) | TypeScript実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Rust実装ガイドライン](implementation/rust-guidelines.md) | Rust実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Flutter実装ガイドライン](implementation/flutter-guidelines.md) | Flutterアプリケーション実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Windows PowerShellモジュール実装ガイドライン](implementation/windows-powershell-module-guidelines.md) | Windows PowerShell 5.1向けモジュール実装のガイドライン。 | ソフトウェア設計ガイドライン、リポジトリガイドライン |
| UI | [デザインシステムガイドライン](ui/design-system.md) | UIの視覚表現、レイアウト、状態、動きのガイドライン。 | なし |
| UI | [Web UIガイドライン](ui/web-ui-guidelines.md) | Web UIのデザインガイドライン。 | デザインシステムガイドライン |
| 文書 | [仕様書作成ガイドライン](documentation/specification-guidelines.md) | 仕様書作成のガイドライン。 | なし |
| 文書 | [UI仕様書作成ガイドライン](documentation/ui-specification-guidelines.md) | UI仕様書作成のガイドライン。 | 仕様書作成ガイドライン |
| 文書 | [READMEガイドライン](documentation/readme-guidelines.md) | リポジトリのREADMEの記載内容を定めるガイドライン。 | リポジトリガイドライン |

## 適用手順

1. 作業内容と対象の成果物を確認する。
2. ガイドライン一覧から一致する文書と、その「先に読む文書」を読む。
3. 利用側プロジェクトの要件、採用技術、既存の仕様、ADRを確認する。
4. ガイドラインを実装または成果物へ反映する。
5. 完了前に、各文書の検証項目とレビュー項目を確認する。
