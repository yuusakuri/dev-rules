# READMEガイドライン

本書は、リポジトリの `README.md` に記載する内容と見出しの構成を定めます。
[リポジトリガイドライン](../development/repository-guidelines.md)を前提とします。

## 記載の方針

READMEを読んだ人が、そのプロジェクトが何をするものか、なぜ役に立つのか、どう使い始めるのか、どこで助けを得られるのかを短時間で理解できるようにまとめます。
説明は簡潔にし、古い情報、誤った情報、ほかの文書と重複した説明は残しません。
プロジェクトに関係のない見出しは省きます。

## 見出しの構成

見出しは次の順序で並べ、名前は表に示したとおりに記載します。
日本語で書くREADMEでは、見出しの名前を対応する日本語へ置き換えて構いませんが、順序と役割は変えません。

| 見出し | 記載 | 内容 |
| --- | --- | --- |
| `# <プロジェクト名>` | 必須 | 文書の先頭に、プロジェクト名だけをH1見出しとして記載します。 |
| バナー画像 | 任意 | 見出しを付けず、プロジェクト名の直後に画像を置きます。 |
| バッジ | 任意 | 見出しを付けず、ビルドやバージョンなどの状態を示すバッジを並べます。 |
| 短い説明 | 必須 | 見出しを付けず、そのプロジェクトが何をするものかを1段落で説明します。 |
| 詳しい説明 | 任意 | 見出しを付けず、短い説明を補う内容を続けます。 |
| `## Table of Contents` | 100行を超える場合は必須 | この見出しより後にあるすべての見出しへのリンクを並べます。 |
| `## Security` | 任意 | 利用時に注意すべき安全上の事項を記載します。 |
| `## Background` | 任意 | プロジェクトが生まれた経緯や、読む前に必要な前提知識を記載します。 |
| `## Install` | 必須 | 入手とインストールの手順を記載します。 |
| `## Usage` | 必須 | 使い方を記載します。 |
| 独自の見出し | 任意 | `## Usage` と `## API` の間に、プロジェクト固有の内容を独自の名前の見出しで追加します。 |
| `## API` | 任意 | 公開しているインターフェースの仕様を記載します。 |
| `## Maintainers` | 任意 | 保守担当者を記載します。 |
| `## Contributing` | 必須 | 貢献の方法を記載します。 |
| `## License` | 必須 | 最後の見出しとして、採用しているライセンスを記載します。 |

必須の見出しだけで構成した場合は、次のようになります。

```markdown
# <プロジェクト名>

<プロジェクトが何をするものかを説明する1段落>

## Table of Contents

## Install

## Usage

## Contributing

## License
```

## 利用方法

`## Install` には、入手、インストール、設定、実行に必要な手順を記載します。
手動で導入する依存関係や、特定の環境で必要な設定がある場合は、併せて説明します。

`## Usage` には、使い方をサンプルコードやコピーして実行できるコマンドで示すか、その説明へリンクします。
CLIの使用例には代表的なコマンドを、インポートして使う場合の使用例には読み込みと呼び出しを含めます。
コード例には、プロジェクトのコードと同じlintを適用します。

画面や動作は、スクリーンショット、GIF、デモ動画でも示せます。

## 専用文書との分担

詳細な説明や利用ガイドは、別の場所で管理しているものも含め、READMEからリンクして案内します。

貢献の手順は `CONTRIBUTING.md`、ライセンス本文は `LICENSE.md` で管理し、READMEには短い案内文とリンクだけを記載します。
記載例を次に示します。

```markdown
## Contributing

貢献の手順は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## License

ライセンスは [LICENSE.md](LICENSE.md) を参照してください。
```

## リンク

同じリポジトリのファイルへは、READMEがあるディレクトリを基準とした相対リンクを使用します。
リポジトリの外にある文書へは、その文書のURLを指定します。
リンク切れがないことを確認します。

## 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 記載の方針 | [リポジトリの README ファイルについて - GitHub Docs](https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) | READMEで読者に伝える情報と、相対リンクの使い方を説明しています。 |
| 見出しの構成<br>リンク | [Standard Readme — Specification](https://github.com/RichardLitt/standard-readme/blob/main/spec.md) | 見出しの名前、順序、必須と任意の区別、リンク切れとlintに関する規定を示しています。 |
| 利用方法<br>専用文書との分担 | [READMEs - Google Style Guides](https://google.github.io/styleguide/docguide/READMEs.html) | 使用例と、利用者・開発チーム向けの文書へのリンクを示しています。 |
| 記載の方針<br>専用文書との分担 | [Documentation Best Practices - Google Style Guides](https://google.github.io/styleguide/docguide/best_practices.html) | 簡潔で正確な記述と、詳細文書や別の場所にある文書への案内を説明しています。 |
| 専用文書との分担 | [リポジトリコントリビューターのためのガイドラインを定める - GitHub Docs](https://docs.github.com/ja/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) | 貢献の手順を専用ファイルで管理する方法を説明しています。 |
| 専用文書との分担 | [リポジトリのライセンス - GitHub Docs](https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) | ライセンスファイルの配置と、`LICENSE.md` を含むファイル名の例を示しています。 |
| 記載の方針<br>利用方法 | [Best-README-Template](https://github.com/othneildrew/Best-README-Template/blob/main/README.md) | 冒頭の説明、導入手順、使用例とデモの記載方法を示しています。 |
| 利用方法 | [Awesome README](https://github.com/matiassingers/awesome-readme) | スクリーンショットやGIFを使ったREADMEの実例を紹介しています。 |
| 記載の方針<br>利用方法 | [Zalando's README Template](https://github.com/zalando/zalando-howto-open-source/blob/master/READMEtemplate.md) | 関連する項目の選択、機能の説明、導入手順、画像・動画の利用を示すテンプレートです（アーカイブ済み）。 |
