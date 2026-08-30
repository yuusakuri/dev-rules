# TypeScript固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [型](#3-型)
4. [検証](#4-検証)
5. [参考資料](#5-参考資料)

---

## 1. 概要

本書は、TypeScript固有の追加規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)、[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)を前提とする。

---

## 2. フォルダ構成

ソースルートは`src/`とし、「アプリケーション設計規則」のフォルダ構成をその下へ置く。TypeScript固有の配置を次に示す。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/features/<feature>/index.ts` | `apps/myproject-web/src/features/auth/index.ts` | Featureの公開境界。Feature外へ公開する型、関数、Component、Handler、契約、各実装の生成関数だけをexportする。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | `apps/myproject-web/src/features/auth/presentation/screens/sign_in_screen.tsx` | ルーティングの遷移先となるScreen Componentを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/components/` | `apps/myproject-web/src/features/auth/presentation/components/password_field.tsx` | Featureが所有する表示で再利用するComponentを配置する。別Featureでも再利用するComponentは、`index.ts`から明示的にexportする。 |
| `apps/<app-name>/src/features/<feature>/presentation/state/` | `apps/myproject-web/src/features/auth/presentation/state/sign_in_store.ts` | Signal、Store、Contextと表示状態の操作を配置する。 |
| `<file>.test.ts`、`<component>.test.tsx` | `apps/myproject-web/src/features/auth/sign_in_validator.test.ts` | 単体テストとComponentテストを、実装ファイルと同じフォルダへ配置する。 |
| `apps/<app-name>/tests/integration/<feature>.test.ts` | `apps/myproject-web/tests/integration/auth.test.ts` | Feature間またはFeatureと外部I/Oとの結合を検証するテストを配置する。 |
| `apps/<app-name>/tests/e2e/<flow>.test.ts` | `apps/myproject-web/tests/e2e/sign_in.test.ts` | E2Eテスト。 |

---

## 3. 型

公開する関数、コンポーネント、コールバックの引数と戻り値の型を明示する。

---

## 4. 検証

ESLintは`eslint . --max-warnings 0`で実行し、警告を残さない。

モノレポでは、ルートの`package.json`に`verify`スクリプトを定義し、表の検証を対象となるすべてのworkspaceで実行する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | TypeScript、JavaScript、JSONなど、自動フォーマットの対象としたファイル。 | `prettier . --check` |
| コンパイラーが検出する型エラーを防ぐ。 | TypeScriptのソースコード、テストコード、型定義。 | `tsc --noEmit` |
| 制御構造を単純に保ち、変更時の不具合を防ぐ。 | コードブロックが3段を超えてネストしている箇所。 | ESLintの`max-depth`ルールで3段までを許可し、違反を`error`にする。 |
| 型安全性とロジックの可読性を維持する。 | 危険な型操作、未処理Promise、複雑な条件式、追跡しにくいロジック。 | typescript-eslint strict-type-checked、SonarJS |
| モジュール間の循環依存を防ぐ。 | TypeScriptとJavaScriptのimport。 | eslint-plugin-importの`import/no-cycle`ルールを`error`として設定する。 |
| 不要なコードと依存関係の残存を防ぐ。 | 未使用export、未使用ファイル、未使用依存パッケージ、孤立したエントリーポイント。 | Knip |
| 変更による振る舞いの破壊と未検証箇所を検出する。 | 単体テスト、結合テストと、行、分岐、関数、文のカバレッジ。 | `vitest run --coverage` |
| 利用者の主要な操作と、停止時の影響が大きい処理経路の破壊を検出する。 | `tests/e2e/`に配置したE2Eテスト。 | `package.json`の`test:e2e`スクリプト |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべてのJavaScript向けロックファイル。 | `osv-scanner scan source -r .` |

---

## 5. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 1. 概要、4. 検証 | [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) | TypeScriptの記述方法とコードレビューの基準を確認する。 |
| 4. 検証 | [strict](https://www.typescriptlang.org/tsconfig/strict.html) | `strict`が有効にする型検査を確認する。 |
| 4. 検証 | [Linting with Type Information](https://typescript-eslint.io/getting-started/typed-linting/) | 型情報を使用するlintの設定方法を確認する。 |
| 4. 検証 | [max-depth](https://eslint.org/docs/latest/rules/max-depth) | ESLintが数えるブロックのネスト深度を確認する。 |
