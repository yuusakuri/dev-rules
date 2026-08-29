# Rust固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [契約と実装の受け渡し](#3-契約と実装の受け渡し)
4. [検証](#4-検証)
5. [参考資料](#5-参考資料)

---

## 1. 概要

本書は、Rust固有の規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)を前提とする。

記述方法は、「参考資料」のThe Rust Style GuideとRust API Guidelinesに従う。

---

## 2. フォルダ構成

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/` | `apps/myproject-cli/src/` | アプリケーションのソースルート。 |
| `apps/<app-name>/src/app.rs` | `apps/myproject-cli/src/app.rs` | 起動と実行経路との接続を公開するルートモジュール。 |
| `apps/<app-name>/src/app/` | `apps/myproject-cli/src/app/commands.rs` | 起動と実行経路との接続を担う内部モジュールを配置する。 |
| `apps/<app-name>/src/app/bootstrap/` | `apps/myproject-cli/src/app/bootstrap/mod.rs`、`apps/myproject-cli/src/app/bootstrap/postgres.rs` | 依存関係を生成して接続するComposition Rootを配置する。接続先、外部資源、依存先が扱う領域ごとにモジュールを分ける。 |
| `apps/<app-name>/src/app/state.rs` | `apps/myproject-api/src/app/state.rs` | Webフレームワークへ登録する共有状態を一つの型へまとめる場合だけ使用する。 |
| `apps/<app-name>/src/core.rs` | `apps/myproject-cli/src/core.rs` | 共有する基盤のモジュールを宣言する。 |
| `apps/<app-name>/src/core/<name>/` | `apps/myproject-cli/src/core/errors.rs`、`apps/myproject-cli/src/core/clock/system_clock.rs` | 複数のFeatureが共有する基盤を、対象ごとの内部モジュールへ配置する。 |
| `apps/<app-name>/src/infra.rs` | `apps/myproject-cli/src/infra.rs` | 業務ロジックを持たない技術基盤（DB接続プール、ロガーなど）の構築処理を公開するモジュール。 |
| `apps/<app-name>/src/infra/` | `apps/myproject-cli/src/infra/postgres.rs`、`apps/myproject-cli/src/infra/postgres/connection_pool.rs` | 外部資源ごとのサブモジュールを宣言し、その内部モジュールを配置する。 |
| `apps/<app-name>/src/features.rs` | `apps/myproject-cli/src/features.rs` | Featureモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>.rs` | `apps/myproject-cli/src/features/auth.rs` | Featureのルートモジュール。Feature外へ公開する型、関数、UI部品を定義または再公開する。別Featureは、このモジュールが公開する業務型、処理とその呼び出し契約、再利用用のUI部品だけを参照する。 |
| `apps/<app-name>/src/features/<feature>/` | `apps/myproject-cli/src/features/auth/` | Featureの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation.rs` | `apps/myproject-cli/src/features/auth/presentation.rs` | FeatureがUIを描画する境界と表示状態の制御を所有するモジュール。UIを持つFeatureだけで使用する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens.rs` | `apps/myproject-cli/src/features/auth/presentation/screens.rs` | 画面モジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | `apps/myproject-cli/src/features/auth/presentation/screens/sign_in.rs` | 画面単位の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets.rs` | `apps/myproject-cli/src/features/auth/presentation/widgets.rs` | Featureが所有する表示で再利用するUI部品のモジュールを宣言する。別Featureでも再利用するUI部品は、Featureのルートモジュールから明示的に再公開する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets/` | `apps/myproject-cli/src/features/auth/presentation/widgets/password_field.rs` | Featureが所有する表示で再利用するUI部品の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/handlers.rs` | `apps/myproject-cli/src/features/auth/handlers.rs` | FeatureがUIを介さずに外部からの要求を受け取る境界（HTTP、RPC、メッセージ、CLIなど）を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/handlers/` | `apps/myproject-cli/src/features/auth/handlers/sign_in_handler.rs` | Handlerの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/repositories.rs` | `apps/myproject-cli/src/features/checkout/repositories.rs` | Featureが所有するデータを永続化ストレージへ保存、取得する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | `apps/myproject-cli/src/features/checkout/repositories/postgres_order_repository.rs` | 保存先ごとのRepository実装と、保存形式との変換を行う内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/connectors.rs` | `apps/myproject-cli/src/features/payment/connectors.rs` | ネットワーク越しの外部サービスを利用する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/connectors/` | `apps/myproject-cli/src/features/payment/connectors/stripe_client.rs` | 接続先別の実装と、外部データ形式との変換を行う内部モジュールを配置する。ファイル名は実装の型名に合わせる（例: `stripe_client.rs`、`smtp_mailer.rs`）。 |
| `apps/<app-name>/src/ui.rs` | `apps/myproject-cli/src/ui.rs` | 業務上の判断を持たないUIの公開境界。UIを持つ実行単位だけで使用する。 |
| `apps/<app-name>/src/ui/` | `apps/myproject-cli/src/ui/primary_button.rs` | UIの内部モジュールを配置する。 |
| `apps/<app-name>/src/localization.rs` | `apps/myproject-cli/src/localization.rs` | 表示言語の選択と翻訳の取得を定義する。多言語対応がある場合だけ使用する。 |
| `apps/<app-name>/src/locale_format.rs` | `apps/myproject-cli/src/locale_format.rs` | 数値、日付、通貨などの書式処理を定義する。翻訳の取得とは分けて定義する。 |
| `apps/<app-name>/locales/` | `apps/myproject-cli/locales/ja.ftl` | 翻訳リソースを言語ごとに配置する。 |
| `apps/<app-name>/src/features/<feature>.rs`内の`#[cfg(test)] mod tests` | `apps/myproject-cli/src/features/auth.rs`内の`#[cfg(test)] mod tests` | Featureの単体テスト。 |
| `apps/<app-name>/tests/integration.rs` | `apps/myproject-cli/tests/integration.rs` | `apps/<app-name>/tests/integration/<feature>.rs`を読み込む結合テストのエントリーポイント。 |
| `apps/<app-name>/tests/integration/<feature>.rs` | `apps/myproject-cli/tests/integration/auth.rs` | 機能単位の結合テスト。 |
| `apps/<app-name>/tests/e2e.rs` | `apps/myproject-cli/tests/e2e.rs` | `apps/<app-name>/tests/e2e/<flow>.rs`を読み込むE2Eテストのエントリーポイント。 |
| `apps/<app-name>/tests/e2e/<flow>.rs` | `apps/myproject-cli/tests/e2e/sign_in.rs` | フロー単位のE2Eテスト。 |
| `apps/<app-name>/benches/` | `apps/myproject-cli/benches/parse_benchmark.rs` | ベンチマークが必要な場合だけ使用する。 |
| `crates/<name>/` | `crates/design-tokens/` | 複数の実行単位から共有するRust crate。 |

---

## 3. 契約と実装の受け渡し

永続化と外部資源の境界の契約はtraitとして定義する。契約と実装の置き場所は、[アプリケーション設計規則](../core/application-design-guidelines.md)の「外部依存の配置」に従う。

実行単位ごとに使用する実装は`app/bootstrap/`のComposition Rootで決定し、具体型として構築してFeatureへ渡す。

契約を受け取る側は、型パラメータまたは`impl Trait`のトレイト境界で受け取り、静的ディスパッチで解決する。実行時に複数の実装を切り替える必要がある場合だけ、`Box<dyn Trait>`による動的ディスパッチを使う。

---

## 4. 検証

テストは「フォルダ構成」に従って配置する。実行コマンドは、各プロジェクトで定義する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | 全crateのRustソースコード。 | `cargo fmt --all -- --check` |
| コンパイル可能でも不具合や保守性低下につながる記述を検出し、警告を残さない。 | 全workspace、全target、全featureのソースコードとテストコード。 | `cargo clippy --workspace --all-targets --all-features -- -D warnings` |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべての`Cargo.lock`。 | `osv-scanner scan source -r .` |

---

## 5. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 1. 概要 | [The Rust Style Guide](https://doc.rust-lang.org/style-guide/) | Rustコードの書式と記述方法を確認する。 |
| 1. 概要 | [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html) | 公開APIの命名、型、ドキュメントの基準を確認する。 |
| 2. フォルダ構成 | [Cargo Guide: Package Layout](https://doc.rust-lang.org/cargo/guide/project-layout.html) | Cargoパッケージの標準的なファイルとフォルダの配置を確認する。 |
| 4. 検証 | [Clippy Documentation](https://doc.rust-lang.org/clippy/) | Clippyの実行方法とlintの設定を確認する。 |
