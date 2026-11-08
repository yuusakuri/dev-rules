# READMEガイドライン

## 1 はじめに

### 1.1 目的

本書は、READMEの判読性の向上を目的とする。

### 1.2 適用範囲

本書は、リポジトリの `README.md` に記載する内容と見出しの構成について規定する。

[リポジトリガイドライン](../development/repository-guidelines.md)を前提とする。

## 2 記載の方針

READMEを読んだ人が、そのプロジェクトが何をするものか、なぜ役に立つのか、どう使い始めるのか、どこで助けを得られるのかを短時間で理解できるようにまとめる。

説明は簡潔にし、ほかの文書と重複した説明は残さない。

プロジェクトに関係のない見出しは省く。

## 3 見出しの構成

見出しは次の順序で並べ、名前は表に示したとおりに記載する。

日本語で書くREADMEでは日本語の名前を使い、日本語の名前がない見出しは英語のまま記載する。

順序と役割は、どちらの言語でも変えない。

見出しの構成は、[表1](#table-1)による。

<a id="table-1"></a>表1−見出しの構成

| 英語見出し | 日本語見出し | 記載 | 内容 |
| --- | --- | --- | --- |
| `# <プロジェクト名>` | `# <プロジェクト名>` | 必須 | 文書の先頭に、プロジェクト名だけをH1見出しとして記載する。 |
| バナー画像 | - | 任意 | 見出しを付けず、プロジェクト名の直後に画像を置く。 |
| バッジ | - | 任意 | 見出しを付けず、ビルドやバージョンなどの状態を示すバッジを並べる。 |
| 短い説明 | - | 必須 | 見出しを付けず、そのプロジェクトが何をするものかを1段落で説明する。 |
| 詳しい説明 | - | 任意 | 見出しを付けず、短い説明を補う内容を続ける。 |
| `## Security` | `## セキュリティ` | 任意 | 利用時に注意すべき安全上の事項を記載する。 |
| `## Background` | `## 背景` | 任意 | プロジェクトが生まれた経緯や、読む前に必要な前提知識を記載する。 |
| `## Install` | `## インストール` | 必須 | 入手、インストール、設定、実行に必要な手順を記載する。手動で導入する依存関係や、特定の環境で必要な設定がある場合は、併せて説明する。 |
| `## Usage` | `## 使い方` | 必須 | 使い方をサンプルコードやコピーして実行できるコマンドで示すか、その説明へリンクする。CLIの使用例には代表的なコマンドを、インポートして使う場合の使用例には読み込みと呼び出しを含める。コード例には、プロジェクトのコードと同じlintを適用する。画面や動作は、スクリーンショット、GIF、デモ動画でも示せる。 |
| 独自の見出し | - | 任意 | `## Usage` と `## Documentation` の間に、プロジェクト固有の内容を独自の名前の見出しで追加する。 |
| `## Documentation` | `## ドキュメント` | 推奨 | READMEに収まらない詳細な説明の場所を案内する。APIリファレンス、設定項目、チュートリアルなど、利用者が次に読む文書へリンクする。 |
| `## Maintainers` | `## メンテナ` | 任意 | 保守担当者を記載する。 |
| `## Contributing` | `## 貢献方法` | 推奨 | 貢献の方法を記載する。 |
| `## License` | `## ライセンス` | 推奨 | 最後の見出しとして、採用しているライセンスを記載する。 |

READMEを新しく作るときは、[oss-repo-template](https://github.com/yuusakuri/oss-repo-template)の `README.md` をひな形として使う。

## 4 専用文書との分担

詳細な説明や利用ガイドは、別の場所で管理しているものも含め、READMEからリンクして案内する。

貢献の手順は `CONTRIBUTING.md`、ライセンス本文は `LICENSE` で管理し、READMEには短い案内文とリンクだけを記載する。

## 5 リンク

同じリポジトリのファイルへは、READMEがあるディレクトリを基準とした相対リンクを使用する。

リポジトリの外にある文書へは、その文書のURLを指定する。

リンク切れがないことを確認する。

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2章 | [リポジトリの README ファイルについて - GitHub Docs](https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) | READMEに記載する情報を説明する。 |
| 3章<br>5章 | [Standard Readme — Specification](https://github.com/RichardLitt/standard-readme/blob/main/spec.md) | READMEの見出しの規定を示す。 |
| 3章<br>4章 | [READMEs - Google Style Guides](https://google.github.io/styleguide/docguide/READMEs.html) | READMEの構成例を示す。 |
| 2章<br>4章 | [Documentation Best Practices - Google Style Guides](https://google.github.io/styleguide/docguide/best_practices.html) | READMEの簡潔な書き方を説明する。 |
| 4章 | [リポジトリコントリビューターのためのガイドラインを定める - GitHub Docs](https://docs.github.com/ja/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) | 貢献の手順を専用ファイルで管理する方法を説明する。 |
| 4章 | [リポジトリのライセンス - GitHub Docs](https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) | ライセンスファイルの配置を示す。 |
| 2章<br>3章 | [Best-README-Template](https://github.com/othneildrew/Best-README-Template/blob/main/README.md) | READMEの書き方を示す。 |
| 3章 | [Awesome README](https://github.com/matiassingers/awesome-readme) | スクリーンショットやGIFを使ったREADMEの実例を紹介する。 |
| 2章<br>3章 | [Zalando's README Template](https://github.com/zalando/zalando-howto-open-source/blob/master/READMEtemplate.md) | READMEのテンプレート（アーカイブ済み）。 |
