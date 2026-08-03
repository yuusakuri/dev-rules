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
| `apps/<app-name>/src/app.rs` | 起動、ライフサイクル、依存関係の生成と接続を定義するモジュール。 |
| `apps/<app-name>/src/app/` | `app`の内部モジュールを配置する。 |
| `apps/<app-name>/src/features.rs` | Featureモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>.rs` | Featureのルートモジュール。Feature外へ公開する型と関数を定義する。 |
| `apps/<app-name>/src/features/<feature>/` | Featureの内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation.rs` | FeatureのUIと表示状態の制御を所有するモジュール。UIを持つFeatureだけで使用する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens.rs` | 画面モジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | 画面単位の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets.rs` | Feature内で再利用するUI部品のモジュールを宣言する。 |
| `apps/<app-name>/src/features/<feature>/presentation/widgets/` | 同じFeatureの表示で再利用するUI部品の内部モジュールを配置する。 |
| `apps/<app-name>/src/features/<feature>/repositories.rs` | Featureが使用するデータ操作の契約と実装を所有するモジュール。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | Repositoryの内部モジュールを配置する。 |
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

---

## 3. 検証

| 目的 | 検証対象 | ツール |
|---|---|---|
| コードの書式を統一し、機械的な差分を防ぐ。 | 全crateのRustソースコード。 | `cargo fmt --all -- --check` |
| コンパイル可能でも不具合や保守性低下につながる記述を検出する。 | 全target、全featureのソースコードとテストコード。 | `cargo clippy --all-targets --all-features` |
| 変更による振る舞いの破壊を検出する。 | 全target、全featureの単体テスト、結合テスト、E2Eテスト。 | `cargo test --all-targets --all-features` |
