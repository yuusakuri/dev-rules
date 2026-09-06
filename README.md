# 開発規則

ソフトウェア開発で使用する、プロジェクトに依存しない設計規則、技術固有規則、UI規則、仕様書作成規則を管理する。

## 利用方法

プロジェクトに組み込む場合はGit submoduleを使う。エージェントから直接参照する場合は、ネット上のURLまたはローカルの保存先を指定する。いずれの場合も、エージェントは `AGENTS.md` から読み始め、作業に必要な規則をたどる。

### Gitリポジトリに組み込む

導入先のリポジトリのルートから、次のコマンドを実行する。

```bash
git submodule add https://github.com/yuusakuri/dev-rules.git dev-rules
```

導入先の `AGENTS.md` に次の内容を記載する。配置先を変える場合は、コマンドと参照先の `dev-rules` を同じパスに置き換える。

```md
## 開発規則

実装、設計、レビューの前に `dev-rules/AGENTS.md` を読み、同ファイルが案内する該当規則に従うこと。
```

導入先の `AGENTS.md`、`.gitmodules`、`dev-rules` をコミットに含めることで、他の利用者も同じ規則とバージョンを参照できる。

### ネット経由で参照する

URLの内容を取得できるエージェントに、次の指示を渡す。

```text
実装、設計、レビューの前に、次の文書を読み、同文書が案内する該当規則に従うこと。
https://raw.githubusercontent.com/yuusakuri/dev-rules/main/AGENTS.md
```

### ローカルに置いて参照する

任意の場所で、次のコマンドを実行する。

```bash
git clone https://github.com/yuusakuri/dev-rules.git
```

ローカルのファイルを読めるエージェントに、次の指示を渡す。

```text
実装、設計、レビューの前に `dev-rules/AGENTS.md` を読み、同ファイルが案内する該当規則に従うこと。
```

## 更新方法

Git submoduleで組み込んだ場合は、導入先のリポジトリのルートから次のコマンドを使う。バージョンを選ぶ場合はタグを取得して一覧を確認し、`<release-tag>` を採用するタグ名に置き換える。

| コマンド | 内容 |
| --- | --- |
| `git submodule update --init -- dev-rules` | 導入済みのリポジトリをcloneした後、記録されているバージョンを取得する。 |
| `git -C dev-rules fetch --tags` | リモートからタグを取得する。 |
| `git -C dev-rules tag --list` | 利用できるタグを確認する。 |
| `git -C dev-rules checkout '<release-tag>'` | 採用するバージョンに切り替える。 |
| `git add dev-rules` | 採用するバージョンを導入先のコミットに含めるため、ステージする。 |

ローカルにcloneしたリポジトリのルートで、`git pull --ff-only` を実行して現在のブランチを更新できる。

## 構成

```text
.
├── AGENTS.md                 # AIエージェント向けの入口
├── README.md                 # 人向けの概要と導入方法
└── guidelines/
    ├── README.md             # 規則一覧と適用手順
    ├── core/                 # 共通の設計規則
    ├── implementation/       # 技術固有の実装規則
    ├── ui/                   # UIデザイン規則
    └── specifications/       # 仕様書作成規則
```

## 貢献方法

規則の編集前に [`AGENTS.md`](AGENTS.md) を読み、作業に該当する文書を確認する。ブランチ、コミット、PRの進め方は [Git規則](guidelines/core/git-guidelines.md) に従う。
