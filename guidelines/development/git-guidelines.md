# Git規則

## 目次

1. [概要](#1-概要)
2. [開発フロー](#2-開発フロー)
3. [参考資料](#3-参考資料)

---

## 1. 概要

本書は、Gitを使った開発フローの規則を定義する。

---

## 2. 開発フロー

PR マージ前にフォーマットチェック、静的解析 / lint、全テスト実行、依存関係の脆弱性スキャンをすべて通過することを必須とする。lint の警告はエラー扱いにする。

### ブランチ戦略：GitHub Flow

本プロジェクトは [GitHub フロー](https://docs.github.com/ja/get-started/using-github/github-flow) を採用する。`main` は常にデプロイ可能な状態を保つ。直接プッシュは禁止。PR は最低1名のレビュー承認が必須。

```
main
  └── feature/order-placement
  └── fix/order-validation-bug
  └── refactor/use-case-extraction
```

### ブランチ名：Conventional Branch

ブランチ名は [Conventional Branch](https://conventional-branch.github.io/) に従う。ただし、AI Agent Source Prefixes は使用しない。

### コミットメッセージ：Conventional Commits

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

### PRのタイトルと説明

PRへ変更を追加したときは、タイトルと説明も変更後の内容へ書き直す。

### コミットのamend

未マージの既存コミットのタイトルで説明できる変更は、そのコミットへamendする。関係のない変更は、新規コミットとして作成する。

### マージ方式

マージ方式は、以下の表のように用途別で選ぶ。

| マージ方式 | 用途 |
| --- | --- |
| Merge commit | 完全な履歴を残す。個々のコミットがそれ単体で意味を持つ。 |
| Squash and merge | PRが1つの論理的な変更を表す。細かい修正コミットが多い。 |
| Rebase and merge | 線形な履歴を保つ。コミットが既に整理されている。 |

本プロジェクトはSquash and mergeを使用し、1つのPRを1つの論理的な変更として`main`へ記録する。

---

## 3. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 2. 開発フロー | [GitHub フロー - GitHubドキュメント](https://docs.github.com/ja/get-started/using-github/github-flow) | ブランチの作成からPRのマージまでの開発の流れを示す。 |
| 2. 開発フロー | [Conventional Branch — A Git Branch Naming Convention](https://conventional-branch.github.io/) | ブランチ名の接頭辞と構成を定義する。 |
| 2. 開発フロー | [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) | コミットメッセージの型、スコープ、本文の形式を定義する。 |
| 2. 開発フロー | [プル要求のマージ - GitHubドキュメント](https://docs.github.com/ja/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges) | Merge commit、Squash and merge、Rebase and mergeが残す履歴と、それぞれを選ぶ場合を示す。 |
