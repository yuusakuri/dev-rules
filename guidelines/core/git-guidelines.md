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
    - [コミットメッセージ：Conventional Commits](#コミットメッセージconventional-commits)

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

### コミットメッセージ：Conventional Commits

```
feat(order): add place order use case
fix(auth): correct token expiration check
refactor(order): extract validated value types
test(order): add repository integration tests
docs(readme): update setup instructions
chore(deps): upgrade dependency version
```
