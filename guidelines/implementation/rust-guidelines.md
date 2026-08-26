# Rust固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [Composition Root](#3-composition-root)
4. [Repository、Gatewayの実装](#4-repositorygatewayの実装)
5. [検証](#5-検証)

---

## 1. 概要

本書は、Rust固有の規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)を前提とする。

[The Rust Style Guide](https://doc.rust-lang.org/style-guide/)と[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html)に従う。

---

## 2. フォルダ構成

表のパスはリポジトリルートを基準とする。

表は複数の実行単位を持つモノレポの構成を示す。実行単位が1つだけの場合は、各パスから`apps/<app-name>/`を取り除き、`Cargo.toml`、`src/`、`tests/`などをリポジトリ直下へ配置する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/` | `apps/myproject-cli/src/` | アプリケーションのソースルート。 |
| `apps/<app-name>/src/app.rs` | `apps/myproject-cli/src/app.rs` | 起動、ライフサイクル、依存関係の生成と接続（Composition Root）を定義するモジュール。 |
| `apps/<app-name>/src/app/` | `apps/myproject-api/src/app/auth.rs` | Featureまたは実行経路ごとのComposition Root内部モジュールを配置する。 |
| `apps/<app-name>/src/app/state.rs` | `apps/myproject-api/src/app/state.rs` | Webフレームワークへ登録する共有状態を一つの型へ束ねる場合だけ使用する。 |
| `apps/<app-name>/src/core.rs` | `apps/myproject-cli/src/core.rs` | 複数のFeatureにまたがって同じ意味を持つドメイン型とエラー型（Shared Kernel）を公開するモジュール。 |
| `apps/<app-name>/src/core/` | `apps/myproject-cli/src/core/identity.rs`、`apps/myproject-cli/src/core/identity/user_id.rs` | 業務概念ごとのサブモジュールを宣言し、その内部モジュールを配置する。 |
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
| `apps/<app-name>/src/features/<feature>/repositories.rs` | `apps/myproject-cli/src/features/order/repositories.rs` | Featureが所有するデータを永続化ストレージへ保存、取得する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | `apps/myproject-cli/src/features/order/repositories/postgres_order_repository.rs` | 保存先ごとのRepository実装と、保存形式との変換を行う内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/gateways.rs` | `apps/myproject-cli/src/features/payment/gateways.rs` | 永続化以外の外部システム、外部サービスと通信する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/gateways/` | `apps/myproject-cli/src/features/payment/gateways/stripe_payment_gateway.rs` | 接続先別のGateway実装と、外部データ形式との変換を行う内部モジュールを配置する。 |
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

別Featureの要素は、依存先Featureのルートモジュールが`pub use`で再公開したものだけを参照し、依存先の内部モジュールを直接参照しない。別FeatureのUI部品を利用する側は、公開された引数とコールバックだけを使い、依存先の表示状態を直接操作しない。

UIを持つアプリケーションでは、Featureから別Featureのルートを参照しない。画面とUI部品は遷移が必要になったことをコールバックまたはメッセージで通知し、`app`のルーターが遷移先を決定する。

---

## 3. Composition Root

### 構成単位への分割

`app.rs`が複数のFeatureや実行経路を直接構成し、依存関係を追跡しにくくなる場合は、`app/<feature>.rs`、`app/http.rs`、`app/jobs.rs`などへ生成処理を分ける。`app.rs`は共有資源を生成して各モジュールを接続し、`main.rs`はプロセスの開始に必要な値を受け取って`app`を呼び出す。

```text
src/
├── app.rs
├── app/
│   ├── auth.rs
│   ├── dashboard.rs
│   └── state.rs
└── main.rs
```

```rust
// app/dashboard.rs
pub(super) fn build_dashboard(database: DatabasePool) -> DashboardHandler {
    let repository = PostgresDashboardRepository::new(database);
    let service = DashboardService::new(repository);

    DashboardHandler::new(service)
}
```

共有資源は引数で受け取り、構築済みのHandler、Router、Controllerなど、そのFeatureの公開境界を返す。生成関数には認可、入力検証、データ加工などの業務処理を記述しない。

### Webアプリケーションの共有状態

AxumやActix Webで複数のHandlerが使う外部資源を一つの状態型へ束ねる場合は、`app/state.rs`に`AppState`を定義し、Composition Rootで生成してフレームワークへ登録する。`AppState`には共有する外部資源のハンドル、設定、構築済みのFeature状態だけを保持し、任意の型を検索する`resolve`のような機能を持たせない。

```rust
// app/state.rs
#[derive(Clone)]
pub struct AppState {
    pub(super) database: DatabasePool,
    pub(super) config: Arc<AppConfig>,
}

// app/dashboard.rs
pub(super) fn build_dashboard(state: &AppState) -> DashboardHandler {
    let repository = PostgresDashboardRepository::new(state.database.clone());
    let service = DashboardService::new(repository);

    DashboardHandler::new(service)
}
```

`AppState`全体を受け取れる範囲はComposition Rootとフレームワーク境界に限定する。FeatureのServiceやRepositoryには必要な依存関係を個別に渡し、`Database::global()`や`Container::resolve::<Database>()`のように処理の内部から依存関係を取得しない。

AxumのHandlerが一部の状態しか使わない場合は、Feature固有の状態型を定義し、`FromRef<AppState>`による部分状態として`State(feature_state): State<FeatureState>`の形で受け取る。Actix Webでは、用途ごとの状態型を`web::Data<T>`として登録し、Handlerの引数に必要な型だけを宣言する。`web::Data<T>`や接続プールなど、内部で共有所有を実装する型をさらに`Arc`で包まず、共有所有が必要で安価な複製手段を持たない型だけに`Arc<T>`を使用する。

---

## 4. Repository、Gatewayの実装

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

## 5. 検証

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | 全crateのRustソースコード。 | `cargo fmt --all -- --check` |
| コンパイル可能でも不具合や保守性低下につながる記述を検出し、警告を残さない。 | 全workspace、全target、全featureのソースコードとテストコード。 | `cargo clippy --workspace --all-targets --all-features -- -D warnings` |
| 変更による振る舞いの破壊を検出する。 | 全workspace、全target、全featureの単体テスト、結合テスト、E2Eテスト、ドキュメントテスト。 | `cargo test --workspace --all-targets --all-features`、`cargo test --workspace --doc --all-features` |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべての`Cargo.lock`。 | `osv-scanner scan source -r .` |
