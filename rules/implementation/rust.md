# Rust固有規則

> 適用対象: Rustのソースコード、テスト、crate構成を変更する場合。

## 1. 適用範囲

本書は、開発におけるRust固有の規則を定義する。

[The Rust Style Guide](https://doc.rust-lang.org/style-guide/)および[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html)に従う。

---

## 2. フォルダ構成

表のパスはリポジトリルートを基準とする。

| パス | 説明 |
| ---- | ---- |
| `apps/<app-name>/src/` | アプリケーションのソースルート。 |
| `apps/<app-name>/src/app.rs` | 起動、ライフサイクル、依存関係の生成と接続（Composition Root）を定義するモジュール。 |
| `apps/<app-name>/src/app/` | `app`の内部モジュールを配置する。 |
| `apps/<app-name>/src/core.rs` | 複数のFeatureにまたがって同じ意味を持つドメイン型とエラー型（Shared Kernel）を公開するモジュール。特定のFeatureに閉じた型を、汎用ユーティリティ置き場として先回りして置かない。使用する場合だけ配置する。 |
| `apps/<app-name>/src/core/` | `core`の内部モジュールを配置する。 |
| `apps/<app-name>/src/infra.rs` | 業務ロジックを持たない技術基盤（DB接続プール、ロガーなど）の構築処理を公開するモジュール。使用する場合だけ配置する。 |
| `apps/<app-name>/src/infra/` | `infra`の内部モジュールを配置する。 |
| `apps/<app-name>/src/features.rs` | Featureモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>.rs` | Featureのルートモジュール。Feature外へ公開する型と関数を定義する。 |
| `apps/<app-name>/src/features/<feature>/` | Featureの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation.rs` | FeatureがUIを描画する境界と表示状態の制御を所有するモジュール。UIを持つFeatureだけで使用する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens.rs` | 画面モジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | 画面単位の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets.rs` | Feature内で再利用するUI部品のモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets/` | 同じFeatureの表示で再利用するUI部品の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/handlers.rs` | FeatureがUIを介さずに外部からの要求を受け取る境界（HTTP、RPC、メッセージ、CLIなど）を所有するモジュール。使用する場合だけ配置する。 |
| `apps/<app-name>/src/features/<feature>/handlers/` | Handlerの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/repositories.rs` | Featureが所有するデータを永続化ストレージへ保存、取得する契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | Repositoryの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/gateways.rs` | 永続化以外の外部システム、外部サービスと通信する契約と実装を所有するモジュール。使用する場合だけ配置する。 |
| `apps/<app-name>/src/features/<feature>/gateways/` | Gatewayの内部モジュールを配置する。 |
| `apps/<app-name>/src/ui.rs` | 業務上の判断を持たないUIの公開境界。UIを持つ実行単位だけで使用する。 |
| `apps/<app-name>/src/ui/` | UIの内部モジュールを配置する。 |
| `apps/<app-name>/src/localization.rs` | 表示言語の選択、翻訳の取得、地域別の書式化を定義する。多言語対応がある場合だけ使用する。 |
| `apps/<app-name>/locales/` | 翻訳リソースを言語ごとに配置する。 |
| `apps/<app-name>/src/features/<feature>.rs`内の`#[cfg(test)] mod tests` | Featureの単体テスト。 |
| `apps/<app-name>/tests/integration.rs` | `apps/<app-name>/tests/integration/<feature>.rs`を読み込む結合テストのエントリーポイント。 |
| `apps/<app-name>/tests/integration/<feature>.rs` | 機能単位の結合テスト。 |
| `apps/<app-name>/tests/e2e.rs` | `apps/<app-name>/tests/e2e/<flow>.rs`を読み込むE2Eテストのエントリーポイント。 |
| `apps/<app-name>/tests/e2e/<flow>.rs` | フロー単位のE2Eテスト。 |
| `apps/<app-name>/benches/` | ベンチマークが必要な場合だけ使用する。 |
| `crates/<name>/` | 複数の実行単位から共有するRust crate。 |

`presentation`と`handlers`はどちらか一方、または両方を状況に応じて使用する。UIを描画する境界には`presentation`、HTTPサーバーやRPCサーバーなどUIを介さず外部からの要求を受け取る境界には`handlers`を使う。

---

## 3. Repository、Gatewayの実装

Repository、Gatewayの契約はtraitとして定義する。実行単位ごとに使用する実装は`app.rs`のComposition Rootで決定し、具体型として構築してFeatureへ渡す。

契約を受け取る側は、`Box<dyn Trait>`ではなくジェネリクスとトレイト境界（型パラメータまたは`impl Trait`）で受け取り、静的ディスパッチで解決することを基本とする。1つの実行単位で使う実装は1つに決まっていることが多く、`Box<dyn Trait>`をコード全体へ浸透させると、trait境界がオブジェクトセーフの制約を受け、`Box`によるラップが呼び出し元にまで伝播する。

`Box<dyn Trait>`は、同じ実行の中で複数の実装を実行時に選択する必要がある場合（プラグイン的な選択、コンパイル時の型パラメータでは表現しにくい動的な差し替えなど）に限定して使う。

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
|---|---|---|
| コードの書式を統一し、機械的な差分を防ぐ。 | 全crateのRustソースコード。 | `cargo fmt --all -- --check` |
| コンパイル可能でも不具合や保守性低下につながる記述を検出する。 | 全target、全featureのソースコードとテストコード。 | `cargo clippy --all-targets --all-features` |
| 変更による振る舞いの破壊を検出する。 | 全target、全featureの単体テスト、結合テスト、E2Eテスト。 | `cargo test --all-targets --all-features` |
