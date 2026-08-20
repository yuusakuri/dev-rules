# Rust固有規約

## 1. 概要

本書は、Rust固有の規則を定義する。本書は、[共通設計原則](../core/design-guidelines.md)を前提とする。

[The Rust Style Guide](https://doc.rust-lang.org/style-guide/)と[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html)に従う。

---

## 2. フォルダ構成

表のパスはリポジトリルートを基準とする。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/` | `apps/myproject-cli/src/` | アプリケーションのソースルート。 |
| `apps/<app-name>/src/app.rs` | `apps/myproject-cli/src/app.rs` | 起動、ライフサイクル、依存関係の生成と接続（Composition Root）を定義するモジュール。 |
| `apps/<app-name>/src/app/` | `apps/myproject-cli/src/app/cli.rs` | `app`の内部モジュールを配置する。 |
| `apps/<app-name>/src/core.rs` | `apps/myproject-cli/src/core.rs` | 複数のFeatureにまたがって同じ意味を持つドメイン型とエラー型（Shared Kernel）を公開するモジュール。特定のFeatureに閉じた型を、汎用ユーティリティ置き場として先回りして置かない。 |
| `apps/<app-name>/src/core/` | `apps/myproject-cli/src/core/user_id.rs` | `core`の内部モジュールを配置する。 |
| `apps/<app-name>/src/infra.rs` | `apps/myproject-cli/src/infra.rs` | 業務ロジックを持たない技術基盤（DB接続プール、ロガーなど）の構築処理を公開するモジュール。 |
| `apps/<app-name>/src/infra/` | `apps/myproject-cli/src/infra/http_client.rs` | `infra`の内部モジュールを配置する。 |
| `apps/<app-name>/src/features.rs` | `apps/myproject-cli/src/features.rs` | Featureモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>.rs` | `apps/myproject-cli/src/features/auth.rs` | Featureのルートモジュール。Feature外へ公開する型と関数を定義する。 |
| `apps/<app-name>/src/features/<feature>/` | `apps/myproject-cli/src/features/auth/` | Featureの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation.rs` | `apps/myproject-cli/src/features/auth/presentation.rs` | FeatureがUIを描画する境界と表示状態の制御を所有するモジュール。UIを持つFeatureだけで使用する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens.rs` | `apps/myproject-cli/src/features/auth/presentation/screens.rs` | 画面モジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | `apps/myproject-cli/src/features/auth/presentation/screens/sign_in.rs` | 画面単位の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets.rs` | `apps/myproject-cli/src/features/auth/presentation/widgets.rs` | Feature内で再利用するUI部品のモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets/` | `apps/myproject-cli/src/features/auth/presentation/widgets/password_field.rs` | 同じFeatureの表示で再利用するUI部品の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/handlers.rs` | `apps/myproject-cli/src/features/auth/handlers.rs` | FeatureがUIを介さずに外部からの要求を受け取る境界（HTTP、RPC、メッセージ、CLIなど）を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/handlers/` | `apps/myproject-cli/src/features/auth/handlers/sign_in_handler.rs` | Handlerの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/repositories.rs` | `apps/myproject-cli/src/features/auth/repositories.rs` | Featureが所有するデータを永続化ストレージへ保存、取得する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | `apps/myproject-cli/src/features/auth/repositories/http_auth_repository.rs` | Repositoryの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/gateways.rs` | `apps/myproject-cli/src/features/payment/gateways.rs` | 永続化以外の外部システム、外部サービスと通信する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/gateways/` | `apps/myproject-cli/src/features/payment/gateways/stripe_payment_gateway.rs` | Gatewayの内部モジュールを配置する。 |
| `apps/<app-name>/src/ui.rs` | `apps/myproject-cli/src/ui.rs` | 業務上の判断を持たないUIの公開境界。UIを持つ実行単位だけで使用する。 |
| `apps/<app-name>/src/ui/` | `apps/myproject-cli/src/ui/primary_button.rs` | UIの内部モジュールを配置する。 |
| `apps/<app-name>/src/localization.rs` | `apps/myproject-cli/src/localization.rs` | 表示言語の選択、翻訳の取得、地域別の書式化を定義する。多言語対応がある場合だけ使用する。 |
| `apps/<app-name>/locales/` | `apps/myproject-cli/locales/ja.ftl` | 翻訳リソースを言語ごとに配置する。 |
| `apps/<app-name>/src/features/<feature>.rs`内の`#[cfg(test)] mod tests` | `apps/myproject-cli/src/features/auth.rs`内の`#[cfg(test)] mod tests` | Featureの単体テスト。 |
| `apps/<app-name>/tests/integration.rs` | `apps/myproject-cli/tests/integration.rs` | `apps/<app-name>/tests/integration/<feature>.rs`を読み込む結合テストのエントリーポイント。 |
| `apps/<app-name>/tests/integration/<feature>.rs` | `apps/myproject-cli/tests/integration/auth.rs` | 機能単位の結合テスト。 |
| `apps/<app-name>/tests/e2e.rs` | `apps/myproject-cli/tests/e2e.rs` | `apps/<app-name>/tests/e2e/<flow>.rs`を読み込むE2Eテストのエントリーポイント。 |
| `apps/<app-name>/tests/e2e/<flow>.rs` | `apps/myproject-cli/tests/e2e/sign_in.rs` | フロー単位のE2Eテスト。 |
| `apps/<app-name>/benches/` | `apps/myproject-cli/benches/parse_benchmark.rs` | ベンチマークが必要な場合だけ使用する。 |
| `crates/<name>/` | `crates/design-tokens/` | 複数の実行単位から共有するRust crate。 |

---

## 3. Repository、Gatewayの実装

Repository、Gatewayの契約はtraitとして定義する。実行単位ごとに使用する実装は`app.rs`のComposition Rootで決定し、具体型として構築してFeatureへ渡す。

契約を受け取る側は、ジェネリクスとトレイト境界（型パラメータまたは`impl Trait`）で受け取り、静的ディスパッチで解決することを基本とする。

```rust
// 基本形：静的ディスパッチ。実装はコンパイル時に1つに決まる。
struct OrderService<R: OrderRepository> {
    repository: R,
}

// 実行時に複数の実装を切り替える必要がある場合だけ動的ディスパッチを使う。
struct NotificationDispatcher {
    channels: Vec<Box<dyn NotificationGateway>>,
}
```

---

## 4. 検証

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | 全crateのRustソースコード。 | `cargo fmt --all -- --check` |
| コンパイル可能でも不具合や保守性低下につながる記述を検出する。 | 全target、全featureのソースコードとテストコード。 | `cargo clippy --all-targets --all-features` |
| 変更による振る舞いの破壊を検出する。 | 全target、全featureの単体テスト、結合テスト、E2Eテスト。 | `cargo test --all-targets --all-features` |
