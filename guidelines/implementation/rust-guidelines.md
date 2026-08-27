# Rust固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [依存関係の構成とRepository、Gatewayの実装](#3-依存関係の構成とrepositorygatewayの実装)
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
| `apps/<app-name>/src/main.rs` | `apps/myproject-cli/src/main.rs` | 実行可能クレートのエントリーポイント。設定を読み、共有する外部資源と使用する実装を生成し、最上位の実行対象を組み立てて起動する。 |
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

---

## 3. 依存関係の構成とRepository、Gatewayの実装

本章のコード例は、axumの公式例`examples/dependency-injection`からの抜粋で、規則に関係しない行を削って載せている。削除以外の改変は、本規則と共通設計原則の命名に合わせた改名だけで、改名先の書き方の出典は「参考資料」に示す。

### 契約は交換する境界にだけ定義する

Repository、Gatewayの契約は、Featureを保存先や外部システムから独立させる場合にtraitとして定義する。契約には利用側が呼ぶ操作だけを置き、実装を交換しない処理まで一律にtraitへ変換しない。

共有状態やハンドラーから使う契約には、`Send + Sync`を付ける。

```rust
trait UserRepository: Send + Sync {
    fn get_user(&self, id: Uuid) -> Option<User>;

    fn save_user(&self, user: &User);
}

#[derive(Debug, Clone, Default)]
struct InMemoryUserRepository {
    map: Arc<Mutex<HashMap<Uuid, User>>>,
}

impl UserRepository for InMemoryUserRepository {
    fn get_user(&self, id: Uuid) -> Option<User> {
        self.map.lock().unwrap().get(&id).cloned()
    }

    fn save_user(&self, user: &User) {
        self.map.lock().unwrap().insert(user.id, user.clone());
    }
}
```

### `main`で依存関係を構成する

実行可能クレートでは、`main`で設定を読み、プロセス内で共有する外部資源と使用する実装を生成し、実行主体またはRouterへ渡してから実行を開始する。使用する実装の選択は`main`だけで行い、Featureの処理は渡された契約だけを見る。

```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let user_repository = InMemoryUserRepository::default();

    let app = Router::new()
        .route("/users/{id}", get(handle_get_user))
        .route("/users", post(handle_create_user))
        .with_state(AppState {
            user_repository: Arc::new(user_repository),
        });

    let listener = TcpListener::bind("127.0.0.1:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
```

### ハンドラーはフレームワークとの境界にとどめる

ハンドラーは、`State` extractorで共有状態を受け取り、リクエストの値を業務処理へ渡し、結果をレスポンスへ変換するだけにする。業務処理には、共有状態そのものではなく、その処理が必要とする契約を渡す。

```rust
#[derive(Clone)]
struct AppState {
    user_repository: Arc<dyn UserRepository>,
}

async fn handle_create_user(
    State(state): State<AppState>,
    Json(params): Json<UserParams>,
) -> Json<User> {
    let user = User {
        id: Uuid::new_v4(),
        name: params.name,
    };

    state.user_repository.save_user(&user);

    Json(user)
}
```

### ジェネリクスとtrait objectを使い分ける

契約の受け取り方は、コンパイル時に具体型が決まり、型パラメーターが利用側へ広がっても複雑にならない場合はジェネリクスを使用する。実行時に実装を選ぶ場合、異なる実装を同じコレクションへ保持する場合、またはフレームワークへ渡す状態の型を単純に保つ場合は、`Arc<dyn Trait>`や`Box<dyn Trait>`を使用する。

ジェネリクスで受け取る場合、型パラメーターは共有状態、ハンドラー、ルートの登録まで広がる。

```rust
#[derive(Clone)]
struct AppStateGeneric<T> {
    user_repository: T,
}

async fn handle_get_user_generic<T>(
    State(state): State<AppStateGeneric<T>>,
    Path(id): Path<Uuid>,
) -> Result<Json<User>, StatusCode>
where
    T: UserRepository,
{
    match state.user_repository.get_user(id) {
        Some(user) => Ok(Json(user)),
        None => Err(StatusCode::NOT_FOUND),
    }
}

let using_generic = Router::new()
    .route(
        "/users/{id}",
        get(handle_get_user_generic::<InMemoryUserRepository>),
    )
    .with_state(AppStateGeneric { user_repository });
```

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
| 3. 依存関係の構成とRepository、Gatewayの実装 | [axum `examples/dependency-injection`](https://github.com/tokio-rs/axum/blob/3d78036dcac289d6c1d54934708acb6a5bd73686/examples/dependency-injection/src/main.rs#L23-L169) | 本章のコード例の抜粋元。Repositoryの実装を`main`で生成してStateへ入れ、trait objectとジェネリクスの両方でハンドラーへ渡す。掲載時にログの初期化と、両方式を`nest`で同時に公開する構成を削っている。 |
| 3. 依存関係の構成とRepository、Gatewayの実装 | [Repository（PoEAA）](https://martinfowler.com/eaaCatalog/repository.html) | 抜粋元の`UserRepo`を`UserRepository`へ改名した際の、名前の出典。 |
| 3. 依存関係の構成とRepository、Gatewayの実装 | [rust-analyzer `handlers::request`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/handlers/request.rs#L60-L77) | 抜粋元の`create_user_dyn`などを`handle_create_user`へ改名した際の、`handle_`で始める書き方の出典。 |
| 3. 依存関係の構成とRepository、Gatewayの実装 | [rust-analyzer `main`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/bin/main.rs#L28-L38) | 抜粋元の`unwrap()`を`?`へ変えた際の、`main`が`anyhow::Result`を返す書き方の出典。 |
| 3. 依存関係の構成とRepository、Gatewayの実装 | [State in axum::extract](https://docs.rs/axum/latest/axum/extract/struct.State.html) | Routerへ共有状態を設定する方法と、必要な部分状態を`FromRef`で取り出す方法を確認する。 |
| 4. 検証 | [Clippy Documentation](https://doc.rust-lang.org/clippy/) | Clippyの実行方法とlintの設定を確認する。 |
