# アプリケーション設計規則

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [データアクセス](#3-データアクセス)
4. [セキュリティ](#4-セキュリティ)
5. [CLI](#5-cli)
6. [テスト](#6-テスト)
7. [参考資料](#7-参考資料)

---

## 1. 概要

本書は、アプリケーションの設計規則を定義する。本書は、[共通設計原則](software-design-guidelines.md)を前提とする。

---

## 2. フォルダ構成

本書と各実装規則のフォルダ構成表では、複数の実行単位を持つモノレポを例として示す。表のパスはリポジトリルートを基準とする。言語またはフレームワークによる配置の制限や規則がある場合は、この表よりそちらを優先する。

各種ファイルとディレクトリは実際に必要な場合のみ作る。

`<source-root>`は、`apps/<app-name>/src/`、`apps/<app-name>/lib/`など、言語またはフレームワークが定めるソースルートを表す。実行単位が1つだけの場合は、各パスから`apps/<app-name>/`を取り除き、`src/`、`lib/`などをリポジトリ直下へ配置する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/` | [`app/`](https://github.com/android/nowinandroid/tree/main/app) | 実行単位ごとのアプリケーション。`<app-name>`は任意のアプリ名を指定する。`<project-name>-<responsibility>`を推奨する。 |
| `apps/<app-name>/config/` | [`config/`](https://github.com/juspay/hyperswitch/tree/main/config) | アプリケーションが読み込む設定値をまとめる必要がある場合だけ使用する。ビルドツールの設定ファイルは、そのツールが期待する位置へ置く。 |
| `apps/<app-name>/<generated-dir>/` | [`target/`](https://doc.rust-lang.org/cargo/guide/build-cache.html) | ビルドやコード生成による生成物。ソースコードと同じディレクトリへ混在させない。 |

### ソース構成

アプリケーションのソース構成の例として、Feature単位でまとめるFeature First構成を示す。Featureは、一つの利用者目的または業務能力を表す。

Featureの名前には、`user`のように業務上の対象だけを表す語を使わず、`auth`、`search`、`checkout`のように何を提供するかが分かる語を使う。複数のFeatureで使う業務概念も、それを最も強く所有するFeatureへ配置し、そのFeatureの公開APIを通じて参照する。

`<technical-resource>`には、`postgres`、`stripe`、`s3`、`sentry`のような製品、サービス、プロトコルの名前、または`logging`のような技術機能の名前を使用する。Featureの型に依存しない構築処理は`infra/`へ、Featureの型に依存する実装はそのFeatureの下へ置く。

| パス | 例 | 説明 |
| --- | --- | --- |
| `<source-root>/app/` | [`routing/`](https://github.com/flutter/samples/tree/main/compass_app/app/lib/routing) | ルーティングと、アプリケーション全体の実行経路との接続を配置する。 |
| `<source-root>/core/<name>/` | [`core/errors`](https://github.com/juspay/hyperswitch/blob/main/crates/common_utils/src/errors.rs)、[`core/clock`](https://github.com/zed-industries/zed/tree/main/crates/clock/src)、[`core/id`](https://github.com/qdrant/qdrant/tree/master/lib/segment/src/id_tracker) | 複数のFeatureが共有する基盤を、対象ごとにまとめて配置する。時刻、乱数、識別子の発番のように通信を伴わない供給は、契約と実装をここへ置く。 |
| `<source-root>/infra/<technical-resource>/` | [hyperswitchの`router_env/logger`](https://github.com/juspay/hyperswitch/tree/main/crates/router_env/src/logger)、[sqlxの`pool`](https://github.com/launchbadge/sqlx/tree/main/sqlx-core/src/pool)、[hyperswitchの`storage_impl/database`](https://github.com/juspay/hyperswitch/tree/main/crates/storage_impl/src/database)、[hyperswitchの`redis_interface`](https://github.com/juspay/hyperswitch/tree/main/crates/redis_interface) | ロガー、DB接続プール、キャッシュ接続のように、Featureの型や業務ルールに依存しない構築処理を配置し、起動点から呼び出す。同じ技術資源で接続先が複数ある場合もディレクトリは一つとし、接続先ごとの違いは起動点で設定を与えて生成し分ける。 |
| `<source-root>/features/<feature>/` | [`feature`](https://developer.android.com/topic/modularization/patterns) | Featureに必要な型、処理、状態、境界、外部接続を配置する。 |
| `<source-root>/features/<feature>/presentation/` | [`presentation`](https://github.com/mihonapp/mihon/tree/main/presentation-core) | FeatureがUIを描画する境界と、表示状態の制御を配置する。UIを持つFeatureだけで使用し、業務ロジックはFeature内の処理へ委譲する。 |
| `<source-root>/features/<feature>/handlers/` | [`handler`](https://docs.rs/axum/latest/axum/handler/index.html) | FeatureがUIを介さず外部からの要求を受け取る境界（HTTP、RPC、メッセージ、CLIなど）を配置する。業務ロジックはFeature内の処理へ委譲する。 |
| `<source-root>/features/<feature>/<technical-resource>/` | [OpenDALの`github/`](https://github.com/apache/opendal/tree/main/core/services/github)、[`mysql/`](https://github.com/apache/opendal/tree/main/core/services/mysql)、[`postgresql/`](https://github.com/apache/opendal/tree/main/core/services/postgresql)、[`s3/`](https://github.com/apache/opendal/tree/main/core/services/s3)、[Vectorの`postgres/`](https://github.com/vectordotdev/vector/tree/master/src/sinks/postgres)、[`aws_s3/`](https://github.com/vectordotdev/vector/tree/master/src/sinks/aws_s3) | Featureの型に依存する、外部システム、サービス、データストアの実装と外部データ形式を配置する。永続化の実装もここへ置く。複数のFeatureから使う場合も、最も強く所有するFeatureへ置き、他のFeatureはそのFeatureの公開APIを通じて参照する。 |
| `<source-root>/ui/` | [`ui/`](https://docs.flutter.dev/app-architecture/case-study) | 複数のFeatureで使用し、業務上の判断を持たないUI部品を配置する。UIを持つ実行単位だけで使用する。 |
| `<source-root>/<localization>/` | [`l10n`](https://docs.flutter.dev/ui/internationalization) | 言語ごとの翻訳データと表示言語の選択を配置する。翻訳データ以外のコードと生成物を混在させない。 |
| `<source-root>/locale_format/` | [`NumberFormat`](https://developer.android.com/reference/android/icu/text/NumberFormat) | 数値、日付、時刻、通貨、単位など、ロケールによって表記が変わる値の書式処理を配置する。 |

### 分割の単位

処理が増えて一つのファイルで追いにくくなったら、対象ごとのモジュールへ分ける。複数の実行単位から使うようになったら、パッケージとして切り出す。

### 依存の向き

| 役割 | 依存してよい相手 |
| --- | --- |
| 起動と構成 | 各Featureの公開API、共有基盤、技術基盤、共有UI部品 |
| Featureの表示と受け口 | 同じFeatureの処理と型、別Featureの公開API、共有基盤、共有UI部品 |
| Featureの処理 | 同じFeatureの外部依存の契約と型、別Featureの公開API、共有基盤 |
| Featureの外部依存の実装 | 対応する契約、同じFeatureの型、外部SDK、外部データ形式 |
| 共有基盤 | 標準ライブラリと、基盤の表現に必要な外部パッケージのみ |
| 技術基盤 | 技術基盤の外部SDKとライブラリのみ |
| 共有UI部品 | UIフレームワークのみ |

---

## 3. データアクセス

### クエリ回数

関連するデータを一覧ごとに取得するN+1クエリを避ける。関連データは、結合、まとめて取得する処理、または読み取り専用モデルを使用して取得し、データ件数の増加による応答時間の悪化を防ぐ。

### 読み取りと書き込み

読み取りと書き込みで必要なデータ構造、性能、処理量、整合性が異なる場合は、CQRSを採用する。書き込み側は業務上の制約と整合性を扱い、読み取り側は呼び出し元が必要とする形式と応答性能を扱うことで、それぞれを独立して最適化できる。

### トランザクションは一連の業務処理を単位にする

複数の永続化操作をまとめて成功または失敗させる場合は、一連の業務処理を一つのトランザクションとして扱う。各Repositoryで個別に確定せず、業務処理を調整する側で開始、確定、取消しを管理する。ORMやデータアクセスライブラリが同等の機能を持つ場合はその機能を使用し、Unit of Workという独自の型を重ねて定義しない。

---

## 4. セキュリティ

### 外部入力

すべての外部入力は、受け取った境界で形式、サイズ、構文を検証する。業務上の制約は業務ロジックで検証する。検証済みであることを型で表現し、未検証の値がそのまま内部処理へ流れ込まない構造にする。

### 機密情報

APIキー、アクセストークン、パスワード、秘密鍵、接続文字列をソースコードへ記述しない。実行環境の環境変数または機密情報管理サービスから取得し、`.env`をバージョン管理の対象外にする。機密情報は、ログへ出力されない型または仕組みで保護する。

### 認証

リクエストを受信した境界で認証情報を検証し、利用者を確定する。検証に失敗したリクエストは業務処理へ渡さない。

### 認可

認証済みの利用者が対象の操作を実行できるか、業務処理を開始する前に判定する。役割、所有関係、付与された権限を操作ごとに検証する。

---

## 5. CLI

Shell スクリプト以外の CLI に適用する。

| 対象 | 規定 | 例 |
| --- | --- | --- |
| 引数名 | 単語をハイフンで区切り、先頭に`--`を付ける。 | `--arg-name` |
| ファイルを受け取る引数 | 名前を`file`で終える。 | `--input-file`、`--config-file` |
| ディレクトリを受け取る引数 | 名前を`dir`で終える。 | `--output-dir` |
| 出力先を指定する引数 | 名前を`output`で始める。 | `--output-file`、`--output-dir` |
| ファイルパス | ファイル名に空白が含まれる場合も、正しく動作する。 | `--input-file "sample data.csv"` |

---

## 6. テスト

| 種別 | 量 | 検証対象 |
| --- | --- | --- |
| 単体テスト | 多 | 外部I/Oを持たない計算、業務上の制約、状態遷移、処理の組み立て。 |
| 結合テスト | 中 | データベース、HTTP、OSの機能、ミドルウェアと内部処理の接続。 |
| E2Eテスト | 少 | 利用者の主要な操作と、停止するとサービスの提供に重大な影響を与える処理経路。 |

---

## 7. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 2. フォルダ構成 | [App architecture \| Flutter](https://docs.flutter.dev/app-architecture/guide) | データを扱う層をRepositoryと外部データ源へ分ける構成を確認する。 |
| 2. フォルダ構成 | [Data layer \| Android Developers](https://developer.android.com/topic/architecture/data-layer) | 一つのデータ源につき一つの実装を持たせる構成を確認する。 |
| 2. フォルダ構成 | [Managing Growing Projects \| The Rust Programming Language](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html) | モジュールへ分ける時期と、パッケージへ切り出す時期を確認する。 |
| 2. フォルダ構成 | [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) | 依存の向きを内側へそろえる規則を確認する。 |
| 2. フォルダ構成 | [Guide to app architecture \| Android Developers](https://developer.android.com/topic/architecture) | 層の間で依存の向きを一方向に保つ構成を確認する。 |
| 3. データアクセス | [CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) | 読み取りと書き込みを分離する条件と構成を確認する。 |
| 4. セキュリティ | [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 外部入力を受け取る境界で検証する項目と方法を確認する。 |
| 4. セキュリティ | [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | 機密情報の保存、利用、記録を安全に扱う方法を確認する。 |
| 4. セキュリティ | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 認証情報を検証し、利用者を確定する方法を確認する。 |
| 4. セキュリティ | [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 操作ごとに権限を判定する方法を確認する。 |
