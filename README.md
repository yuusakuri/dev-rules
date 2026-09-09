# ソフトウェア開発ガイドライン

ソフトウェア開発ガイドラインを定義する。

[ガイドライン一覧](guidelines/README.md) · [AIエージェント向けの入口](AGENTS.md)

## 構成

```text
.
├── AGENTS.md                 # AIエージェント向けの入口
├── README.md                 # 人向けの概要と導入方法
├── CONTRIBUTING.md           # このリポジトリへの貢献方法
├── guidelines/
│   ├── README.md             # ガイドライン一覧と適用手順
│   ├── software/             # ソフトウェアとアプリケーションの設計ガイドライン
│   ├── development/          # リポジトリ、Git、バージョン管理のガイドライン
│   ├── implementation/       # 技術固有の実装ガイドライン
│   ├── ui/                   # UIデザインガイドライン
│   └── documentation/        # ドキュメント作成ガイドライン
└── templates/
    ├── README.md             # テンプレート一覧と取得方法
    └── documentation/        # ドキュメントのテンプレート
```

## 利用方法

エージェントに参照させる場合は、ネット上のURLまたはローカルの保存先を指定して `AGENTS.md` から読ませる。プロジェクトのGitリポジトリに含める場合は、Git submoduleとして導入する。どちらの場合も、エージェントは `AGENTS.md` を入口として、作業に必要なガイドラインをたどる。

### ネット経由で参照する

URLの内容を取得できるエージェントに、次の指示を渡す。

```text
実装、設計、レビューの前に、次の文書を読み、同文書が案内する該当ガイドラインに従うこと。
https://raw.githubusercontent.com/yuusakuri/dev-rules/main/AGENTS.md
```

### ローカルに置いて参照する

任意の場所で、次のコマンドを実行する。

```bash
git clone https://github.com/yuusakuri/dev-rules.git
```

ローカルのファイルを読めるエージェントに、次の指示を渡す。

```text
実装、設計、レビューの前に `dev-rules/AGENTS.md` を読み、同ファイルが案内する該当ガイドラインに従うこと。
```

### Gitリポジトリに組み込む

導入先のリポジトリのルートから、次のコマンドを実行する。

```bash
git submodule add https://github.com/yuusakuri/dev-rules.git dev-rules
```

導入先の `AGENTS.md` に次の内容を記載する。配置先を変える場合は、コマンドと参照先の `dev-rules` を同じパスに置き換える。

```md
## 開発ガイドライン

実装、設計、レビューの前に `dev-rules/AGENTS.md` を読み、同ファイルが案内する該当ガイドラインに従うこと。
```

## テンプレートの利用

設計書を書き始めるためのひな形を [`templates/`](templates/README.md) に用意している。

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

## 貢献方法

貢献の手順は [`CONTRIBUTING.md`](CONTRIBUTING.md) を参照する。
