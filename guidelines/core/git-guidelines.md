# Git規則

## 1. 概要

本書は、Gitを使った開発フローの規則を定義する。

---

## 目次

- [Git規則](#git規則)
  - [目次](#目次)
  - [1. 概要](#1-概要)
  - [2. 開発フロー](#2-開発フロー)
    - [ブランチ戦略：GitHub Flow](#ブランチ戦略github-flow)
    - [ブランチ名：Conventional Branch](#ブランチ名conventional-branch)
    - [コミットメッセージ：Conventional Commits](#コミットメッセージconventional-commits)
    - [コミットのamend](#コミットのamend)

---

## 2. 開発フロー

PR マージ前にフォーマットチェック、静的解析 / lint、全テスト実行、依存関係の脆弱性スキャンをすべて通過することを必須とする。lint の警告はエラー扱いにする。

### ブランチ戦略：GitHub Flow

`main` は常にデプロイ可能な状態を保つ。直接プッシュは禁止。PR は最低1名のレビュー承認が必須。Squash merge で履歴を線形に保つ。

```
main
  └── feature/order-placement
  └── fix/order-validation-bug
  └── refactor/use-case-extraction
```

### ブランチ名：Conventional Branch

ブランチ名は Conventional Branch に従う。ただし、AI Agent Source Prefixes は使用しない。

### コミットメッセージ：Conventional Commits

タイトルは1行50文字以内とし、Conventional Commits の形式に従う。

```
feat(order): add place order use case
fix(auth): correct token expiration check
refactor(order): extract validated value types
test(order): add repository integration tests
docs(readme): update setup instructions
chore(deps): upgrade dependency version
```

本文を書く場合は、タイトルから1行空けて`-`始まりの箇条書きで変更点の詳細を列挙する。英語は英検3級程度の平易な語彙で書く。

### コミットのamend

未マージの既存コミットのタイトルで説明できる変更は、そのコミットへamendする。関係のない変更は、新規コミットとして作成する。
