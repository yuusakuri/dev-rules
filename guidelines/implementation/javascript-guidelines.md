# JavaScript実装ガイドライン

## 1 はじめに

### 1.1 目的

本書は、JavaScriptを使用した開発の作業効率の向上及び品質の安定化を目的とする。

### 1.2 適用範囲

本書は、Node.js及びブラウザーで実行するJavaScriptの実装について規定する。本書は、[ソフトウェア設計ガイドライン](../software/software-design-guidelines.md)、[アプリケーション設計ガイドライン](../software/application-design-guidelines.md)、[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)を前提とする。

## 2 言語及びパッケージマネージャー

### 2.1 言語

実装は、TypeScriptで記述する。型エラーを実行前に検出するためである。

### 2.2 パッケージマネージャー

依存関係は、pnpmで管理する。パッケージマネージャーを統一し、ロックファイルを`pnpm-lock.yaml`の一つに保つためである。npm及びYarnは、依存関係の操作に使用しない。

pnpmのバージョンは、`package.json`の`devEngines.packageManager`で指定し、pnpm 11以降を使用する。pnpmは、実行中のバージョンが指定と異なる場合に、指定のバージョンをダウンロードして実行する。npmは、`name`が`npm`以外の場合に、`npm install`などをエラーで終了する。

次の例は、pnpm 11の範囲を指定する（出典：[package.json \| pnpm](https://pnpm.io/ja/package_json)）。

```json
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": ">=11.0.0 <12.0.0",
      "onFail": "download"
    }
  }
}
```

`pnpm-lock.yaml`は、リポジトリにコミットする。

モノレポでは、ルートに`pnpm-workspace.yaml`を置き、workspace間の依存関係を`workspace:`プロトコルで指定する。

パッケージの操作には、[表1](#table-1)のコマンドを使用する。

<a id="table-1"></a>表1−パッケージの操作に使用するコマンド

| 操作 | コマンド |
| --- | --- |
| 依存関係をインストールする。 | `pnpm install` |
| CIで依存関係をインストールする。 | `pnpm install --frozen-lockfile` |
| 依存関係を追加する。 | `pnpm add <package>` |
| 開発用の依存関係を追加する。 | `pnpm add -D <package>` |
| 依存関係を削除する。 | `pnpm remove <package>` |
| `package.json`のスクリプトを実行する。 | `pnpm run <script>` |
| 依存関係に追加せずにパッケージを実行する。 | `pnpm dlx <package>` |

## 3 フォルダ構成

フォルダ構成は、[表2](#table-2)による。

<a id="table-2"></a>表2−フォルダ構成

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/src/<feature>/index.ts` | [Blueskyの`src/state/session/index.tsx`](https://github.com/bluesky-social/social-app/blob/main/src/state/session/index.tsx) | Featureの公開境界。Feature外へ公開する型、関数、Component、Handler、契約、各実装の生成関数だけをexportする。 |
| `apps/<app-name>/src/<feature>/presentation/screens/` | [Blueskyの`src/screens/Login`](https://github.com/bluesky-social/social-app/tree/main/src/screens/Login) | ルーティングの遷移先となるScreen Componentを配置する。 |
| `apps/<app-name>/src/<feature>/presentation/components/` | [Blueskyの`src/screens/Login/components`](https://github.com/bluesky-social/social-app/tree/main/src/screens/Login/components) | Featureが所有する表示で再利用するComponentを配置する。別Featureでも再利用するComponentは、`index.ts`から明示的にexportする。 |
| `apps/<app-name>/src/<feature>/presentation/state/` | [Blueskyの`src/state/session`](https://github.com/bluesky-social/social-app/tree/main/src/state/session) | Signal、Store、Contextと表示状態の操作を配置する。 |
| `<file>.test.ts`、`<component>.test.tsx` | [Blueskyの`bskylink/src/index.test.ts`](https://github.com/bluesky-social/social-app/blob/main/bskylink/src/index.test.ts) | 単体テストとComponentテストを、実装ファイルと同じフォルダへ配置する。 |
| `apps/<app-name>/tests/integration/<feature>.test.ts` | [VS Codeの`test/integration/browser/src`](https://github.com/microsoft/vscode/tree/main/test/integration/browser/src) | Feature間又はFeatureと外部I/Oとの結合を検証するテストを配置する。 |
| `apps/<app-name>/tests/e2e/<flow>.test.ts` | [Cal.comの`login.e2e.ts`](https://github.com/calcom/cal.com/blob/main/apps/web/playwright/login.e2e.ts) | E2Eテスト。 |

## 4 型

公開する関数、コンポーネント、コールバックの引数と戻り値の型を明示する。

## 5 検証

ESLintは`eslint . --max-warnings 0`で実行し、警告を残さない。

モノレポでは、ルートの`package.json`に`verify`スクリプトを定義し、表の検証を対象となるすべてのworkspaceで実行する。

検証は、[表3](#table-3)による。

<a id="table-3"></a>表3−検証

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

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 1章<br>5章 | [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) | TypeScriptのスタイルガイドを示す。 |
| 5章 | [strict](https://www.typescriptlang.org/tsconfig/strict.html) | `strict`が有効にする型検査を示す。 |
| 5章 | [Linting with Type Information](https://typescript-eslint.io/getting-started/typed-linting/) | 型情報を使用するlintの設定方法を示す。 |
| 5章 | [max-depth](https://eslint.org/docs/latest/rules/max-depth) | ESLintが数えるブロックのネスト深度を示す。 |
| 2章 | [package.json \| pnpm](https://pnpm.io/ja/package_json) | `devEngines.packageManager`の形式及び動作を定義する。 |
| 2章 | [CLI & Node.js Settings \| pnpm](https://pnpm.io/ja/settings/cli) | 指定と異なるバージョンのpnpmを実行した場合の動作を定義する。 |
| 2章 | [package.json \| npm Docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json) | npmが`devEngines`を確認するコマンド及び動作を定義する。 |
| 2章 | [Git との連携 \| pnpm](https://pnpm.io/ja/git) | `pnpm-lock.yaml`のコミットを推奨する。 |
| 2章 | [pnpm install \| pnpm](https://pnpm.io/ja/cli/install) | `pnpm install`及び`--frozen-lockfile`を定義する。 |
| 2章 | [pnpm add <pkg> \| pnpm](https://pnpm.io/ja/cli/add) | `pnpm add`を定義する。 |
| 2章 | [pnpm remove \| pnpm](https://pnpm.io/ja/cli/remove) | `pnpm remove`を定義する。 |
| 2章 | [pnpm run \| pnpm](https://pnpm.io/ja/cli/run) | `pnpm run`を定義する。 |
| 2章 | [pnx \| pnpm](https://pnpm.io/cli/dlx) | `pnpm dlx`を定義する。 |
| 2章 | [ワークスペース \| pnpm](https://pnpm.io/ja/workspaces) | `pnpm-workspace.yaml`及び`workspace:`プロトコルを定義する。 |
