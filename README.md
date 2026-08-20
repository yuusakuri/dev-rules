# 開発規則

ソフトウェア開発で使用する、プロジェクトに依存しない設計規則、技術固有規則、UI規則、仕様書作成規則を管理する。

## AIエージェントから使う

AIエージェントは最初に [`AGENTS.md`](AGENTS.md) を読み、[`guidelines/README.md`](guidelines/README.md) の適用表から作業に必要な文書だけを選ぶ。複数の条件に該当する場合は、該当する文書をすべて併用する。

このリポジトリをsubmoduleとして利用する場合、利用側リポジトリのルートにある `AGENTS.md` から明示的に入口を参照する。

```md
## 共通開発規則

実装、設計、レビューの前に `<path-to-dev-rules>/AGENTS.md` を読み、
同ファイルが案内する該当規則に従うこと。
```

## 構成

```text
.
├── AGENTS.md                 # AIエージェント向けの入口
├── README.md                 # 人向けの概要と導入方法
└── guidelines/
    ├── README.md             # 適用条件、読み順、優先順位
    ├── core/                 # 共通の設計規則
    ├── implementation/       # 技術固有の実装規則
    ├── design/               # UIデザイン規則
    └── specifications/       # 仕様書作成規則
```

文書の一覧と適用条件は [`guidelines/README.md`](guidelines/README.md) を正とする。

## 利用方法

利用するプロジェクトは、このリポジトリをsubmoduleとして固定する。プロジェクト固有の要件、採用技術、設計判断は、利用するプロジェクトのリポジトリで管理する。

```bash
git submodule add https://github.com/yuusakuri/dev-rules.git <path>
```

## 更新方法

利用するプロジェクトごとに、採用するバージョンのタグを指定する。

```bash
git -C <path> fetch --tags
git -C <path> checkout <release-tag>
git add <path>
```

## バージョン

バージョンはSemantic Versioningで管理する。既存規則の意味または必須条件を変える場合はメジャーバージョンを上げ、後方互換性のある規則を加える場合はマイナーバージョンを上げ、誤記や曖昧さを訂正する場合はパッチバージョンを上げる。
