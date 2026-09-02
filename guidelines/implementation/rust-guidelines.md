# Rust固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [ディスパッチ](#3-ディスパッチ)
4. [検証](#4-検証)
5. [参考資料](#5-参考資料)

---

## 1. 概要

本書は、Rust固有の規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)を前提とする。

記述方法は、「参考資料」のThe Rust Style GuideとRust API Guidelinesに従う。

---

## 2. フォルダ構成

`<crate>`は`Cargo.toml`を置くcrateのルートを表す。Cargoの標準配置ではソースルートを`src/`とし、`Cargo.toml`でtargetのパスを指定した場合はその設定に従う。

[アプリケーション設計規則](../core/application-design-guidelines.md)のソース構成をソースルート内のモジュールとして表す。次の表では、RustとCargoに固有の配置だけを示す。

| パス | 例 | 説明 |
| --- | --- | --- |
| `<crate>/src/lib.rs` | [Tokioの`tokio/src/lib.rs`](https://github.com/tokio-rs/tokio/blob/master/tokio/src/lib.rs) | ライブラリcrateのルート。公開するモジュールと再公開するAPIを定義する。 |
| `<crate>/src/main.rs`、`<crate>/src/bin/<binary>.rs`、`<crate>/src/bin/<binary>/main.rs` | [Helixの`helix-term/src/main.rs`](https://github.com/helix-editor/helix/blob/master/helix-term/src/main.rs)、[rust-analyzerの`src/bin/rustc_wrapper.rs`](https://github.com/rust-lang/rust-analyzer/blob/master/crates/rust-analyzer/src/bin/rustc_wrapper.rs)、[Cargoの`src/bin/cargo/main.rs`](https://github.com/rust-lang/cargo/blob/master/src/bin/cargo/main.rs) | 実行可能crateのエントリーポイント。既定のバイナリは`main.rs`を使用し、複数のバイナリまたは名前付きバイナリは`src/bin/`へ分ける。 |
| `<crate>/src/<module>.rs`、`<crate>/src/<module>/mod.rs`、`<crate>/src/<module>/` | [rust-analyzerの`global_state.rs`](https://github.com/rust-lang/rust-analyzer/blob/master/crates/rust-analyzer/src/global_state.rs)、[Tokioの`runtime/mod.rs`](https://github.com/tokio-rs/tokio/blob/master/tokio/src/runtime/mod.rs)、[rust-analyzerの`handlers/`](https://github.com/rust-lang/rust-analyzer/tree/master/crates/rust-analyzer/src/handlers) | モジュールを定義し、必要に応じて複数ファイルへ分ける。親モジュールは`<module>.rs`、`<module>/mod.rs`、またはcrate root内のインラインモジュールで宣言し、同じcrate内では既存の方式に合わせる。 |
| `<crate>/src/<module>.rs`内の`#[cfg(test)] mod tests` | [ripgrepの`flags/config.rs`](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/core/flags/config.rs#L110-L173) | 非公開の実装を含む単体テストを対象モジュールと同じファイルへ配置する。 |
| `<crate>/tests/` | [axumの`axum/tests/`](https://github.com/tokio-rs/axum/tree/main/axum/tests) | crateの公開APIを通して検証する結合テストを配置する。テストを読み込むためだけの固定エントリーポイントは設けない。 |
| `<crate>/examples/`、`<crate>/benches/` | [axumの`examples/`](https://github.com/tokio-rs/axum/tree/main/examples)、[Hyperの`benches/`](https://github.com/hyperium/hyper/tree/master/benches) | 実行可能な使用例とベンチマークを、それぞれ必要な場合だけ配置する。 |

---

## 3. ディスパッチ

### ジェネリクスとtrait objectを使い分ける

- 実行時に実装を選ぶ場合、異なる実装を同じ型として一つのコレクションへ入れる場合、または具体型を利用側の定義へ波及させたくない場合は、trait objectで受け取る。
- いずれにも当てはまらない場合は、ジェネリクスで受け取る。

次は、共有状態が実装型を型パラメーターとして保持する例である。状態を受け取るハンドラーとルートの登録まで同じ型パラメーターが必要になるため、この波及を避ける場合は`Arc<dyn UserRepo>`で受け取る。

```rust
#[derive(Clone)]
struct AppState<T> {
    user_repo: T,
}

async fn handle_get_user<T>(
    State(state): State<AppState<T>>,
    Path(id): Path<Uuid>,
) -> Result<Json<User>, StatusCode>
where
    T: UserRepo,
{
    // ...
}

let using_generic = Router::new()
    .route("/users/{id}", get(handle_get_user::<InMemoryUserRepo>))
    .with_state(AppState { user_repo });
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
| 3. ディスパッチ | [axum `examples/dependency-injection`](https://github.com/tokio-rs/axum/blob/3d78036dcac289d6c1d54934708acb6a5bd73686/examples/dependency-injection/src/main.rs#L23-L149) | ジェネリクスで実装型を保持する構成と、trait objectで実装型を隠す構成を示す。 |
| 4. 検証 | [Clippy Documentation](https://doc.rust-lang.org/clippy/) | Clippyの実行方法とlintの設定を確認する。 |
