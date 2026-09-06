# READMEガイドライン

本書は、リポジトリの `README.md` に記載する内容を定めます。
[リポジトリガイドライン](../development/repository-guidelines.md)を前提とします。

## 記載する内容

冒頭にプロジェクト名と短い説明を記載します。
本文では、次の情報からプロジェクトに関連する項目を選びます。

| 内容 | 記載する情報 |
| --- | --- |
| プロジェクトの説明 | 主な機能と、解決する問題を説明します。 |
| 利用開始方法 | プロジェクトを使い始める方法を示します。 |
| 問い合わせ先 | ヘルプを得られる場所を案内します。 |
| 関係者 | 保守担当者と貢献者を示します。 |

READMEは短くまとめ、古い情報、誤った情報、重複した説明を取り除きます。

## 利用方法

入手、インストール、設定、実行に必要な手順を記載します。
手動で導入する依存関係や、特定の環境で必要な設定がある場合は、併せて説明します。

使い方は、サンプルコードやコピーして実行できるコマンドで示すか、その説明へリンクします。
CLIの使用例には代表的なコマンドを、インポートして使う場合の使用例には読み込みと呼び出しを含めます。
コード例には、プロジェクトのコードと同じlintを適用します。

画面や動作は、スクリーンショット、GIF、デモ動画でも示せます。

## 専用文書との分担

詳細な説明や利用ガイドは、別の場所で管理しているものも含め、READMEからリンクして案内します。

貢献の手順は `CONTRIBUTING.md`、ライセンス本文は `LICENSE.md` で管理し、READMEには短い案内文とリンクだけを記載します。
記載例を次に示します。

```markdown
## 貢献方法

貢献の手順は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

ライセンスは [LICENSE.md](LICENSE.md) を参照してください。
```

## リンク

同じリポジトリのファイルへは、READMEがあるディレクトリを基準とした相対リンクを使用します。
GitHubは現在のブランチに応じて相対リンクを解決します。
リンク切れがないことを確認します。

リンクの文字列は途中で改行せず、1行で記載します。
見出しへ直接リンクする場合は、GitHubが見出しに生成するアンカーを使用できます。

## 目次とバッジ

GitHubは、READMEの見出しから目次を自動生成します。
表示されたページのアウトラインメニューから、その目次を開けます。

GitHub Actionsのワークフローの成功・失敗を表示する場合は、状態バッジをREADMEに画像として埋め込めます。
特定のブランチやイベントの状態を表示する場合は、バッジのURLに `branch` または `event` パラメーターを指定します。

## 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 記載する内容<br>リンク<br>目次とバッジ | [リポジトリの README ファイルについて - GitHub Docs](https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) | READMEに含める情報、相対リンク、見出しへのリンク、自動生成される目次を説明しています。 |
| 利用方法<br>専用文書との分担 | [READMEs - Google Style Guides](https://google.github.io/styleguide/docguide/READMEs.html) | 使用例と、利用者・開発チーム向けの文書へのリンクを示しています。 |
| 記載する内容<br>専用文書との分担 | [Documentation Best Practices - Google Style Guides](https://google.github.io/styleguide/docguide/best_practices.html) | 簡潔で正確な記述と、詳細文書や別の場所にある文書への案内を説明しています。 |
| 専用文書との分担 | [リポジトリコントリビューターのためのガイドラインを定める - GitHub Docs](https://docs.github.com/ja/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) | 貢献の手順を専用ファイルで管理する方法を説明しています。 |
| 専用文書との分担 | [リポジトリのライセンス - GitHub Docs](https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) | ライセンスファイルの配置と、`LICENSE.md` を含むファイル名の例を示しています。 |
| 目次とバッジ | [ワークフロー状態バッジの追加 - GitHub Docs](https://docs.github.com/ja/actions/how-tos/monitor-workflows/add-a-status-badge) | バッジの埋め込みと、ブランチ・イベントの指定方法を説明しています。 |
| 記載する内容<br>利用方法 | [Best-README-Template](https://github.com/othneildrew/Best-README-Template/blob/main/README.md) | 冒頭の説明、導入手順、使用例とデモの記載方法を示しています。 |
| 利用方法 | [Awesome README](https://github.com/matiassingers/awesome-readme) | スクリーンショットやGIFを使ったREADMEの実例を紹介しています。 |
| 記載する内容<br>利用方法<br>リンク | [Standard Readme — Specification](https://github.com/RichardLitt/standard-readme/blob/main/spec.md) | 名前と短い説明、依存関係、CLI・ライブラリの使用例、lint、リンク切れに関する規定を示しています。 |
| 記載する内容<br>利用方法 | [Zalando's README Template](https://github.com/zalando/zalando-howto-open-source/blob/master/READMEtemplate.md) | 関連する項目の選択、機能の説明、導入手順、画像・動画の利用を示すテンプレートです（アーカイブ済み）。 |
