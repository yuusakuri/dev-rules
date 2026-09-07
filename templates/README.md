# テンプレート

ガイドラインに沿った成果物を作り始めるためのひな形を提供する。各ファイルの`<>`で囲んだ箇所をプロジェクトの内容へ置き換えて使う。

## テンプレート一覧

| テンプレート | 用途 | 準拠するガイドライン |
| --- | --- | --- |
| [`specifications/specification.md`](specifications/specification.md) | 1つの対象領域（リソース、インターフェース、サブシステムなど）の仕様書。 | [仕様書作成ガイドライン](../guidelines/documentation/specification-guidelines.md) |
| [`specifications/ui/`](specifications/ui/) | UI仕様書一式。共通規約、画面遷移、画面一覧、メッセージ、権限、レスポンシブ、アクセシビリティ、個別画面、共通部品を含む。 | [UI仕様書作成ガイドライン](../guidelines/documentation/ui-specification-guidelines.md) |

`specifications/ui/`の構成は次のとおりとする。

```text
specifications/ui/
├── README.md                              # 仕様書の目的、対象システム、管理方法、関連資料
├── 00-glossary.md                         # 用語、表記、業務上の意味
├── 01-common-rules.md                     # 全画面共通のUI挙動
├── 02-navigation.md                       # 画面遷移、URL、ディープリンク、戻る操作
├── 03-screen-catalog.md                   # 全画面の一覧
├── 04-message-catalog.md                  # 表示メッセージの一元管理
├── 05-permission-matrix.md                # ロール別の閲覧権限と操作権限
├── 06-responsive-rules.md                 # ブレークポイントと画面幅別の共通ルール
├── 07-accessibility-rules.md              # キーボード操作、フォーカス、読み上げ、代替テキスト
├── components/
│   └── CMP-CATEGORY-NNN.md                # 再利用するUI部品の仕様
└── screens/
    └── SCR-DOMAIN-NNN-screen-name.md      # 個別画面の仕様
```

## 取得方法

このリポジトリをGit submoduleとして組み込んでいる場合は、`dev-rules/templates/`から目的のファイルをコピーする。組み込んでいない場合は、導入先のリポジトリのルートで次のいずれかのコマンドを実行する。

UI仕様書一式を`docs/specifications/ui/`へ展開する場合は、次のコマンドを実行する。

```bash
mkdir -p docs/specifications/ui
curl -L https://github.com/yuusakuri/dev-rules/archive/refs/heads/main.tar.gz \
  | tar -xz -f - -C docs/specifications/ui --strip-components=4 dev-rules-main/templates/specifications/ui
```

テンプレート全体を取得する場合は、次のコマンドを実行する。

```bash
curl -L https://github.com/yuusakuri/dev-rules/archive/refs/heads/main.tar.gz \
  | tar -xz -f - --strip-components=1 dev-rules-main/templates
```

1ファイルだけを取得する場合は、次のコマンドの取得先と保存先を目的のファイルへ置き換えて実行する。

```bash
curl -o docs/specifications/ui/screens/SCR-USER-001-user-list.md \
  https://raw.githubusercontent.com/yuusakuri/dev-rules/main/templates/specifications/ui/screens/SCR-DOMAIN-NNN-screen-name.md
```

特定のバージョンを取得する場合は、URL中の`main`をタグ名へ置き換える。アーカイブを展開するコマンドでは、`dev-rules-main`もタグ名に応じた`dev-rules-<タグ名>`へ置き換える。

## 使い方

1. 取得したファイルを、導入先の`docs/specifications/`配下へ配置する。
2. ファイル名の`SCR-DOMAIN-NNN-screen-name`のような箇所を、対象の識別子と名称へ置き換える。
3. 本文の`<>`で囲んだ箇所を、プロジェクトの内容へ置き換える。
4. 該当しない項目は削除せず、「対象外」と理由を記載する。検討漏れと記入漏れを区別できるようにするため。
5. 準拠するガイドラインを読み、記述内容が規則を満たしているか確認する。
