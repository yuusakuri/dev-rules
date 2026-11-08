# Git規則

## 1 はじめに

### 1.1 目的

本書は、Gitを使用した開発の効率化及び変更履歴の可読性の向上を目的とする。

### 1.2 適用範囲

本書は、Gitを使った開発フローについて規定する。

## 2 開発フロー

### 2.1 マージ前の検証

PR マージ前にフォーマットチェック、静的解析 / lint、全テスト実行、依存関係の脆弱性スキャンをすべて通過することを必須とする。lint の警告はエラー扱いにする。

### 2.2 ブランチ戦略：GitHub Flow

本プロジェクトは [GitHub フロー](https://docs.github.com/ja/get-started/using-github/github-flow) を採用する。`main` は常にデプロイ可能な状態を保つ。直接プッシュは禁止。PRは、利用者がmergeを明示的に指示していない場合、最低1名のレビュー承認を得てからmergeする。利用者が対象PRのmergeを明示的に指示した場合は、レビュー承認なしでmergeしてよい。

作業ブランチは、最新の`main`から作成する。例えば、注文処理には`feature/order-placement`、不具合修正には`fix/order-validation-bug`、構成の整理には`refactor/use-case-extraction`を使用する。

### 2.3 作業の手順

1. 開発は最新の適切なベースブランチを基点とした作業ブランチで行う。
2. 作業ブランチで変更をコミットする。
3. 作業ブランチをリモートリポジトリへpushする。
4. Pull Requestを作成する。

既存のプルリクエストを修正する場合は、明確な指示がある場合を除き、新たなプルリクエストを作成してはならない。

### 2.4 ブランチ名：Conventional Branch

ブランチ名は [Conventional Branch](https://conventional-branch.github.io/) に従う。ただし、AI Agent Source Prefixes は使用しない。

### 2.5 コミットメッセージ：Conventional Commits

タイトルは1行50文字以内とし、[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) の形式に従う。

```
feat(order): add place order use case
fix(auth): correct token expiration check
refactor(order): extract validated value types
test(order): add repository integration tests
docs(readme): update setup instructions
chore(deps): upgrade dependency version
```

本文を書く場合は、タイトルから1行空けて`-`始まりの箇条書きで変更点の詳細を列挙する。英語は平易な語彙で書く。

### 2.6 PRのタイトルと説明

PRへ変更を追加したときは、タイトルと説明も変更後の内容へ書き直す。

### 2.7 コミットのamend

未マージの既存コミットのタイトルで説明できる変更は、そのコミットへamendする。関係のない変更は、新規コミットとして作成する。

### 2.8 マージ方式

マージ方式は、[表1](#table-1)による。

<a id="table-1"></a>表1−マージ方式

| マージ方式 | 用途 |
| --- | --- |
| Merge commit | 完全な履歴を残す。個々のコミットがそれ単体で意味を持つ。 |
| Squash and merge | PRが一つの論理的な変更を表す。細かい修正コミットが多い。 |
| Rebase and merge | 線形な履歴を保つ。コミットが既に整理されている。 |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2章 | [GitHub フロー - GitHubドキュメント](https://docs.github.com/ja/get-started/using-github/github-flow) | ブランチの作成からPRのマージまでの開発の流れを示す。 |
| 2章 | [Conventional Branch — A Git Branch Naming Convention](https://conventional-branch.github.io/) | ブランチ名の規則を定義する。 |
| 2章 | [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) | コミットメッセージの形式を定義する。 |
| 2章 | [プル要求のマージ - GitHubドキュメント](https://docs.github.com/ja/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges) | プルリクエストのマージ方法の違いを示す。 |
