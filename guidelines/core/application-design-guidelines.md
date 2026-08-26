# アプリケーション設計規則

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [データアクセス](#3-データアクセス)
4. [セキュリティ](#4-セキュリティ)
5. [CLI](#5-cli)
6. [テスト](#6-テスト)

---

## 1. 概要

本書は、アプリケーションの設計規則を定義する。本書は、[共通設計原則](software-design-guidelines.md)を前提とする。

---

## 2. フォルダ構成

本書と各実装規則のフォルダ構成表は、複数の実行単位を持つモノレポの構成を示す。表のパスはリポジトリルートを基準とする。実行単位が1つだけの場合は、各パスから`apps/<app-name>/`を取り除き、マニフェスト、ソース、テストなどをリポジトリ直下へ配置する。

`<source-root>`は、`apps/<app-name>/src/`、`apps/<app-name>/lib/`など、言語またはフレームワークが定めるソースルートを表す。実行単位が1つだけの場合は、`src/`、`lib/`などを表す。

言語またはフレームワークによる配置の制限や規則がある場合は、この表よりそちらを優先する。

| パス | 説明 |
| --- | --- |
| `apps/<app-name>/` | 実行単位ごとのアプリケーション。`<app-name>`は任意のアプリ名を指定する。`<project-name>-<responsibility>`を推奨する。 |
| `apps/<app-name>/config/` | アプリケーションが読み込む設定値をまとめる必要がある場合だけ使用する。ビルドツールの設定ファイルは、そのツールが期待する位置へ置く。 |
| `apps/<app-name>/<generated-dir>/` | ビルドやコード生成による生成物。ソースコードと同じディレクトリへ混在させない。 |

### ソース構成

アプリケーションのソースは、Feature単位でまとめるFeature First構成とする。Featureは、一つの利用者目的または業務能力を表す。

Featureの名前には、`user`のように業務上の対象だけを表す語を使わず、`auth`、`search`、`checkout`のように何を提供するかが分かる語を使う。複数のFeatureで使う業務概念も、それを最も強く所有するFeatureへ配置し、そのFeatureの公開APIを通じて参照する。

各種ファイルとディレクトリは実際に必要な場合のみ作る。

| パス | 説明 | 例 |
| --- | --- | --- |
| `<source-root>/app/` | 起動、ルーティング、実行経路との接続を配置する。 | `app/router` |
| `<source-root>/app/bootstrap/` | 依存関係の実装、設定、生成、接続を決めるComposition Rootを配置する。複数のFeatureや実行経路を構成する場合は、独立して構築できる単位ごとに分ける。フレームワークにより`app/`に制限や規則がある場合は`bootstrap/`へ配置する。 | `app/bootstrap/auth`、`app/bootstrap/http_server` |
| `<source-root>/core/` | 複数のFeatureが共有する基盤を配置する。 | `core/errors/` |
| `<source-root>/infra/` | Featureの型や業務ルールに依存しない技術基盤（DB接続プール、ロガーなど）の構築処理を配置する。関連するファイルが一つだけの場合は直下へ配置し、Composition Rootから呼び出す。 | `infra/logger` |
| `<source-root>/infra/<resource>/` | 関連するファイルが複数ある場合に、構築する外部資源または製品ごとにまとめる。Feature固有のRepositoryやGatewayの実装は置かない。 | `infra/postgres/connection_pool`、`infra/sentry/client` |
| `<source-root>/features/<feature>/` | Featureに必要な型、処理、状態、境界、外部接続を配置する。 | `features/auth` |
| `<source-root>/features/<feature>/presentation/` | FeatureがUIを描画する境界と、表示状態の制御を配置する。UIを持つFeatureだけで使用し、業務ロジックはFeature内の処理へ委譲する。 | `features/auth/presentation` |
| `<source-root>/features/<feature>/handlers/` | FeatureがUIを介さず外部からの要求を受け取る境界（HTTP、RPC、メッセージ、CLIなど）を配置する。業務ロジックはFeature内の処理へ委譲する。 | `features/auth/handlers` |
| `<source-root>/features/<feature>/repositories/` | Featureが所有するデータを永続化ストレージ（DB、ファイル、端末ストレージなど）へ保存、取得する契約と接続先別の実装を配置する。 | `features/checkout/repositories/postgres_order_repository` |
| `<source-root>/features/<feature>/gateways/` | 永続化以外の外部システム、外部サービス（決済、通知、他サービスのAPI、デバイスなど）と通信する契約と接続先別の実装を配置する。 | `features/payment/gateways/stripe_payment_gateway` |
| `<source-root>/ui/` | 複数のFeatureで使用し、業務上の判断を持たないUI部品を配置する。UIを持つ実行単位だけで使用する。 | `ui/primary_button` |
| `<source-root>/localization/` | 言語ごとの翻訳データと表示言語の選択を配置する。翻訳データ以外のコードと生成物を混在させない。 | `localization/ja` |
| `<source-root>/locale_format/` | 数値、日付、時刻、通貨、単位など、ロケールによって表記が変わる値の書式処理を配置する。 | `locale_format/number_format` |

### 依存方向

| 依存元 | 依存先 |
| --- | --- |
| `app/`、例外時の`bootstrap/` | 各Featureの公開API、`core/`、`infra/`、`ui/` |
| `core/` | 標準ライブラリと基盤の表現に必要な外部パッケージのみ。Feature、`infra/`、フレームワーク、外部システムのSDKには依存しない |
| `infra/` | 技術基盤の外部SDK、ライブラリのみ。Feature、業務型には依存しない |
| Feature内の`presentation/` | 同じFeatureの処理と型、別Featureが公開する業務型、処理とその呼び出し契約、再利用用のUIコンポーネント、`core/`、`ui/` |
| Feature内の`handlers/` | 同じFeatureの処理と型、`core/` |
| Feature内の処理 | 同じFeatureの`repositories/`、`gateways/`の契約と型、別Featureが公開する業務型、処理とその呼び出し契約、`core/` |
| `repositories/`、`gateways/`の実装 | 対応する契約、同じFeatureの型、外部SDK、外部データ形式 |
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
