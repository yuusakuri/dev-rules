# Rust固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [検証](#3-検証)
4. [参考資料](#4-参考資料)

---

## 1. 概要

本書は、Rust固有の規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)を前提とする。

記述方法は、「参考資料」のThe Rust Style GuideとRust API Guidelinesに従う。

---

## 2. フォルダ構成

ソースルートは`src/`とする。フォルダを持つモジュールは、同じ階層の`<name>.rs`で宣言し、内部モジュールを`<name>/`へ置く。`mod.rs`は使用しない。

「アプリケーション設計規則」のフォルダ構成は、この方法でモジュールとして表す。Rust固有の配置を次に示す。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/app/state.rs` | `apps/myproject-api/src/app/state.rs` | Webフレームワークへ登録する共有状態を一つの型へまとめる場合だけ使用する。 |
| `apps/<app-name>/src/features/<feature>.rs` | `apps/myproject-cli/src/features/auth.rs` | Featureの公開境界。Feature外へ公開する型と処理を`pub use`で再公開する。 |
| `apps/<app-name>/src/features/<feature>.rs`内の`#[cfg(test)] mod tests` | `apps/myproject-cli/src/features/auth.rs`内の`#[cfg(test)] mod tests` | Featureの単体テスト。 |
| `apps/<app-name>/tests/integration.rs` | `apps/myproject-cli/tests/integration.rs` | `apps/<app-name>/tests/integration/<feature>.rs`を読み込む結合テストのエントリーポイント。 |
| `apps/<app-name>/tests/integration/<feature>.rs` | `apps/myproject-cli/tests/integration/auth.rs` | 機能単位の結合テスト。 |
| `apps/<app-name>/tests/e2e.rs` | `apps/myproject-cli/tests/e2e.rs` | `apps/<app-name>/tests/e2e/<flow>.rs`を読み込むE2Eテストのエントリーポイント。 |
| `apps/<app-name>/tests/e2e/<flow>.rs` | `apps/myproject-cli/tests/e2e/sign_in.rs` | フロー単位のE2Eテスト。 |
| `apps/<app-name>/benches/` | `apps/myproject-cli/benches/parse_benchmark.rs` | ベンチマークが必要な場合だけ使用する。 |
| `apps/<app-name>/locales/` | `apps/myproject-cli/locales/ja.ftl` | 翻訳リソースを、ソースルートの外へ言語ごとに配置する。 |

---

## 3. 検証

テストは「フォルダ構成」に従って配置する。実行コマンドは、各プロジェクトで定義する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | 全crateのRustソースコード。 | `cargo fmt --all -- --check` |
| コンパイル可能でも不具合や保守性低下につながる記述を検出し、警告を残さない。 | 全workspace、全target、全featureのソースコードとテストコード。 | `cargo clippy --workspace --all-targets --all-features -- -D warnings` |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべての`Cargo.lock`。 | `osv-scanner scan source -r .` |

---

## 4. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 1. 概要 | [The Rust Style Guide](https://doc.rust-lang.org/style-guide/) | Rustコードの書式と記述方法を確認する。 |
| 1. 概要 | [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html) | 公開APIの命名、型、ドキュメントの基準を確認する。 |
| 2. フォルダ構成 | [Cargo Guide: Package Layout](https://doc.rust-lang.org/cargo/guide/project-layout.html) | Cargoパッケージの標準的なファイルとフォルダの配置を確認する。 |
| 3. 検証 | [Clippy Documentation](https://doc.rust-lang.org/clippy/) | Clippyの実行方法とlintの設定を確認する。 |
