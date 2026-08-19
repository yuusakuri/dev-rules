# リポジトリ規則

## 1. 概要

本書は、使用する言語、フレームワーク、パッケージマネージャによらず、リポジトリに共通するファイル、ディレクトリの役割を定義する。

---

## 2. 構成

| パス | 要否 | 説明 |
| ---- | ---- | ---- |
| `README.md` | 必須 | プロジェクトの概要、目的、インストール方法、最小限の使用例を記載する。リポジトリを開いて最初に読まれる文書。 |
| `LICENSE` | 推奨 | 利用許諾条件を明記する。SPDXライセンス識別子に対応する原文をそのまま収録する。 |
| `CONTRIBUTING.md` | 推奨 | 開発環境の構築、ブランチ運用、テスト実行、コーディング規約、PRの出し方など、貢献に必要な手順を記載する。 |
| `CODE_OF_CONDUCT.md` | 任意 | コミュニティ内での行動規範と、違反時の連絡先、対応手順を定める。Contributor Covenantなど既存の規範を採用してよい。 |
| `SECURITY.md` | 任意 | 脆弱性を公開Issueではなく非公開で報告する方法と、対応対象バージョンを明記する。 |
| `CHANGELOG.md` | 推奨 | バージョンごとの変更点を時系列で記録する。[Keep a Changelog](https://keepachangelog.com/)の形式に従う。 |
| `MAINTAINERS` | 任意 | 各領域の責任者を、担当範囲とともに一覧化する。バージョン管理システムやホスティングサービスに依存せず読める形式にする。 |
| `SUPPORT.md` | 任意 | 質問や利用相談の受付先（Issue、Discussions、メーリングリストなど）を明記する。 |
| `GOVERNANCE.md` | 任意 | 意思決定の方法、メンテナへの昇格基準など、プロジェクトの運営体制を定める。 |
| `AUTHORS` | 任意 | 主要な貢献者の一覧。バージョン管理の履歴と内容が重複するため必須にはしない。 |
| `NOTICE` | 任意 | Apache License 2.0など、同梱を求めるライセンスの依存関係を含む場合に、その著作権表示をまとめる。 |
| `.gitignore` | 推奨 | ビルド生成物、ローカル設定など、バージョン管理から除外するパスを指定する。 |
| `.gitattributes` | 推奨 | 改行コードの統一、バイナリファイルの扱い、言語統計など、Gitの属性を指定する。 |
| `.editorconfig` | 任意 | インデント幅や文字コードなど、エディタ間で共通化できる基本的な書式設定を統一する。 |
| `docker/` | 任意 | Dockerfileとコンテナ関連の定義を配置する。 |
| `kubernetes/` | 任意 | Kubernetesのマニフェストとデプロイ定義を配置する。 |
| `terraform/` | 任意 | Terraformなどのインフラ定義コードを配置する。 |
| `tools/` | 任意 | 開発、検証を補助する自作のツールやユーティリティを配置する。単発のスクリプトではなく、独立したプログラムとして保守するものに使う。 |
| `scripts/` | 任意 | タスクランナーへ集約するほどではない、個別の開発支援スクリプトを配置する。 |
| `justfile` | 任意 | `just`コマンドで実行する、開発、検証処理をサブコマンド単位で定義するタスクランナー。引数を指定しない場合は、利用可能なサブコマンドと使用方法を表示する。`dev.sh`と役割が重なるため、どちらか一方だけを使う。 |
| `dev.sh` | 任意 | シェルスクリプトで実装する、開発、検証処理をサブコマンド単位で実行するタスクランナー。引数を指定しない場合は、利用可能なサブコマンドと使用方法を表示する。`justfile`と役割が重なるため、どちらか一方だけを使う。 |
| `.github/ISSUE_TEMPLATE/` | 推奨 | Issue作成時のひな形（バグ報告、機能要望など）を提供し、必要な情報の記入漏れを防ぐ。 |
| `.github/PULL_REQUEST_TEMPLATE.md` | 推奨 | PR作成時のひな形を提供し、変更内容とテスト方法の記載を促す。 |
| `.github/CODEOWNERS` | 推奨 | ファイル、ディレクトリごとの責任者を定義し、該当箇所を変更するPRへ自動的にレビューを依頼する。 |
| `.github/FUNDING.yml` | 任意 | スポンサーシップの受付先を示す。 |
| `docs/tutorials/` | 任意 | 初めての利用者が、手を動かしながら一連の操作を最初から最後まで体験するための文書。 |
| `docs/how-to/` | 任意 | 特定の目的を達成するための手順。前提知識がある利用者が、目的の操作だけを素早く終えられるようにする。 |
| `docs/reference/` | 任意 | API、設定項目、CLIオプションなど、正確さと網羅性を優先した事実の一覧。 |
| `docs/explanation/` | 任意 | 設計の背景、仕様の理由、代替案との比較など、深い理解のための説明。 |
| `docs/adr/` | 任意 | 重要な設計判断の記録（Architecture Decision Records）。決定と理由をセットで残す。 |
| `docs/specifications/` | 任意 | API、UI、通信プロトコル、ネットワーク、アクセス制御、ハードウェアインターフェース、要求など、実装が従うべき正式な契約を記述する文書。 |
| `LICENSES/` | 任意 | 依存関係やディレクトリごとにライセンスが異なる場合に、[REUSE](https://reuse.software/)仕様に従って各ライセンスの全文を格納する。各ソースファイルへSPDXライセンス識別子のヘッダーを付与する運用とセットで使用する。 |

---

## 参考資料

| 参考資料 |
| --- |
| [Creating a default community health file - GitHub Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) |
| [About issue and pull request templates - GitHub Docs](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates) |
| [Keep a Changelog](https://keepachangelog.com/) |
| [Diátaxis](https://diataxis.fr/) |
| [REUSE Software](https://reuse.software/) |
| [OpenSSF Best Practices Badge](https://www.bestpractices.dev/) |
| [Applying the Apache License, Version 2.0](https://www.apache.org/legal/apply-license.html) |
| [List of maintainers - The Linux Kernel documentation](https://docs.kernel.org/process/maintainers.html) |

---
