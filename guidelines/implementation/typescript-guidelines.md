# TypeScript固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [型](#3-型)
4. [検証](#4-検証)

---

## 1. 概要

本書は、TypeScript固有の追加規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)、[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)を前提とする。

---

## 2. フォルダ構成

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/` | `apps/myproject-web/src/` | TypeScriptアプリケーションのソースルート。 |
| `apps/<app-name>/src/app/` | `apps/myproject-web/src/app/` | 起動、ルーティング、実行経路との接続を配置する。 |
| `apps/<app-name>/src/app/bootstrap/` | `apps/myproject-web/src/app/bootstrap/auth.ts` | 依存関係を生成して接続するComposition Rootを配置する。フレームワークにより`app/`に制限や規則がある場合は、`apps/<app-name>/src/bootstrap/`へ配置する。 |
| `apps/<app-name>/src/infra/` | `apps/myproject-web/src/infra/sentry/client.ts` | 業務ロジックを持たない技術基盤（DB接続プール、ロガー、Crash Reportingなど）の構築処理を配置し、Composition Rootから呼び出す。 |
| `apps/<app-name>/src/features/<feature>/` | `apps/myproject-web/src/features/auth/` | Featureが所有する型、処理、境界、外部接続を配置する。 |
| `apps/<app-name>/src/features/<feature>/index.ts` | `apps/myproject-web/src/features/auth/index.ts` | Feature外へ公開する型、関数、Component、Handler、RepositoryとGatewayの契約、各実装の生成関数だけをexportする。別Featureは、このファイルが公開する業務型、処理とその呼び出し契約、再利用用のComponentだけを参照する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | `apps/myproject-web/src/features/auth/presentation/screens/sign_in_screen.tsx` | ルーティングの遷移先となるScreen Componentを配置する。UIを持つアプリケーションで使用する。 |
| `apps/<app-name>/src/features/<feature>/presentation/components/` | `apps/myproject-web/src/features/auth/presentation/components/password_field.tsx` | Featureが所有する表示で再利用するComponentを配置する。別Featureでも再利用するComponentは、`index.ts`から明示的にexportする。 |
| `apps/<app-name>/src/features/<feature>/presentation/state/` | `apps/myproject-web/src/features/auth/presentation/state/sign_in_store.ts` | Signal、Store、Contextと表示状態の操作を配置する。 |
| `apps/<app-name>/src/features/<feature>/handlers/` | `apps/myproject-web/src/features/auth/handlers/sign_in_handler.ts` | UIを介さず外部からの要求を受け取る境界（HTTPルートハンドラー、RPC、メッセージキューの購読など）を配置する。業務ロジックは持たせず、Feature内の処理へ委譲する。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | `apps/myproject-web/src/features/checkout/repositories/indexed_db_cart_repository.ts` | Featureが所有するデータを永続化ストレージへ保存、取得する契約、接続先別の実装、保存形式との変換を配置する。 |
| `apps/<app-name>/src/features/<feature>/gateways/` | `apps/myproject-web/src/features/payment/gateways/stripe_payment_gateway.ts` | 永続化以外の外部システム、外部サービスと通信する契約、接続先別の実装、外部データ形式との変換を配置する。 |
| `apps/<app-name>/src/ui/` | `apps/myproject-web/src/ui/primary_button.tsx` | 複数のFeatureで使用する、業務上の判断を持たないComponentとデザイン定義を配置する。UIを持つアプリケーションで使用する。 |
| `apps/<app-name>/src/localization/` | `apps/myproject-web/src/localization/ja.json` | 表示言語の選択と翻訳データを配置する。 |
| `apps/<app-name>/src/locale_format/` | `apps/myproject-web/src/locale_format/number_format.ts` | `Intl`による数値、日付、通貨などの書式処理を配置する。翻訳データとは分けて配置する。 |
| `apps/<app-name>/src/features/<feature>/<path>/<file>.test.ts` | `apps/myproject-web/src/features/auth/sign_in_validator.test.ts` | ロジックの単体テストを実装ファイルと同じフォルダへ配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/<screen>.test.tsx` | `apps/myproject-web/src/features/auth/presentation/screens/sign_in_screen.test.tsx` | Screen Componentの表示と操作を実装ファイルと同じフォルダで検証する。 |
| `apps/<app-name>/src/features/<feature>/presentation/components/<component>.test.tsx` | `apps/myproject-web/src/features/auth/presentation/components/password_field.test.tsx` | Componentテストを実装ファイルと同じフォルダへ配置する。 |
| `apps/<app-name>/tests/integration/<feature>.test.ts` | `apps/myproject-web/tests/integration/auth.test.ts` | Feature間またはFeatureと外部I/Oとの結合を検証するテストを配置する。 |
| `apps/<app-name>/tests/e2e/<flow>.test.ts` | `apps/myproject-web/tests/e2e/sign_in.test.ts` | E2Eテスト。 |
| `packages/<name>/` | `packages/design-tokens/` | 複数の実行単位から共有するTypeScriptパッケージ。 |

---

## 3. 型

- TypeScriptの`strict`と、型情報を使用するlintを有効にする。
- 公開する関数、コンポーネント、コールバックの引数と戻り値の型を明示する。

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
