# TypeScript固有規約

## 1. 概要

本書は、TypeScriptのソースコード、テスト、フォルダ構成を変更する場合に適用する言語固有の追加規則を定義する。本書は、[共通設計原則](../core/architecture.md)、[アプリケーション設計規則](../core/application-architecture.md)、[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)を前提とする。

---

## 2. フォルダ構成

表のパスはリポジトリルートを基準とする。

| パス | 例 | 説明 |
| ---- | ---- | ---- |
| `apps/<app-name>/src/` | `apps/myproject-web/src/` | TypeScriptアプリケーションのソースルート。 |
| `apps/<app-name>/src/app/` | `apps/myproject-web/src/app/` | 起動、ルーティング、ライフサイクル、依存関係の生成と接続（Composition Root）を配置する。 |
| `apps/<app-name>/src/core/` | `apps/myproject-web/src/core/userId.ts` | 複数のFeatureにまたがって同じ意味を持つドメイン型とエラー型（Shared Kernel）を配置する。特定のFeatureに閉じた型を、汎用ユーティリティ置き場として先回りして置かない。 |
| `apps/<app-name>/src/infra/` | `apps/myproject-web/src/infra/httpClient.ts` | 業務ロジックを持たない技術基盤（DBコネクション、ロガーなど）の構築処理を配置する。 |
| `apps/<app-name>/src/features/<feature>/` | `apps/myproject-web/src/features/auth/` | Featureが所有する型、処理、境界、外部接続を配置する。 |
| `apps/<app-name>/src/features/<feature>/index.ts` | `apps/myproject-web/src/features/auth/index.ts` | Feature外へ公開する型、関数、Componentだけをexportする。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/` | `apps/myproject-web/src/features/auth/presentation/screens/SignInScreen.tsx` | ルーティングの遷移先となるScreen Componentを配置する。UIを持つアプリケーションで使用する。 |
| `apps/<app-name>/src/features/<feature>/presentation/components/` | `apps/myproject-web/src/features/auth/presentation/components/PasswordField.tsx` | 同じFeatureの表示で再利用するComponentを配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/state/` | `apps/myproject-web/src/features/auth/presentation/state/signInStore.ts` | Signal、Store、Contextと表示状態の操作を配置する。 |
| `apps/<app-name>/src/features/<feature>/handlers/` | `apps/myproject-web/src/features/auth/handlers/signInHandler.ts` | UIを介さず外部からの要求を受け取る境界（HTTPルートハンドラー、RPC、メッセージキューの購読など）を配置する。UIを持たないバックエンドで使用する。 |
| `apps/<app-name>/src/features/<feature>/repositories/` | `apps/myproject-web/src/features/auth/repositories/httpAuthRepository.ts` | Featureが所有するデータを永続化ストレージへ保存、取得する契約、接続先別の実装、外部データ形式との変換を配置する。 |
| `apps/<app-name>/src/features/<feature>/gateways/` | `apps/myproject-web/src/features/payment/gateways/stripePaymentGateway.ts` | 永続化以外の外部システム、外部サービスと通信する契約、接続先別の実装を配置する。 |
| `apps/<app-name>/src/ui/` | `apps/myproject-web/src/ui/PrimaryButton.tsx` | 複数のFeatureで使用する、業務上の判断を持たないComponentとデザイン定義を配置する。UIを持つアプリケーションで使用する。 |
| `apps/<app-name>/src/localization/` | `apps/myproject-web/src/localization/ja.json` | 表示言語、翻訳リソース、地域別の書式化を配置する。 |
| `apps/<app-name>/src/features/<feature>/<path>/<file>.test.ts` | `apps/myproject-web/src/features/auth/signInValidator.test.ts` | ロジックの単体テストを実装ファイルと同じフォルダへ配置する。 |
| `apps/<app-name>/src/features/<feature>/presentation/screens/<screen>.test.tsx` | `apps/myproject-web/src/features/auth/presentation/screens/SignInScreen.test.tsx` | Screen Componentの表示と操作を実装ファイルと同じフォルダで検証する。 |
| `apps/<app-name>/src/features/<feature>/presentation/components/<component>.test.tsx` | `apps/myproject-web/src/features/auth/presentation/components/PasswordField.test.tsx` | Componentテストを実装ファイルと同じフォルダへ配置する。 |
| `apps/<app-name>/tests/integration/<feature>.test.ts` | `apps/myproject-web/tests/integration/auth.test.ts` | Feature間またはFeatureと外部I/Oとの結合を検証するテストを配置する。 |
| `apps/<app-name>/tests/e2e/<flow>.test.ts` | `apps/myproject-web/tests/e2e/sign-in.test.ts` | E2Eテスト。 |
| `packages/<name>/` | `packages/design-tokens/` | 複数の実行単位から共有するTypeScriptパッケージ。 |

---

## 3. 型

- TypeScriptの`strict`と、型情報を使用するlintを有効にする。
- 公開する関数、コンポーネント、コールバックの引数と戻り値の型を明示する。

---

## 4. 検証

| 目的 | 検証対象 | ツール |
|---|---|---|
| 制御構造を単純に保ち、変更時の不具合を防ぐ。 | 関数の長さ、ネストの深さ、循環的複雑度、引数の数、処理文の数。 | ESLintコアルール |
| 型安全性とロジックの可読性を維持する。 | 危険な型操作、未処理Promise、複雑な条件式、追跡しにくいロジック。 | typescript-eslint strict-type-checked、SonarJS |
| 不要なコードと依存関係の残存を防ぐ。 | 未使用export、未使用ファイル、未使用依存パッケージ、孤立したエントリーポイント。 | Knip |
| 変更による振る舞いの破壊と未検証箇所を検出する。 | 単体テストと、行、分岐、関数、文のカバレッジ。 | Vitest、Vitest Coverage |
