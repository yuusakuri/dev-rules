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

本書と各実装規則のフォルダ構成表は、複数の実行単位を持つモノレポの構成を示す。表のパスはリポジトリルートを基準とする。言語またはフレームワークによる配置の制限や規則がある場合は、この表よりそちらを優先する。

各種ファイルとディレクトリは実際に必要な場合のみ作る。

`<source-root>`は、`apps/<app-name>/src/`、`apps/<app-name>/lib/`など、言語またはフレームワークが定めるソースルートを表す。実行単位が1つだけの場合は、各パスから`apps/<app-name>/`を取り除き、`src/`、`lib/`などをリポジトリ直下へ配置する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/` | `apps/myproject-api/` | 実行単位ごとのアプリケーション。`<app-name>`は任意のアプリ名を指定する。`<project-name>-<responsibility>`を推奨する。 |
| `apps/<app-name>/config/` | `apps/myproject-api/config/application.yaml` | アプリケーションが読み込む設定値をまとめる必要がある場合だけ使用する。ビルドツールの設定ファイルは、そのツールが期待する位置へ置く。 |
| `apps/<app-name>/<generated-dir>/` | `apps/myproject-web/dist/` | ビルドやコード生成による生成物。ソースコードと同じディレクトリへ混在させない。 |

### ソース構成

アプリケーションのソースは、Feature単位でまとめるFeature First構成とする。Featureは、一つの利用者目的または業務能力を表す。

Featureの名前には、`user`のように業務上の対象だけを表す語を使わず、`auth`、`search`、`checkout`のように何を提供するかが分かる語を使う。複数のFeatureで使う業務概念も、それを最も強く所有するFeatureへ配置し、そのFeatureの公開APIを通じて参照する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `<source-root>/app/` | `app/router` | 起動、ルーティング、実行経路との接続を配置する。 |
| `<source-root>/app/bootstrap/` | `app/bootstrap/postgres`、`app/bootstrap/stripe` | 依存関係の実装、設定、生成、接続を決めるComposition Rootを配置する。接続先、外部資源、依存先が扱う領域ごとにフォルダを分ける。フレームワークにより`app/`に制限や規則がある場合は`bootstrap/`へ配置する。 |
| `<source-root>/core/` | `core/errors/` | 複数のFeatureが共有する基盤を配置する。 |
| `<source-root>/core/<capability>/` | `core/clock`、`core/id` | 通信を伴わずに実行環境から得る値（時刻、識別子の発番、乱数など）の契約と実装を配置する。`<capability>`には供給する対象を表す名前を使う。 |
| `<source-root>/infra/` | `infra/logger` | Featureの型や業務ルールに依存しない技術基盤（DB接続プール、ロガーなど）の構築処理を配置する。関連するファイルが一つだけの場合は直下へ配置し、Composition Rootから呼び出す。 |
| `<source-root>/infra/<resource>/` | `infra/postgres/connection_pool`、`infra/sentry/client` | 関連するファイルが複数ある場合に、構築する外部資源または製品ごとにまとめる。Feature固有のRepositoryや外部システム境界の実装は置かない。 |
| `<source-root>/features/<feature>/` | `features/auth` | Featureに必要な型、処理、状態、境界、外部接続を配置する。 |
| `<source-root>/features/<feature>/presentation/` | `features/auth/presentation` | FeatureがUIを描画する境界と、表示状態の制御を配置する。UIを持つFeatureだけで使用し、業務ロジックはFeature内の処理へ委譲する。 |
| `<source-root>/features/<feature>/handlers/` | `features/auth/handlers` | FeatureがUIを介さず外部からの要求を受け取る境界（HTTP、RPC、メッセージ、CLIなど）を配置する。業務ロジックはFeature内の処理へ委譲する。 |
| `<source-root>/features/<feature>/repositories/` | `features/checkout/repositories/postgres_order_repository` | Featureが所有するデータを永続化ストレージ（DB、ファイル、端末ストレージなど）へ保存、取得する契約と接続先別の実装を配置する。 |
| `<source-root>/features/<feature>/connectors/` | `features/payment/connectors/stripe_client` | ネットワーク越しの外部サービスを利用する契約と、接続先別の実装を配置する。 |
| `<source-root>/ui/` | `ui/primary_button` | 複数のFeatureで使用し、業務上の判断を持たないUI部品を配置する。UIを持つ実行単位だけで使用する。 |
| `<source-root>/localization/` | `localization/ja` | 言語ごとの翻訳データと表示言語の選択を配置する。翻訳データ以外のコードと生成物を混在させない。 |
| `<source-root>/locale_format/` | `locale_format/number_format` | 数値、日付、時刻、通貨、単位など、ロケールによって表記が変わる値の書式処理を配置する。 |

### 外部依存の配置

外部システムと実行環境に依存する処理は、依存先の性質で置き場所を決める。契約と実装は同じフォルダへ置き、実装の名前で接続先、保存先、供給元を区別する。テストで使う代替実装も同じフォルダへ置く。

| 依存先 | 契約と実装の置き場所 |
| --- | --- |
| 自分が所有するデータの保存先 | `features/<feature>/repositories/` |
| ネットワーク越しの他者のシステム | `features/<feature>/connectors/` |
| 通信を伴わずに実行環境から得る値 | `core/<capability>/` |
| カメラ、位置情報、通知の表示など、端末とOSの機能 | 使うFeatureが一つなら`features/<feature>/connectors/`、複数のFeatureが使うなら`core/<capability>/` |

`core/<capability>/`の`<capability>`には、供給する対象を表す名前を入れる。時刻を表す`clock`はその一例であり、対象ごとに同じ形でフォルダを作る。次の表は網羅ではない。

| `<capability>` | 供給する対象 | 実在する配置 |
| --- | --- | --- |
| `clock` | 現在時刻、経過時間 | [zedの`crates/clock/src`](https://github.com/zed-industries/zed/tree/main/crates/clock/src)<br>[bevyの`crates/bevy_time/src`](https://github.com/bevyengine/bevy/tree/main/crates/bevy_time/src)<br>[tokioの`tokio/src/time`](https://github.com/tokio-rs/tokio/tree/master/tokio/src/time) |
| `id` | 識別子の発番と対応付け | [qdrantの`lib/segment/src/id_tracker`](https://github.com/qdrant/qdrant/tree/master/lib/segment/src/id_tracker)<br>[hyperswitchの`crates/common_utils/src/id_type`](https://github.com/juspay/hyperswitch/tree/main/crates/common_utils/src/id_type)<br>[bevyの`crates/bevy_ecs/src/entity`](https://github.com/bevyengine/bevy/tree/main/crates/bevy_ecs/src/entity) |
| `random` | 乱数 | [randの`src/rngs`](https://github.com/rust-random/rand/tree/master/src/rngs) |
| `config` | 設定値、環境変数 | [hyperswitchの`crates/router_env/src`](https://github.com/juspay/hyperswitch/tree/main/crates/router_env/src) |
| `secret` | APIキーなどの機密情報の取得 | [hyperswitchの`crates/hyperswitch_interfaces/src`](https://github.com/juspay/hyperswitch/tree/main/crates/hyperswitch_interfaces/src) |
| `crypto` | 署名、ハッシュ、暗号化 | [hyperswitchの`crates/common_utils/src`](https://github.com/juspay/hyperswitch/tree/main/crates/common_utils/src) |

外部サービスは接続先ごとに実装を分ける。関連するファイルが一つで収まるうちは`connectors/<system>_client`のファイルとし、設定と形式変換でファイルが増えたら`connectors/<system>/`のフォルダへ移して、接続処理と形式変換を別のファイルへ分ける。

| 規模 | 配置 | 実在する配置 |
| --- | --- | --- |
| ファイル一つ | `connectors/<system>_client` | [zero-to-productionの`src/email_client.rs`](https://github.com/LukeMathWalker/zero-to-production/blob/main/src/email_client.rs) |
| 複数ファイル | `connectors/<system>/` | [vectorの`src/sinks/clickhouse`](https://github.com/vectordotdev/vector/tree/master/src/sinks/clickhouse)<br>[hyperswitchの`crates/hyperswitch_connectors/src/connectors/stripe`](https://github.com/juspay/hyperswitch/tree/main/crates/hyperswitch_connectors/src/connectors/stripe) |

### 依存方向

| 依存元 | 依存先 |
| --- | --- |
| `app/`、例外時の`bootstrap/` | 各Featureの公開API、`core/`、`infra/`、`ui/` |
| `core/` | 標準ライブラリと基盤の表現に必要な外部パッケージのみ。Feature、`infra/`、フレームワーク、外部システムのSDKには依存しない |
| `infra/` | 技術基盤の外部SDK、ライブラリのみ。Feature、業務型には依存しない |
| Feature内の`presentation/` | 同じFeatureの処理と型、別Featureが公開する業務型、処理とその呼び出し契約、再利用用のUIコンポーネント、`core/`、`ui/` |
| Feature内の`handlers/` | 同じFeatureの処理と型、`core/` |
| Feature内の処理 | 同じFeatureの`repositories/`、`connectors/`の契約と型、別Featureが公開する業務型、処理とその呼び出し契約、`core/` |
| `repositories/`、`connectors/`の実装 | 対応する契約、同じFeatureの型、外部SDK、外部データ形式 |
| `ui/` | フレームワークのみに依存し、Featureには依存しない |

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
| 2. フォルダ構成 | [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) | 外部との境界をPortとAdapterへ分ける構造を確認する。 |
| 2. フォルダ構成 | [App architecture \| Flutter](https://docs.flutter.dev/app-architecture/guide) | データを扱う層をRepositoryと外部データ源へ分ける構成を確認する。 |
| 2. フォルダ構成 | [Data layer \| Android Developers](https://developer.android.com/topic/architecture/data-layer) | 一つのデータ源につき一つの実装を持たせる構成を確認する。 |
| 2. フォルダ構成 | [Designing the infrastructure persistence layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design) | 契約を利用側へ置き、実装を差し替え可能にする構成を確認する。 |
| 3. データアクセス | [CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) | 読み取りと書き込みを分離する条件と構成を確認する。 |
| 4. セキュリティ | [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 外部入力を受け取る境界で検証する項目と方法を確認する。 |
| 4. セキュリティ | [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | 機密情報の保存、利用、記録を安全に扱う方法を確認する。 |
| 4. セキュリティ | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 認証情報を検証し、利用者を確定する方法を確認する。 |
| 4. セキュリティ | [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 操作ごとに権限を判定する方法を確認する。 |
