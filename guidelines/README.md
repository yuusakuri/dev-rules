# ガイドラインの選び方

以下は、ガイドラインの一覧と適用条件をまとめた索引である。作業内容に一致する文書が複数ある場合は、そのすべてを適用する。

## ガイドライン一覧

| 分類 | 文書 | 概要 | 先に読む文書 |
| --- | --- | --- | --- |
| ソフトウェア設計 | [ソフトウェア設計ガイドライン](software/software-design-guidelines.md) | ソフトウェア開発の設計ガイドライン。 | なし |
| ソフトウェア設計 | [アプリケーション設計ガイドライン](software/application-design-guidelines.md) | アプリケーション設計のガイドライン。 | ソフトウェア設計ガイドライン |
| ソフトウェア設計 | [テストガイドライン](software/testing-guidelines.md) | テストの設計方法を定めるガイドライン。 | ソフトウェア設計ガイドライン |
| アーキテクチャ | [アーキテクチャ設計ガイドライン](architecture/architecture-guidelines.md) | 性能を最優先に、システムの構成を要件と品質特性から選ぶガイドライン。 | なし |
| アーキテクチャ | [Webアーキテクチャガイドライン](architecture/web-architecture-guidelines.md) | Webサイト及びWebアプリケーションの用途から、性能を最大にする構成を選ぶガイドライン。 | アーキテクチャ設計ガイドライン |
| アーキテクチャ | [通信方式ガイドライン](architecture/communication-protocol-guidelines.md) | 通信の用途から、遅延とスループットが最も良い通信方式を選ぶガイドライン。 | アーキテクチャ設計ガイドライン |
| アーキテクチャ | [地図アプリケーション設計ガイドライン](architecture/map-application-guidelines.md) | 大量の地理データを、滑らかな操作と速い読込みで表示する設計のガイドライン。 | Webアーキテクチャガイドライン |
| 開発 | [リポジトリガイドライン](development/repository-guidelines.md) | リポジトリの構成を定めるガイドライン。 | なし |
| 開発 | [Git規則](development/git-guidelines.md) | Gitを使った開発フローの規則。 | なし |
| 開発 | [バージョニング規則](development/versioning-guidelines.md) | バージョン番号を決める。 | なし |
| 開発 | [ソフトウェア使用規則](development/software-usage-rules.md) | ソフトウェアの選定基準と、使用を許可、禁止するソフトウェアを定める規則。 | なし |
| 実装 | [JavaScript実装ガイドライン](implementation/javascript-guidelines.md) | TypeScript及びpnpmを使用するJavaScript実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Rust実装ガイドライン](implementation/rust-guidelines.md) | Rust実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Python実装ガイドライン](implementation/python-guidelines.md) | Python実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Flutter実装ガイドライン](implementation/flutter-guidelines.md) | Flutterアプリケーション実装のガイドライン。 | ソフトウェア設計ガイドライン、アプリケーション設計ガイドライン |
| 実装 | [Windows PowerShellモジュール実装ガイドライン](implementation/windows-powershell-module-guidelines.md) | Windows PowerShell 5.1向けモジュール実装のガイドライン。 | ソフトウェア設計ガイドライン、リポジトリガイドライン |
| AI | [ハーネスエンジニアリングガイドライン](ai/harness-engineering-guidelines.md) | AIエージェントの指示、検査及び実行の制御の仕組みを設計するガイドライン。 | なし |
| AI | [AI機能設計ガイドライン](ai/ai-feature-design-guidelines.md) | テキスト、画像、動画、音声などを扱うAI機能及びエージェント型の機能の設計と、運用のガイドライン。 | アーキテクチャ設計ガイドライン、通信方式ガイドライン |
| UI | [デザインシステムガイドライン](ui/design-system.md) | UIの視覚表現のガイドライン。 | なし |
| UI | [Web UIガイドライン](ui/web-ui-guidelines.md) | Web UIのデザインガイドライン。 | デザインシステムガイドライン |
| 文書 | [Markdown記述ガイドライン](documentation/markdown-guidelines.md) | Markdownの記述ガイドライン。 | なし |
| 文書 | [PowerPoint作成ガイドライン](documentation/powerpoint-guidelines.md) | PowerPointのプレゼンテーションの作成方法を定めるガイドライン。 | JavaScript実装ガイドライン、技術文書作成ガイドライン |
| 文書 | [技術文書作成ガイドライン](documentation/technical-document-guidelines.md) | 技術文書の作成方法を定めるガイドライン。JIS Z 8301、ISO/IEC Directives, Part 2、ISO 24495-1及び公用文作成の考え方を参考に作成した。 | なし |
| 文書 | [リファレンス文書作成ガイドライン](documentation/reference-guidelines.md) | リファレンス文書の作成方法を定めるガイドライン。Diátaxisを参考に作成した。 | 技術文書作成ガイドライン |
| 文書 | [解説文書作成ガイドライン](documentation/explanation-guidelines.md) | 解説文書の作成方法を定めるガイドライン。Diátaxisを参考に作成した。 | 技術文書作成ガイドライン |
| 文書 | [手順書作成ガイドライン](documentation/how-to-guidelines.md) | 手順書の作成方法を定めるガイドライン。Diátaxisを参考に作成した。 | 技術文書作成ガイドライン |
| 文書 | [MarkdownからDOCXへの変換ガイドライン](documentation/docx-export-guidelines.md) | MarkdownからDOCXへの変換ガイドライン。Googleドキュメントへの変換も扱う。 | Markdown記述ガイドライン |
| 文書 | [Mermaid図の画像変換ガイドライン](documentation/mermaid-image-guidelines.md) | MermaidをSVG又はPNGに変換するガイドライン。 | なし |
| 文書 | [PlantUML図の画像変換ガイドライン](documentation/plantuml-image-guidelines.md) | PlantUMLをSVGに変換し、SVGからPNGを作るガイドライン。 | SVGからPNGへの変換ガイドライン |
| 文書 | [SVGからPNGへの変換ガイドライン](documentation/svg-to-png-guidelines.md) | SVGをPNGに変換するガイドライン。 | なし |
| 文書 | [PDFからの画像抽出ガイドライン](documentation/pdf-image-extraction-guidelines.md) | PDFの図を、ベクター画像はSVGとして、埋め込み画像は元の画素のまま抽出するガイドライン。 | なし |
| 文書 | [Webページからの画像取得ガイドライン](documentation/web-image-guidelines.md) | Webページの画像を、提供元が配布する画像ファイルから取得するガイドライン。 | なし |
| 文書 | [READMEガイドライン](documentation/readme-guidelines.md) | リポジトリのREADMEの記載方法を定めるガイドライン。 | リポジトリガイドライン |

## 設計の対象から選ぶ

設計では、設計の対象から[表1](#table-1)で文書を選ぶ。利用側プロジェクトが別の優先順位を定めていない場合は、各文書の選択表から、要件を満たす中で性能が最も高い選択肢を選ぶ。

<a id="table-1"></a>表1−設計の対象と適用する文書

| 設計の対象 | 適用する文書 |
| --- | --- |
| システム全体の構成、実行単位の分け方、データストア、配置先 | [アーキテクチャ設計ガイドライン](architecture/architecture-guidelines.md) |
| 実行単位の内部のフォルダ及びモジュールの構成 | [アプリケーション設計ガイドライン](software/application-design-guidelines.md) |
| Webサイト及びWebアプリケーションのレンダリング方式、キャッシュ、配信、表示の速さ | [Webアーキテクチャガイドライン](architecture/web-architecture-guidelines.md)、[Web UIガイドライン](ui/web-ui-guidelines.md) |
| API、リアルタイム通信、サーバー間の通信、機器との通信の方式 | [通信方式ガイドライン](architecture/communication-protocol-guidelines.md) |
| 業務ロジック、状態遷移、エラーハンドリング、並行処理 | [ソフトウェア設計ガイドライン](software/software-design-guidelines.md) |
| 地図での大量データの表示、地図の操作性と性能 | [地図アプリケーション設計ガイドライン](architecture/map-application-guidelines.md) |
| テキスト、画像、動画、音声などを扱うAI機能、エージェント型の機能、LLMOps | [AI機能設計ガイドライン](ai/ai-feature-design-guidelines.md) |
| 開発の作業をAIエージェントに任せる仕組み | [ハーネスエンジニアリングガイドライン](ai/harness-engineering-guidelines.md) |

## 適用手順

1. 作業内容と対象の成果物を確認する。
2. ガイドライン一覧から一致する文書と、その「先に読む文書」を読む。
3. 利用側プロジェクトの要件、採用技術、既存の仕様、ADRを確認する。
4. ガイドラインを成果物へ反映する。
5. 完了前に、各文書の検証項目とレビュー項目を確認する。
