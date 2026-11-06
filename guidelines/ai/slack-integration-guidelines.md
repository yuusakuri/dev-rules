# AIエージェントのSlack連携ガイドライン

## 1 はじめに

### 1.1 目的

本書の目的は、AIエージェントの運用者が、Slackから作業の状況を確認し、必要な指示をエージェントへ届けられるようにすることである。

### 1.2 適用範囲

本書は、AIエージェントとSlackとの連携の方法について規定する。個人の端末、サーバー又はクラウドのいずれでエージェントを実行する場合にも適用する。

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

連携は、情報の向きとエージェントの実行場所によって、[表2](#table-2)の三つの型に分ける。目的に合う型を選び、複数の目的がある場合は型を組み合わせる。

<a id="table-2"></a>表2−連携の型

| 型 | 情報の向き | エージェントの実行場所 | 実現方法 | 適する用途 |
| --- | --- | --- | --- | --- |
| 通知 | エージェントからSlack | 任意 | フック又は通知用の外部プログラムから、Slackへ投稿する。 | 長時間の作業の完了、確認待ち、失敗を知らせる。 |
| 公式連携による依頼 | Slackからエージェント | 各ツールのクラウド | Slackでエージェントのアプリへメンションし、クラウドのセッション又はタスクを起動する。 | GitHubのリポジトリに対する、独立した作業を依頼する。 |
| ブリッジによる対話の中継 | 双方向 | 端末、サーバー | 自作のSlackアプリが受け取ったメッセージを非対話モードのエージェントへ渡し、応答をSlackへ返す。 | 手元のファイル、社内ネットワーク、専用の実行環境が必要な作業を、Slackから指示する。 |

公式連携で足りる場合は、ブリッジを作らない。ブリッジは、スレッドとセッションの対応づけ又は障害時の再開を自分で実装する必要がある。

## 3 通知

### 3.1 状態が変わった場合だけ送る

通知は、人の対応が必要な状態又は作業の区切りに限定する。送信回数を抑え、確認待ち、完了及び失敗を識別しやすくする。例えば、1 000ファイルの移行では、1ファイルごとではなく、全件の完了、失敗の発生、確認待ちの場合に送る。

通知のきっかけには、各ツールの[表3](#table-3)の機能を使用する。

<a id="table-3"></a>表3−状態ごとの通知の機能

| 状態 | Claude Code | Codex |
| --- | --- | --- |
| 確認又は入力を待っている | Notificationフック（matcherは `permission_prompt`、`idle_prompt`、`agent_needs_input` など） | PermissionRequestフック |
| 応答を返して止まった | Stopフック（入力の `last_assistant_message` に最後の応答がある） | `config.toml` の `notify`（`agent-turn-complete` のJSONが引数で渡される）、又はStopフック |
| APIのエラーでターンが終わった | StopFailureフック（matcherはエラーの種類で、`rate_limit`、`authentication_failed`、`billing_error` など） | 該当するフックはない。`codex exec` で実行する場合は、終了コードで検知する。 |
| セッションが終了した | SessionEndフック | SessionEndフック |

Stopフックを作業の継続の判断にも使用する場合は、通知の送信を別のフックとして登録し、判断の処理と分ける。

### 3.2 通知用のAPIを選ぶ

通知だけを送る場合は、SlackアプリのIncoming Webhookを使用する。Incoming WebhookのURLは、一つのチャンネルに結び付く。

スレッドへの返信又は複数のチャンネルへの投稿が必要な場合は、ボットトークンと `chat.postMessage` を使用する。この場合は、`chat:write` のスコープを付与し、アプリを投稿先のチャンネルへ招待する。

進捗を1件の投稿で示す場合は、`chat.postMessage` の応答のチャンネルと `ts` を保存し、`chat.update` で同じ投稿を更新する。`chat.postMessage` を繰り返すと、新しい投稿が増える。

### 3.3 本文は概要に限定する

通知の本文には、次の事項を含める。

- 作業対象を識別する名前（プロジェクト名、作業ディレクトリ）。
- セッションを識別するID。
- 起きた事象（確認待ち、完了、失敗）。
- 最後の応答の要約。

通知の本文の例は、[表4](#table-4)による。

<a id="table-4"></a>表4−通知の本文の例

| 事象 | 本文の例 |
| --- | --- |
| 完了 | `[sales-report] 完了：10月の売上レポートを作成した。全部門の合計が会計の総額と一致。reports/2026-10.md（session 6b1e）` |
| 確認待ち | `[web] 確認待ち：pnpm add date-fns の実行の確認を待っている（session 91fa）` |
| 失敗 | `[web] 失敗：rate_limit で停止した。未完了は残り3件（session 91fa）` |

最後の応答、ログ、差分の全文は送らない。全文は長く、通知として読みにくい。Slackは1回の投稿を4 000文字以内にすることを推奨しているため、要約はこの範囲に収める。詳細は、作業環境のファイル又は成果物のリンクで示す。

### 3.4 送信の失敗でエージェントを止めない

通知の処理は、短いタイムアウトで送信し、失敗した場合はエラーを記録して正常に終了する。通知の失敗でフックがエラーを返すと、エージェントの作業が止まることがある。

Slackの投稿は、一つのチャンネルにつき毎秒1件を目安に制限される。HTTP 429が返った場合は、`Retry-After` ヘッダーの秒数だけ待ってから再送する。

## 4 公式連携による依頼

### 4.1 Claude Code

Claude Code in Slackでは、チャンネルで `@Claude` にメンションして作業を依頼すると、Claude Codeのクラウドセッションが起動する。進捗と結果はスレッドへ返信され、結果からプルリクエストを作成できる。

Claude Code in Slackの利用条件は、[表5](#table-5)による。

<a id="table-5"></a>表5−Claude Code in Slackの利用条件

| 項目 | 内容 |
| --- | --- |
| 利用できるプラン | Pro、Max、Ultra。Team、EnterpriseではClaude Tagを使用する。 |
| 前提 | Slackのワークスペースが、どの組織のClaude Tagにも接続されていない。接続されているワークスペースでは、個人のプランでも使用できない。クラウドセッションが有効で、claude.aiにGitHubのリポジトリを接続している。SlackのアカウントをClaudeのアカウントに接続している。 |
| 使用できる場所 | アプリを招待した公開チャンネルと非公開チャンネル。DMでは使用できない。 |
| ルーティング | Code onlyは全てのメンションを作業として扱い、Code + Chatは作業か質問かを判定する。 |
| 制限 | リポジトリはGitHubに限る。一つのセッションで作成できるプルリクエストは一つである。 |

### 4.2 Codex

Slackのアプリ（`@ChatGPT`）にメンションして作業を依頼すると、Codex Cloudのタスクが起動し、結果がスレッドへ返信される。

Codexの利用条件は、[表6](#table-6)による。

<a id="table-6"></a>表6−Codexの利用条件

| 項目 | 内容 |
| --- | --- |
| 前提 | ChatGPTのワークスペースの管理者が、Slack連携とCodex Cloudを有効にしている。作業に使用するクラウド環境を、ワークスペースで共有している。 |
| 使用できる場所 | 有効にした公開チャンネルと非公開チャンネル。Slack Connectのチャンネルでは使用できない。 |
| 環境の選択 | ワークスペースで共有したクラウド環境から選ばれる。個人のクラウド環境は選ばれない。 |

### 4.3 依頼の規則

- 依頼には、対象、期待する結果、完了の条件を書く。長いスレッドでは、最新の依頼に要点をまとめ直す。

依頼の例は、[表7](#table-7)による。

<a id="table-7"></a>表7−依頼の例

| 依頼の良否 | 例 |
| --- | --- |
| 曖昧 | `@Claude ログインの不具合を見て` |
| 具体的 | `@Claude acme/web で、セッションの期限切れの後にログインが失敗する不具合を直して。再現するテストを追加し、pnpm test が通ったらプルリクエストを作って` |

- エージェントの成果物は、確認してから使用する。

## 5 ブリッジによる対話の中継

### 5.1 構成

ブリッジは、Slackアプリとエージェントの間でメッセージを中継する常駐プロセスである。ブリッジは次の処理を行う。

1. Slackからメッセージを受け取る。
2. メッセージを、非対話モードのエージェントへ渡す。Claude Codeは `claude -p`、Codexは `codex exec` を使用する。
3. エージェントの応答を、元のメッセージのスレッドへ返信する。

Claude Codeのチャネル機能は、実行中のセッションへ外部のメッセージを届けるが、リサーチプレビューに含まれるチャットのプラグインはTelegram、Discord、iMessageである。Slackと双方向に対話する場合は、ブリッジを使用する。

### 5.2 メッセージはSocket Modeで受け取る

ブリッジは、Socket Modeでイベントを受け取る。Socket Modeは、WebSocketでイベントを受け取るため、インターネットへ公開するHTTPのエンドポイントが要らない。受け取ったイベントは `envelope_id` で一つずつ確認応答し、接続の切断と再接続を処理する。

Slackアプリには、[表8](#table-8)のスコープを付与する。

<a id="table-8"></a>表8−Slackアプリのスコープ

| トークン | スコープ | 用途 |
| --- | --- | --- |
| アプリレベルトークン | `connections:write` | Socket Modeの接続によるイベントの受信。 |
| ボットトークン | `chat:write` | スレッドへの返信。 |
| ボットトークン | `app_mentions:read` | メンションの受信。メンション以外も受け取る場合は、`channels:history` 又は `groups:history` を加える。 |

スコープに加えて、Event Subscriptionsで受け取るイベントを登録する。メンションは `app_mention`、スレッドへの返信などメンションのないメッセージは、公開チャンネルなら `message.channels`、非公開チャンネルなら `message.groups` を登録する。

### 5.3 スレッドとセッションを対応させる

Slackのスレッド一つに、エージェントのセッション一つを対応させる。スレッドの最初のメッセージで新しいセッションを開始し、セッションIDとスレッドの識別子の対応をファイルへ保存する。スレッドの識別子には、チャンネルIDと、メッセージに `thread_ts` があればその値を、なければ最初のメッセージ自身の `ts` を組み合わせて使用する（例：`C024BE91L:1730700000.000100`）。`ts` はチャンネルの中でだけ一意であり、チャンネルIDがないと別のチャンネルの会話を同じセッションへ渡してしまう。複数のワークスペースを扱う場合は、ワークスペースIDも加える。スレッドへの返信の `thread_ts` は、最初のメッセージの `ts` と一致する。同じスレッドへの返信は、そのセッションを再開して渡す。

ツールごとのセッションの操作は、[表9](#table-9)による。

<a id="table-9"></a>表9−ツールごとのセッションの操作

| ツール | 新しいセッション | セッションの再開 | セッションIDの取得 |
| --- | --- | --- | --- |
| Claude Code | `claude -p --session-id <UUID> "<本文>"` | `claude -p --resume <UUID> "<本文>"` | ブリッジがUUIDを生成して渡す。 |
| Codex | `codex exec --json "<本文>"` | `codex exec resume <スレッドID> "<本文>"` | `--json` の出力の `thread.started` イベントの `thread_id`。 |

同じセッションでは、エージェントを同時に二つ実行しない。実行中のスレッドに届いたメッセージは、待ち行列に入れ、実行が終わってから渡す。Codexは標準入力からも指示を読むため、標準入力を閉じて起動する。

### 5.4 ボットのメッセージを無視する

ブリッジは、ボット自身と他のボットのメッセージを無視し、応答が次の指示になる繰り返しを防ぐ。スレッドの他の発言を文脈として渡す場合は、発言者を明記する。

### 5.5 応答の返し方

メッセージを受け取ったら、すぐに受け付けたことをスレッドへ返信し、エージェントの実行が終わってから結果を返信する。エージェントの実行には数分から数時間かかるため、結果を待ってから最初の返信をしない。

応答の例は、[表10](#table-10)による。

<a id="table-10"></a>表10−応答の例

| 時点 | 返信の例 |
| --- | --- |
| 受け付けた場合 | `受け付けた。完了したらここへ返信する（session 6b1e）` |
| 完了した場合 | `完了：Q3の解約理由を集計した。上位は価格（38%）、機能不足（24%）、担当者の変更（11%）。analysis/churn-q3.md` |
| 止まった場合 | `停止：20ターンの上限に達した。未確認は残り2社。続ける場合は“続けて”と返信する` |

結果は、最後の応答を4 000文字以内に要約して返信する。長い出力は、ファイルとしてアップロードするか、作業環境に保存して場所を示す。

## 6 チェックリスト

- 通知、公式連携による依頼、ブリッジによる対話の中継から、目的に合う型を選んだ。
- 通知は、確認待ち、完了、失敗などの状態の変化に限定し、本文にログ又は差分の全文を含めていない。
- 通知の送信の失敗で、エージェントが止まらないことを確認した。
- ブリッジは、ボットのメッセージを無視する。
- ブリッジは、スレッドとセッションを対応させ、同じセッションを同時に実行しない。

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章 | [Hooks リファレンス - Claude Code Docs](https://code.claude.com/docs/ja/hooks) | Claude Codeのフックのイベント及び設定方法を定めたリファレンス。 |
| 3章 | [Advanced Configuration \| ChatGPT Learn](https://learn.chatgpt.com/docs/config-file/config-advanced) | Codexの詳細な設定方法を示す文書。 |
| 3章 | [Hooks \| ChatGPT Learn](https://learn.chatgpt.com/docs/hooks) | Codexのフックのイベント及び設定方法を示す文書。 |
| 3章 | [Sending messages using incoming webhooks \| Slack Developer Docs](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks) | Incoming Webhookの作成方法と送信形式を示す。 |
| 3章<br>5章 | [chat.postMessage method \| Slack Developer Docs](https://docs.slack.dev/reference/methods/chat.postMessage) | Slackへメッセージを投稿するAPIを定めたリファレンス。 |
| 3章 | [chat.update method \| Slack Developer Docs](https://docs.slack.dev/reference/methods/chat.update) | チャンネルと `ts` で指定した投稿を更新する方法を定義する。 |
| 5章 | [message event \| Slack Developer Docs](https://docs.slack.dev/reference/events/message) | メッセージのイベントと、受け取るために登録するイベントの種類を定義する。 |
| 3章 | [Rate limits \| Slack Developer Docs](https://docs.slack.dev/apis/web-api/rate-limits) | 投稿の頻度の制限と、HTTP 429の `Retry-After` ヘッダーを定義する。 |
| 4章 | [Slack での Claude Code - Claude Code Docs](https://code.claude.com/docs/ja/slack) | SlackからClaude Codeへ作業を依頼する方法を示す文書。 |
| 4章 | [Work with Claude Tag - Claude.ai Documentation](https://claude.com/docs/claude-tag/overview) | Team、Enterpriseのプランで使用する、組織が管理するSlackの `@Claude` を示す。 |
| 4章 | [Use ChatGPT in Slack \| ChatGPT Learn](https://learn.chatgpt.com/docs/third-party/slack) | SlackからChatGPT及びCodexを利用する方法を示す文書。 |
| 5章 | [チャネルを使用して実行中のセッションにイベントをプッシュする - Claude Code Docs](https://code.claude.com/docs/ja/channels) | Claude Codeへ外部のイベントを届けるチャネル機能の利用ガイド。 |
| 5章 | [Using Socket Mode \| Slack Developer Docs](https://docs.slack.dev/apis/events-api/using-socket-mode) | WebSocketによるイベントの受信、確認応答、再接続を定義する。 |
| 5章 | [connections:write scope \| Slack Developer Docs](https://docs.slack.dev/reference/scopes/connections.write/) | Socket Modeの接続に必要なアプリレベルトークンのスコープを定義する。 |
| 5章 | [Claude Code をプログラムで実行する - Claude Code Docs](https://code.claude.com/docs/ja/headless) | Claude Codeの非対話モードでの実行とセッションの再開を示す。 |
| 5章 | [Non-interactive mode \| ChatGPT Learn](https://learn.chatgpt.com/docs/non-interactive-mode) | `codex exec` の出力形式とセッションの再開を定義する。 |
