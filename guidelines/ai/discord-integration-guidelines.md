# AIエージェントのDiscord連携ガイドライン

## 1 はじめに

### 1.1 目的

この文書の目的は、AIエージェントの運用者が、Discordから作業の状況を確認し、必要な指示をエージェントへ届けられるようにすることである。

### 1.2 適用範囲

この文書は、AIエージェントとDiscordとの連携の方法について規定する。個人の端末、サーバー又はクラウドのいずれでエージェントを実行する場合にも適用する。

### 1.3 用語及び定義

この文書で用いる主な用語及び定義は、[表1](#table-1)による。

<a id="table-1"></a>表1−用語及び定義

| 用語 | 定義 |
| --- | --- |
| ウェブフック | 指定したURLへのHTTP要求によって、外部からメッセージ又はイベントを送る仕組み。 |
| ブリッジ | チャットサービスとエージェントとの間で、指示及び応答を中継するプログラム。 |
| セッション | 会話履歴及び実行状態を引き継ぐ、エージェントとの作業の単位。 |
| DM（direct message） | 指定した利用者又はボットと直接送受信するメッセージ。 |
| MCP（Model Context Protocol） | AIアプリケーションと外部のツール又はデータを接続するための通信規約。 |

## 2 連携の型の選び方

連携は、情報の向き及び対応するツールによって、[表2](#table-2)の三つの型に分ける。目的に合う型を選び、複数の目的がある場合は型を組み合わせる。

<a id="table-2"></a>表2−連携の型

| 型 | 情報の向き | 対応するツール | 実現方法 | 適する用途 |
| --- | --- | --- | --- | --- |
| 通知 | エージェントからDiscord | Claude Code<br>Codex | フック又は通知用の外部プログラムから、Discordのウェブフックへ投稿する。 | 長時間の作業の完了、確認待ち及び失敗を知らせる。 |
| チャネルによる対話 | 双方向 | Claude Code | 公式のDiscordプラグインが、実行中のセッションへメッセージを届け、応答を返す。 | 手元で実行しているセッションへ、外出先から指示する。 |
| ブリッジによる対話の中継 | 双方向 | Claude Code<br>Codex | 自作のDiscordボットが受け取ったメッセージを非対話モードのエージェントへ渡し、応答をDiscordへ返す。 | Codexと対話する。複数の人又はチャンネルから、サーバーで実行するエージェントへ指示する。 |

Claude Codeだけを使用し、指示する人が自分だけの場合は、チャネルを使用し、ブリッジを作成しない。ブリッジは、スレッドとセッションとの対応付け及び障害時の再開を自分で実装する必要がある。

## 3 通知

### 3.1 状態が変化した場合だけ送る

通知は、人の対応が必要な状態又は作業の区切りに限定する。送信回数を抑え、確認待ち、完了及び失敗の識別を容易にする。例えば、1 000ファイルの移行では、1ファイルごとではなく、全件の完了、失敗の発生又は確認待ちの場合に送る。

通知のきっかけには、各ツールの[表3](#table-3)の機能を使用する。

<a id="table-3"></a>表3−状態ごとの通知の機能

| 状態 | Claude Code | Codex |
| --- | --- | --- |
| 確認又は入力を待機している | Notificationフック（matcherは `permission_prompt`、`idle_prompt`、`agent_needs_input` など） | PermissionRequestフック（承認の要求だけが対象である。） |
| 応答を返して停止した | Stopフック（入力の `last_assistant_message` に最後の応答がある） | `config.toml` の `notify`（`agent-turn-complete` のJSONが引数で渡される）、又はStopフック |
| APIのエラーでターンが終了した | StopFailureフック（matcherはエラーの種類で、`rate_limit`、`authentication_failed`、`billing_error` など） | 該当するフックはない。`codex exec` で実行する場合は、終了コードで検知する。 |
| セッションが終了した | SessionEndフック | SessionEndフック |

Stopフックを作業の継続の判断にも使用する場合は、通知の送信を別のフックとして登録し、判断の処理と分ける。

### 3.2 送信先はウェブフックにする

通知だけを送る場合は、チャンネルのウェブフックを使用する。ウェブフックを使用すると、ボットを作成せずに投稿できる。

投稿には、`allowed_mentions` に空の `parse` を指定し、本文に含まれる `@everyone` 又はユーザーへのメンションによる通知を抑止する。

進捗を1件の投稿で示す場合は、`wait=true` を付けて投稿し、返された投稿のIDで同じ投稿を編集する。

### 3.3 本文は概要に限定する

通知の本文には、次の事項を含める。

- 作業対象を識別する名前（プロジェクト名又は作業ディレクトリ）
- セッションを識別するID
- 発生した事象（確認待ち、完了又は失敗）
- 最後の応答の要約

通知の本文の例は、[表4](#table-4)による。

<a id="table-4"></a>表4−通知の本文の例

| 事象 | 本文の例 |
| --- | --- |
| 完了 | `[sales-report] 完了：10月の売上レポートを作成した。全部門の合計が会計の総額と一致。reports/2026-10.md（session 6b1e）` |
| 確認待ち | `[web] 確認待ち：pnpm add date-fns の実行の確認を待っている（session 91fa）` |
| 失敗 | `[web] 失敗：rate_limit で停止した。未完了は残り3件（session 91fa）` |

最後の応答、ログ及び差分の全文は送らない。全文は長く、通知として読みにくい。Discordの投稿の本文は2 000文字までのため、要約はこの範囲に収める。詳細は、作業環境のファイル又は成果物のリンクで示す。

### 3.4 送信の失敗をエージェントの動作に影響させない

通知の処理は、短いタイムアウトで送信し、失敗した場合はエラーを記録して終了コード0で終了する。Claude CodeのStopフックは、終了コード2で終了すると、Claude Codeの停止を妨げて会話を続行させる。

DiscordのAPIは、HTTP 429で頻度の制限を知らせる。429が返った場合は、応答の `retry_after` の秒数だけ待機してから再送する。

## 4 Claude Codeのチャネルによる対話

### 4.1 仕組み

チャネルは、MCPサーバーが実行中のClaude Codeのセッションへイベントを届ける機能である。公式のDiscordプラグインを使用すると、Discordのボットへ送ったメッセージがセッションへ届き、Claude Codeの応答がDiscordへ返る。

チャネルはリサーチプレビューであり、`--channels` の構文及びプロトコルが変更されることがある。メッセージは、セッションが開いている間だけ届く。常に受け付ける場合は、バックグラウンドプロセス又は永続的なターミナルでClaude Codeを実行する。

チャネルの利用条件は、[表5](#table-5)による。

<a id="table-5"></a>表5−チャネルの利用条件

| 項目 | 内容 |
| --- | --- |
| 必要なアカウント | claude.aiのアカウント又はConsoleのAPIキー。Amazon Bedrock、Google CloudのAgent Platform、Microsoft Foundryでは使用できない。 |
| 必要なもの | プラグインの実行に使用するBun。 |
| 組織の設定 | Team、Enterpriseでは、管理者が `channelsEnabled` を有効にするまで使用できない。 |
| 非対話モード | `-p` で実行する場合は、端末での入力が必要なツールが無効になる。 |

### 4.2 設定の手順

1. Discord Developer Portalでアプリケーション及びボットを作成し、ボットのトークンを取得する。
2. ボットの設定で、Message Content Intentを有効にする。
3. OAuth2のURL Generatorで、`bot` スコープ並びにView Channels、Send Messages、Send Messages in Threads、Read Message History、Attach Files及びAdd Reactionsの権限を選択する。
4. 生成されたURLを開き、ボットをサーバーへ追加する。
4. Claude Codeで `/plugin install discord@claude-plugins-official` を実行する。
5. Claude Codeで `/discord:configure <token>` を実行する。
6. `claude --channels plugin:discord@claude-plugins-official` でClaude Codeを再起動する。
7. ボットへDMを送り、返信されたペアリングコードを受け取る。
8. Claude Codeで `/discord:access pair <code>` を実行する。

## 5 ブリッジによる対話の中継

### 5.1 構成

ブリッジは、Discordのボットとエージェントの間でメッセージを中継する常駐プロセスである。ブリッジは次の処理を行う。

1. Discordからメッセージを受け取る。
2. メッセージを、非対話モードのエージェントへ渡す。Claude Codeは `claude -p`、Codexは `codex exec` を使用する。
3. エージェントの応答を、元のメッセージへの返信又はスレッドへ投稿する。

### 5.2 メンション及びDMだけを受け付ける

ブリッジは、ボットへのメンション及びDMだけを指示として受け付ける。この範囲に限定すると、特権インテントを有効にする必要がなくなり、指示を受け付ける範囲も明確になる。

Message Content Intentは、特権インテントである。有効にしない場合、他人のメッセージの本文は空で届く。ただし、ボットへのメンション及びDMの本文は届く。

メッセージは、Gatewayに接続して受け取る。受け取る頻度が低い場合は、チャンネルのメッセージの取得APIを `after` で定期的に呼ぶ方法でもよい。

ボットには、[表6](#table-6)の権限を付与する。

<a id="table-6"></a>表6−ボットの権限

| 権限 | 用途 |
| --- | --- |
| View Channels | チャンネルのメッセージの受信。 |
| Read Message History | 取得APIによるメッセージの取得。この権限がないとメッセージが返らない。 |
| Send Messages<br>Send Messages in Threads | 応答の投稿。 |
| Create Public Threads | セッションごとのスレッドを作る場合。 |
| Attach Files | 長い結果をファイルとして添付する場合。 |

### 5.3 スレッドとセッションとを対応させる

サーバーのチャンネルでは、Discordのスレッド一つに、エージェントのセッション一つを対応させる。最初の指示のメッセージからスレッドを作成して新しいセッションを開始し、セッションIDとスレッドのIDとの対応をファイルへ保存する。同じスレッドでのボットへのメンションは、そのセッションを再開して渡す。ボットが作ったスレッドでも、メンションのない投稿の本文は届かないため、続きの指示にもメンションを付ける。

DMにはスレッドを作成できない。DMでは、DMのチャンネルのIDとセッションIDとの対応を保存し、同じDMへの投稿をそのセッションへ渡す。新しいセッションを開始する指示（`new` など）を定義し、受信した場合に対応を作成し直す。

ツールごとのセッションの操作は、[表7](#table-7)による。

<a id="table-7"></a>表7−ツールごとのセッションの操作

| ツール | 新しいセッション | セッションの再開 | セッションIDの取得 |
| --- | --- | --- | --- |
| Claude Code | `claude -p --session-id <UUID> "<本文>"` | `claude -p --resume <UUID> "<本文>"` | ブリッジがUUIDを生成して渡す。 |
| Codex | `codex exec --json "<本文>"` | `codex exec resume <スレッドID> "<本文>"` | `--json` の出力の `thread.started` イベントの `thread_id`。 |

同じセッションでは、エージェントを同時に二つ実行しない。実行中のスレッドに届いたメッセージは、待ち行列に入れ、実行の完了後に渡す。

ブリッジからCodexを起動する場合は、標準入力を閉じる。`codex exec` は、プロンプトの引数とともに標準入力をパイプで渡すと、標準入力の内容を追加の文脈として読むためである。

### 5.4 ボットのメッセージを無視する

ブリッジは、ボット自身及び他のボットのメッセージを無視し、応答が次の指示になる繰返しを防ぐ。スレッドの他の発言を文脈として渡す場合は、Message Content Intentを有効にし、発言者を明記する。

### 5.5 応答の返し方

メッセージを受信したら、直ちに受付を返信し、エージェントの実行の完了後に結果を投稿する。実行には数分から数時間かかる場合があるため、ボットが受け付けたことを利用者が先に確認できるようにする。

応答の例は、[表8](#table-8)による。

<a id="table-8"></a>表8−応答の例

| 時点 | 返信の例 |
| --- | --- |
| 受け付けた場合 | `受け付けた。完了したらここへ返信する（session 6b1e）` |
| 完了した場合 | `完了：Q3の解約理由を集計した。上位は価格（38%）、機能不足（24%）、担当者の変更（11%）。analysis/churn-q3.md` |
| 止まった場合 | `停止：20ターンの上限に達した。未確認は残り2社。続ける場合は“@ボット名 続けて”と投稿する` |

結果は、最後の応答を2 000文字以内に要約して投稿する。長い出力は、ファイルとして添付するか、作業環境に保存して場所を示す。投稿には `allowed_mentions` に空の `parse` を指定し、エージェントの出力に含まれるメンションによる通知を抑止する。

## 6 チェックリスト

- 通知、チャネルによる対話及びブリッジによる対話の中継から、目的及び使用するツールに合う型を選んだ。
- 通知は、確認待ち、完了、失敗などの状態の変化に限定している。
- 通知の本文に、ログ及び差分の全文を含めていない。
- 通知と応答の投稿で、`allowed_mentions` によってメンションの通知を抑止している。
- 通知の送信が失敗しても、エージェントの動作が変化しないことを確認した。
- ブリッジは、メンション及びDMだけを指示として扱い、ボットのメッセージを無視する。
- ブリッジは、スレッド又はDMとセッションとを対応させ、同じセッションを同時に実行しない。

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章 | [Hooks リファレンス - Claude Code Docs](https://code.claude.com/docs/ja/hooks) | Claude Codeのフックのイベント及び設定方法を定めたリファレンス。 |
| 3章 | [Advanced Configuration \| ChatGPT Learn](https://learn.chatgpt.com/docs/config-file/config-advanced) | Codexの詳細な設定方法を示す文書。 |
| 3章 | [Hooks \| ChatGPT Learn](https://learn.chatgpt.com/docs/hooks) | Codexのフックのイベント及び設定方法を示す文書。 |
| 3章 | [Webhook Resource - Documentation - Discord](https://docs.discord.com/developers/resources/webhook) | DiscordのウェブフックAPIを定めたリファレンス。 |
| 3章 | [Rate Limits - Documentation - Discord](https://docs.discord.com/developers/topics/rate-limits) | 頻度の制限と、HTTP 429の応答を定義する。 |
| 4章 | [チャネルを使用して実行中のセッションにイベントをプッシュする - Claude Code Docs](https://code.claude.com/docs/ja/channels) | Claude Codeへ外部のイベントを届けるチャネル機能の利用ガイド。 |
| 5章 | [Gateway - Documentation - Discord](https://docs.discord.com/developers/events/gateway) | DiscordのGateway接続及びイベントを定めたリファレンス。 |
| 5章 | [Message Resource - Documentation - Discord](https://docs.discord.com/developers/resources/message) | DiscordのメッセージAPIを定めたリファレンス。 |
| 5章 | [Claude Code をプログラムで実行する - Claude Code Docs](https://code.claude.com/docs/ja/headless) | Claude Codeの非対話モードでの実行とセッションの再開を示す。 |
| 5章 | [Non-interactive mode \| ChatGPT Learn](https://learn.chatgpt.com/docs/non-interactive-mode) | `codex exec` の出力形式とセッションの再開を定義する。 |
