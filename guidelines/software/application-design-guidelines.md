# アプリケーション設計ガイドライン

## 1 はじめに

### 1.1 目的

本書は、アプリケーションの保守性、性能及びセキュリティの向上を目的とする。

### 1.2 適用範囲

本書は、アプリケーションの設計について規定する。本書は、[ソフトウェア設計ガイドライン](software-design-guidelines.md)を前提とする。

## 2 フォルダ構成

本書と各実装ガイドラインのフォルダ構成表では、複数の実行単位を持つモノレポを例として示す。表のパスはリポジトリルートを基準とする。言語又はフレームワークによる配置の制限やガイドラインがある場合は、この表よりそちらを優先する。

各種ファイルとディレクトリは実際に必要な場合のみ作る。

`<source-root>`は、`apps/<app-name>/src/`、`apps/<app-name>/lib/`など、言語又はフレームワークが定めるソースルートを表す。実行単位が一つだけの場合は、各パスから`apps/<app-name>/`を取り除き、`src/`、`lib/`などをリポジトリ直下へ配置する。

フォルダ構成は、[表1](#table-1)による。

<a id="table-1"></a>表1−フォルダ構成

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/` | [`app/`](https://github.com/android/nowinandroid/tree/main/app) | 実行単位ごとのアプリケーション。`<app-name>`は任意のアプリ名を指定する。`<project-name>-<responsibility>`を推奨する。 |
| `apps/<app-name>/config/` | [`config/`](https://github.com/juspay/hyperswitch/tree/main/config) | アプリケーションが読み込む設定値をまとめる必要がある場合だけ使用する。ビルドツールの設定ファイルは、そのツールが期待する位置へ置く。 |

フォルダとモジュールは責務で分け、その責務が提供する内容を表す名前を付けてソースルート直下へ並べる。責務の境界は、外部資源、機能、概念の順に確認する。分類のためだけの階層を挟まずに責務の名前を直接並べると、読み手は目的のモジュールを名前だけで選べる。

`<technical-resource>`には、`postgres`、`stripe`、`s3`、`sentry`のような製品、サービス、プロトコルの名前、又は`logging`、`clock`のような技術機能の名前を使用する。

Featureの名前には、`user`のように業務上の対象だけを表す語を使わず、`auth`、`search`、`checkout`のように何を提供するかが分かる語を使う。複数のFeatureで使う業務概念や外部システムの実装は、一つのFeatureが強く所有する場合はそのFeatureへ置き、公開APIを通じて参照する。どのFeatureにも寄らない場合は、それ自体を一つの責務として分ける。

フォルダ構成は、[表2](#table-2)による。

<a id="table-2"></a>表2−フォルダ構成

| パス | 例 | 説明 |
| --- | --- | --- |
| `<source-root>/app/` | [`routing/`](https://github.com/flutter/samples/tree/main/compass_app/app/lib/routing) | ルーティングと、アプリケーション全体の実行経路との接続を配置する。 |
| `<source-root>/<technical-resource>/` | [stdの`net`](https://github.com/rust-lang/rust/tree/master/library/std/src/net)、[hyperswitchの`router_env/logger`](https://github.com/juspay/hyperswitch/tree/main/crates/router_env/src/logger)、[sqlxの`pool`](https://github.com/launchbadge/sqlx/tree/main/sqlx-core/src/pool)、[hyperswitchの`redis_interface`](https://github.com/juspay/hyperswitch/tree/main/crates/redis_interface) | ロガー、DB接続プール、キャッシュ接続、現在時刻の取得のように、Featureの型や業務ルールに依存しない構築処理と供給を配置し、起動点から呼び出す。同じ技術資源で接続先が複数ある場合もディレクトリは一つとし、接続先ごとの違いは起動点で設定を与えて生成し分ける。 |
| `<source-root>/<feature>/` | [Zedの`crates/search`](https://github.com/zed-industries/zed/tree/main/crates/search) | Featureに必要な型、処理、状態、境界、外部接続を配置する。HTTP、RPC、メッセージ、CLIなど外部からの要求を受け取る処理も、そのFeatureへ置く。 |
| `<source-root>/<feature>/presentation/` | [mihonの`presentation-core`](https://github.com/mihonapp/mihon/tree/main/presentation-core) | FeatureがUIを描画する境界と、表示状態の制御を配置する。UIを持つFeatureだけで使用する。 |
| `<source-root>/<concept>/` | [Rustの`core/src/time.rs`](https://github.com/rust-lang/rust/blob/master/library/core/src/time.rs)、[qdrantの`id_tracker`](https://github.com/qdrant/qdrant/tree/master/lib/segment/src/id_tracker) | 実行環境にも特定のFeatureにも依存しない型とロジックを、概念ごとに配置する。 |
| `<source-root>/ui/` | [compass_appの`ui/core/ui`](https://github.com/flutter/samples/tree/main/compass_app/app/lib/ui/core/ui) | 複数のFeatureで使用し、業務上の判断を持たないUI部品を配置する。UIを持つ実行単位だけで使用する。アプリケーションが決める文言は引数で受け取り、部品自身が生成する文言だけ多言語対応とロケール書式を参照する。 |
| `<source-root>/<localization>/` | [mihonの`i18n`](https://github.com/mihonapp/mihon/tree/main/i18n) | 言語ごとの翻訳データと表示言語の選択を配置する。 |
| `<source-root>/locale_format/` | [intlの`lib/src/intl`](https://github.com/dart-lang/i18n/tree/main/pkgs/intl/lib/src/intl) | 数値、日付、時刻、通貨、単位など、ロケールによって表記が変わる値の書式処理を配置する。 |

## 3 データアクセス

### 3.1 クエリ回数

関連するデータを一覧ごとに取得するN+1クエリを避ける。関連データは、結合、まとめて取得する処理、又は読み取り専用モデルを使用して取得し、データ件数の増加による応答時間の悪化を防ぐ。

### 3.2 読み取りと書き込み

読み取りと書き込みで必要なデータ構造、性能、処理量、整合性が異なる場合は、CQRSを採用する。書き込み側は業務上の制約と整合性を扱い、読み取り側は呼び出し元が必要とする形式と応答性能を扱うことで、それぞれを独立して最適化できる。

## 4 セキュリティ

### 4.1 準拠する文書

セキュリティの設計は、次の三つの文書に従う。

準拠する文書は、[表3](#table-3)による。

<a id="table-3"></a>表3−準拠する文書

| 対象 | 準拠する文書 | 決めること |
| --- | --- | --- |
| セキュリティ要求 | [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/) | アプリケーションのセキュリティ要求を示す。 |
| 認証要件 | [SP 800-63-4, Digital Identity Guidelines](https://csrc.nist.gov/pubs/sp/800/63/4/final) | 認証の保証レベルを示す。 |
| 実装方法 | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 認証情報を検証し、利用者を確定する方法を示す。 |

### 4.2 機密情報

APIキー、アクセストークン、パスワード、秘密鍵、接続文字列をソースコードへ記述しない。実行環境の環境変数又は機密情報管理サービスから取得し、`.env`をバージョン管理の対象外にする。機密情報は、ログへ出力されない型又は仕組みで保護する。

## 5 CLI

Shell スクリプト以外の CLI に適用する。

CLIは、[表4](#table-4)による。

<a id="table-4"></a>表4−CLI

| 対象 | 規定 | 例 |
| --- | --- | --- |
| 引数名 | 単語をハイフンで区切り、先頭に`--`を付ける。 | `--arg-name` |
| ファイルを受け取る引数 | 名前を`file`で終える。 | `--input-file`、`--config-file` |
| ディレクトリを受け取る引数 | 名前を`dir`で終える。 | `--output-dir` |
| 出力先を指定する引数 | 名前を`output`で始める。 | `--output-file`、`--output-dir` |
| ファイルパス | ファイル名に空白が含まれる場合も、正しく動作する。 | `--input-file "sample data.csv"` |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2章 | [App architecture \| Flutter](https://docs.flutter.dev/app-architecture/guide) | データ層の構成を示す。 |
| 2章 | [Data layer \| Android Developers](https://developer.android.com/topic/architecture/data-layer) | 一つのデータ源につき一つの実装を持たせる構成を示す。 |
| 2章 | [Managing Growing Projects \| The Rust Programming Language](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html) | コードを分割する時期を示す。 |
| 2章 | [core - Rust](https://doc.rust-lang.org/core/) | 実行環境に依存しない部分が扱う範囲を示す。 |
| 2章 | [rust/library/std/src at master · rust-lang/rust](https://github.com/rust-lang/rust/tree/master/library/std/src) | 機能名をモジュール名とする配置を示す。 |
| 2章 | [一般的なモジュール化のパターン \| Android Developers](https://developer.android.com/topic/modularization/patterns?hl=ja) | 機能を単位としたモジュールの分け方を示す。 |
| 2章 | [Internationalizing Flutter apps](https://docs.flutter.dev/ui/internationalization) | 多言語対応の仕組みを示す。 |
| 2章 | [NumberFormat \| Android Developers](https://developer.android.com/reference/android/icu/text/NumberFormat) | ロケールによって表記が変わる値を、書式処理として分けて扱う方法を示す。 |
| 2章 | [Flutterの`TextField`](https://github.com/flutter/flutter/blob/540a2711c83a08d5c40443058448782e4dfe34aa/packages/flutter/lib/src/material/text_field.dart#L1253)、[compass_appの`ErrorIndicator`](https://github.com/flutter/samples/blob/463e365e4842f252ffab9c6198594a504d69469f/compass_app/app/lib/ui/core/ui/error_indicator.dart#L10-L18) | 共有UI部品が表示する文言の受け取り方を示す。 |
| 3章 | [CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) | 3章とを分離する設計パターンを示す。 |
| 4章 | [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/) | アプリケーションのセキュリティ要求を示す。 |
| 4章 | [SP 800-63-4, Digital Identity Guidelines](https://csrc.nist.gov/pubs/sp/800/63/4/final) | 認証の保証レベルを示す。 |
| 4章 | [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 外部入力の検証方法を示す。 |
| 4章 | [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | 4章を安全に扱う方法を示す。 |
| 4章 | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 認証情報を検証し、利用者を確定する方法を示す。 |
| 4章 | [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 操作ごとに権限を判定する方法を示す。 |
