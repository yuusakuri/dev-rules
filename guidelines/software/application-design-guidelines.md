# アプリケーション設計ガイドライン

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [データアクセス](#3-データアクセス)
4. [セキュリティ](#4-セキュリティ)
5. [CLI](#5-cli)
6. [参考資料](#6-参考資料)

---

## 1. 概要

本書は、アプリケーション設計ガイドラインを定義する。本書は、[ソフトウェア設計ガイドライン](software-design-guidelines.md)を前提とする。

---

## 2. フォルダ構成

本書と各実装ガイドラインのフォルダ構成表では、複数の実行単位を持つモノレポを例として示す。表のパスはリポジトリルートを基準とする。言語またはフレームワークによる配置の制限やガイドラインがある場合は、この表よりそちらを優先する。

各種ファイルとディレクトリは実際に必要な場合のみ作る。

`<source-root>`は、`apps/<app-name>/src/`、`apps/<app-name>/lib/`など、言語またはフレームワークが定めるソースルートを表す。実行単位が1つだけの場合は、各パスから`apps/<app-name>/`を取り除き、`src/`、`lib/`などをリポジトリ直下へ配置する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/` | [`app/`](https://github.com/android/nowinandroid/tree/main/app) | 実行単位ごとのアプリケーション。`<app-name>`は任意のアプリ名を指定する。`<project-name>-<responsibility>`を推奨する。 |
| `apps/<app-name>/config/` | [`config/`](https://github.com/juspay/hyperswitch/tree/main/config) | アプリケーションが読み込む設定値をまとめる必要がある場合だけ使用する。ビルドツールの設定ファイルは、そのツールが期待する位置へ置く。 |

### ソース構成

フォルダとモジュールは責務で分け、その責務が提供する内容を表す名前を付けてソースルート直下へ並べる。責務の境界は、外部資源、機能、概念の順に確認する。分類のためだけの階層を挟まずに責務の名前を直接並べると、読み手は目的のモジュールを名前だけで選べる。

`<technical-resource>`には、`postgres`、`stripe`、`s3`、`sentry`のような製品、サービス、プロトコルの名前、または`logging`、`clock`のような技術機能の名前を使用する。

Featureの名前には、`user`のように業務上の対象だけを表す語を使わず、`auth`、`search`、`checkout`のように何を提供するかが分かる語を使う。複数のFeatureで使う業務概念や外部システムの実装は、一つのFeatureが強く所有する場合はそのFeatureへ置き、公開APIを通じて参照する。どのFeatureにも寄らない場合は、それ自体を一つの責務として分ける。

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

---

## 3. データアクセス

### クエリ回数

関連するデータを一覧ごとに取得するN+1クエリを避ける。関連データは、結合、まとめて取得する処理、または読み取り専用モデルを使用して取得し、データ件数の増加による応答時間の悪化を防ぐ。

### 読み取りと書き込み

読み取りと書き込みで必要なデータ構造、性能、処理量、整合性が異なる場合は、CQRSを採用する。書き込み側は業務上の制約と整合性を扱い、読み取り側は呼び出し元が必要とする形式と応答性能を扱うことで、それぞれを独立して最適化できる。

---

## 4. セキュリティ

### 準拠する文書

セキュリティの設計は、次の3つの文書に従う。

| 対象 | 準拠する文書 | 決めること |
| --- | --- | --- |
| セキュリティ要求 | [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/) | アプリケーションが満たす検証レベルと、機能ごとに満たすべきセキュリティ要求。 |
| 認証要件 | [SP 800-63-4, Digital Identity Guidelines](https://csrc.nist.gov/pubs/sp/800/63/4/final) | 本人確認と認証に求める保証レベルと、採用する認証方式に求める強度。 |
| 実装方法 | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 認証情報の保存、多要素認証、認証失敗時の応答など、認証の実装方法。 |

### 機密情報

APIキー、アクセストークン、パスワード、秘密鍵、接続文字列をソースコードへ記述しない。実行環境の環境変数または機密情報管理サービスから取得し、`.env`をバージョン管理の対象外にする。機密情報は、ログへ出力されない型または仕組みで保護する。

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

## 6. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 2. フォルダ構成 | [App architecture \| Flutter](https://docs.flutter.dev/app-architecture/guide) | データを扱う層をRepositoryと外部データ源へ分ける構成を確認する。 |
| 2. フォルダ構成 | [Data layer \| Android Developers](https://developer.android.com/topic/architecture/data-layer) | 一つのデータ源につき一つの実装を持たせる構成を確認する。 |
| 2. フォルダ構成 | [Managing Growing Projects \| The Rust Programming Language](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html) | モジュールへ分ける時期と、パッケージへ切り出す時期を確認する。 |
| 2. フォルダ構成 | [core - Rust](https://doc.rust-lang.org/core/) | 実行環境に依存しない型とロジックが扱う範囲と、ヒープ確保、並行処理、I/Oを含めない理由を確認する。 |
| 2. フォルダ構成 | [rust/library/std/src at master · rust-lang/rust](https://github.com/rust-lang/rust/tree/master/library/std/src) | 提供する機能の名前をそのままモジュール名とし、抽象的な名前の階層を挟まない配置を確認する。 |
| 2. フォルダ構成 | [一般的なモジュール化のパターン \| Android Developers](https://developer.android.com/topic/modularization/patterns?hl=ja) | 機能を単位としてモジュールへ分ける考え方と、その粒度の決め方を確認する。 |
| 2. フォルダ構成 | [Internationalizing Flutter apps](https://docs.flutter.dev/ui/internationalization) | 翻訳データの配置と、表示言語を選ぶ仕組みを確認する。 |
| 2. フォルダ構成 | [NumberFormat \| Android Developers](https://developer.android.com/reference/android/icu/text/NumberFormat) | ロケールによって表記が変わる値を、書式処理として分けて扱う方法を確認する。 |
| 2. フォルダ構成 | [Flutterの`TextField`](https://github.com/flutter/flutter/blob/540a2711c83a08d5c40443058448782e4dfe34aa/packages/flutter/lib/src/material/text_field.dart#L1253)、[compass_appの`ErrorIndicator`](https://github.com/flutter/samples/blob/463e365e4842f252ffab9c6198594a504d69469f/compass_app/app/lib/ui/core/ui/error_indicator.dart#L10-L18) | 共有UI部品と文言の関係を確認する。`TextField`は文字数カウンタなど部品自身が生成する文言を`MaterialLocalizations`から取り、`ErrorIndicator`は表示する`title`と`label`を引数で受け取る。 |
| 3. データアクセス | [CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) | 読み取りと書き込みを分離する条件と構成を確認する。 |
| 4. セキュリティ | [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/) | アプリケーションが満たす検証レベルと、機能ごとのセキュリティ要求を確認する。 |
| 4. セキュリティ | [SP 800-63-4, Digital Identity Guidelines](https://csrc.nist.gov/pubs/sp/800/63/4/final) | 本人確認と認証に求める保証レベルと、認証方式ごとの強度を確認する。 |
| 4. セキュリティ | [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) | 外部入力を受け取る境界で検証する項目と方法を確認する。 |
| 4. セキュリティ | [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | 機密情報の保存、利用、記録を安全に扱う方法を確認する。 |
| 4. セキュリティ | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 認証情報を検証し、利用者を確定する方法を確認する。 |
| 4. セキュリティ | [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 操作ごとに権限を判定する方法を確認する。 |
