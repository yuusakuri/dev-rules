# OSSリポジトリ規則

> 適用対象: OSSとして公開するリポジトリのルート構成、コミュニティ運営ファイル、ドキュメント構成を変更する場合。

## 1. 適用範囲

本書は、使用する言語、フレームワーク、パッケージマネージャによらず、OSSとして公開するリポジトリに共通するファイル・ディレクトリの役割を定義する。特定の言語やビルドツールのマニフェスト（`package.json`など）、CI設定の具体的な記述内容は対象としない。

Linux Kernel、Kubernetesなど大規模OSSの慣行、GitHubのコミュニティ推奨ファイル、Keep a Changelog、Diátaxisなど業界で広く使われる基準を根拠とする。

---

## 2. ルート直下のファイル

| ファイル | 要否 | 対象 | 役割 |
| ---- | ---- | ---- | ---- |
| `README.md` | 必須 | 利用者 | プロジェクトの概要、目的、インストール方法、最小限の使用例を記載する。リポジトリを開いて最初に読まれる文書。 |
| `LICENSE`（または`LICENSE.md`、`COPYING`） | 必須 | 利用者、法務 | 利用許諾条件を明記する。OSSと名乗るための必須要件。SPDXライセンス識別子に対応する原文をそのまま収録する。 |
| `CONTRIBUTING.md` | 推奨 | 貢献者 | 開発環境の構築、ブランチ運用、テスト実行、コーディング規約、PRの出し方など、貢献に必要な手順を記載する。 |
| `CODE_OF_CONDUCT.md` | 推奨 | コミュニティ全員 | コミュニティ内での行動規範と、違反時の連絡先・対応手順を定める。Contributor Covenantなど既存の規範を採用してよい。 |
| `SECURITY.md` | 推奨 | 利用者、セキュリティ研究者 | 脆弱性を公開Issueではなく非公開で報告する方法と、対応対象バージョンを明記する。 |
| `CHANGELOG.md` | 推奨 | 利用者 | バージョンごとの変更点を時系列で記録する。[Keep a Changelog](https://keepachangelog.com/)の形式に従う。 |
| `MAINTAINERS` | 推奨 | 貢献者、利用者 | 各領域の責任者を、担当範囲とともに一覧化する。バージョン管理システムやホスティングサービスに依存せず読める形式にする。 |
| `SUPPORT.md` | 任意 | 利用者 | 質問や利用相談の受付先（Issue、Discussions、メーリングリストなど）を明記する。 |
| `GOVERNANCE.md` | 任意 | コミュニティ全員 | 意思決定の方法、メンテナへの昇格基準など、プロジェクトの運営体制を定める。個人運営の小規模プロジェクトでは省略してよい。 |
| `AUTHORS`（または`CREDITS`） | 任意 | 利用者、貢献者 | 主要な貢献者の一覧。バージョン管理の履歴と内容が重複するため必須にはしない。 |
| `NOTICE` | 任意 | 法務 | Apache License 2.0など、同梱を求めるライセンスの依存関係を含む場合に、その著作権表示をまとめる。 |
| `.gitignore` | 推奨 | 開発者 | ビルド生成物、ローカル設定など、バージョン管理から除外するパスを指定する。 |
| `.gitattributes` | 推奨 | 開発者 | 改行コードの統一、バイナリファイルの扱い、言語統計など、Gitの属性を指定する。 |
| `.editorconfig` | 任意 | 開発者 | インデント幅や文字コードなど、エディタ間で共通化できる基本的な書式設定を統一する。 |

---

## 3. `.github/` ディレクトリ

GitHubで公開する場合に、コミュニティ運営を補助する特別なファイルを配置する。

| パス | 要否 | 役割 |
| ---- | ---- | ---- |
| `.github/ISSUE_TEMPLATE/` | 推奨 | Issue作成時のひな形（バグ報告、機能要望など）を提供し、必要な情報の記入漏れを防ぐ。 |
| `.github/PULL_REQUEST_TEMPLATE.md` | 推奨 | PR作成時のひな形を提供し、変更内容とテスト方法の記載を促す。 |
| `.github/CODEOWNERS` | 推奨 | ファイル、ディレクトリごとの責任者を定義し、該当箇所を変更するPRへ自動的にレビューを依頼する。 |
| `.github/FUNDING.yml` | 任意 | スポンサーシップの受付先を示す。 |

`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`SUPPORT.md`は、リポジトリ直下と`.github/`のどちらに置いてもGitHubが認識する。1つのリポジトリでは配置場所を統一する。

---

## 4. `docs/` ディレクトリ

コードコメントやREADMEで扱いきれない独立した文書を`docs/`へ配置する。読み手の目的に応じて[Diátaxis](https://diataxis.fr/)の4分類に、意思決定記録（ADR）と仕様書を加えた区分で構成する。

| パス | 読み手の目的 | 内容 |
| ---- | ---- | ---- |
| `docs/tutorials/` | 学習（実践） | 初めての利用者が、手を動かしながら一連の操作を最初から最後まで体験するための文書。 |
| `docs/how-to/` | 作業（実践） | 特定の目的を達成するための手順。前提知識がある利用者が、目的の操作だけを素早く終えられるようにする。 |
| `docs/reference/` | 参照（理論） | API、設定項目、CLIオプションなど、正確さと網羅性を優先した事実の一覧。 |
| `docs/explanation/` | 理解（理論） | 設計の背景、仕様の理由、代替案との比較など、深い理解のための説明。 |
| `docs/adr/` | 意思決定の経緯 | 重要な設計判断の記録（Architecture Decision Records）。決定と理由をセットで残す。 |
| `docs/specifications/` | 契約の定義 | API、UI、通信プロトコル、ハードウェアインターフェース、要求、安全要求など、実装が従うべき正式な契約を記述する文書。共通の記法は[仕様書共通規則](../specifications/common.md)で定め、専用規則がある領域はそれも適用する（[API仕様書作成ルール](../specifications/api.md)、[UI仕様書作成規約](../specifications/ui.md)）。 |

すべてのプロジェクトが6分類すべてを必要とするわけではない。ドキュメントが少ない段階では`docs/`直下に置き、種類ごとの分割が必要になった時点でディレクトリを作る。

---

## 5. 複数ライセンス構成（該当する場合）

| パス | 要否 | 役割 |
| ---- | ---- | ---- |
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
