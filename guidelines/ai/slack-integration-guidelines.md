# AIエージェントのSlack連携ガイドライン

## 1 はじめに

### 1.1 目的

この文書の目的は、AIエージェントの運用者が、Slackから作業の状況を確認し、必要な指示をエージェントへ届けられるようにすることである。

### 1.2 適用範囲

この文書は、AIエージェントとSlackとの連携の方法について規定する。個人の端末、サーバー又はクラウドのいずれでエージェントを実行する場合にも適用する。

### 1.3 用語及び定義

この文書で用いる主な用語及び定義は、[表1](#table-1)による。

<a id="table-1"></a>表1−用語及び定義

| 用語 | 定義 |
| --- | --- |
| ウェブフック | 指定したURLへのHTTP要求によって、外部からメッセージ又はイベントを送る仕組み。 |
| ブリッジ | チャットサービスとエージェントとの間で、指示及び応答を中継するプログラム。 |
| セッション | 会話履歴及び実行状態を引き継ぐ、エージェントとの作業の単位。 |
| DM（direct message） | 指定した利用者又はボットと直接送受信するメッセージ。 |

## 2 連携の型の選び方

連携は、情報の向き及びエージェントの実行場所によって、[表2](#table-2)の三つの型に分ける。目的に合う型を選び、複数の目的がある場合は型を組み合わせる。

<a id="table-2"></a>表2−連携の型

| 型 | 情報の向き | エージェントの実行場所 | 実現方法 | 適する用途 |
| --- | --- | --- | --- | --- |
| 通知 | エージェントからSlack | 任意 | フック又は通知用の外部プログラムから、Slackへ投稿する。 | 長時間の作業の完了、確認待ち及び失敗を知らせる。 |
| 公式連携による依頼 | Slackからエージェント | 各ツールのクラウド | Slackでエージェントのアプリへメンションし、クラウドのセッション又はタスクを起動する。 | GitHubのリポジトリに対する、独立した作業を依頼する。 |
| ブリッジによる対話の中継 | 双方向 | 端末、サーバー | 自作のSlackアプリが受け取ったメッセージを非対話モードのエージェントへ渡し、応答をSlackへ返す。 | 手元のファイル、社内ネットワーク、専用の実行環境が必要な作業を、Slackから指示する。 |

公式連携で足りる場合は、ブリッジを作成しない。ブリッジは、スレッドとセッションとの対応付け及び障害時の再開を自分で実装する必要がある。

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

### 3.2 通知用のAPIを選ぶ

通知だけを送る場合は、SlackアプリのIncoming Webhookを使用する。Incoming WebhookのURLは、一つのチャンネルに対応する。

スレッドへの返信又は複数のチャンネルへの投稿が必要な場合は、ボットトークン及び `chat.postMessage` を使用する。この場合は、`chat:write` のスコープを付与し、アプリを投稿先のチャンネルへ招待する。

進捗を1件の投稿で示す場合は、`chat.postMessage` の応答のチャンネル及び `ts` を保存し、`chat.update` で同じ投稿を更新する。`chat.postMessage` を繰り返すと、新しい投稿が増える。

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

最後の応答、ログ及び差分の全文は送らない。全文は長く、通知として読みにくい。Slackは1回の投稿を4 000文字以内にすることを推奨しているため、要約はこの範囲に収める。詳細は、作業環境のファイル又は成果物のリンクで示す。

### 3.4 送信の失敗をエージェントの動作に影響させない

通知の処理は、短いタイムアウトで送信し、失敗した場合はエラーを記録して終了コード0で終了する。Claude CodeのStopフックは、終了コード2で終了すると、Claude Codeの停止を妨げて会話を続行させる。

Slackの投稿は、一つのチャンネルにつき毎秒1件を目安に制限される。HTTP 429が返った場合は、`Retry-After` ヘッダーの秒数だけ待機してから再送する。

## 4 公式連携による依頼

### 4.1 Claude Code

Claude Code in Slackでは、チャンネルで `@Claude` にメンションして作業を依頼すると、Claude Codeのクラウドセッションが起動する。Claude Codeは、進捗及び結果をスレッドへ投稿する。利用者は、結果の投稿からプルリクエストを作成できる。

Claude Code in Slackの利用条件は、[表5](#table-5)による。

<a id="table-5"></a>表5−Claude Code in Slackの利用条件

| 項目 | 内容 |
| --- | --- |
| 利用できるプラン | Pro、Max、Ultra。Team、EnterpriseではClaude Tagを使用する。 |
| 前提 | Slackのワークスペースが、どの組織のClaude Tagにも接続されていない。接続されているワークスペースでは、個人のプランでも使用できない。<br>クラウドセッションが有効である。<br>claude.ai/codeでGitHubアカウントを接続し、一つ以上のリポジトリを認証している。<br>SlackのアカウントをClaudeのアカウントにリンクしている。 |
| 使用できる場所 | アプリを招待した公開チャンネル及び非公開チャンネル。DMでは使用できない。 |
| ルーティング | Code のみは、全てのメンションをClaude Codeのセッションへ送る。Code + Chatは、メッセージごとにClaude CodeとClaude Chatとのいずれかへ振り分ける。 |
| 制限 | リポジトリは、GitHubのものに限る。一つのセッションで作成できるプルリクエストは、一つである。 |

### 4.2 Codex

Slackのアプリ（`@ChatGPT`）にメンションして作業を依頼すると、Codex Cloudのタスクが起動する。結果は、スレッドへ返信される。

Codexの利用条件は、[表6](#table-6)による。

<a id="table-6"></a>表6−Codexの利用条件

| 項目 | 内容 |
| --- | --- |
| 前提 | ChatGPTのワークスペースのオーナー又は管理者が、Slackのデプロイメントを設定している。<br>ワークスペースでCloud delegationを利用できる。<br>作業に使用するクラウド環境を公開し、ワークスペースで共有している。 |
| 使用できる場所 | 有効にした公開チャンネル及び非公開チャンネル。他の組織と共有したSlack Connectのチャンネルでは使用できない。 |
| 環境の選択 | ChatGPTが、アクセス可能なワークスペース共有のクラウド環境から選択する。個人のクラウド環境は、対象外である。 |

### 4.3 依頼の規則

依頼には、対象、期待する結果及び完了の条件を記載する。長いスレッドでは、最新の依頼に要点をまとめ直す。

依頼の例は、[表7](#table-7)による。

<a id="table-7"></a>表7−依頼の例

| 依頼の良否 | 例 |
| --- | --- |
| 曖昧 | `@Claude ログインの不具合を見て` |
| 具体的 | `@Claude acme/web で、セッションの期限切れの後にログインが失敗する不具合を直して。再現するテストを追加し、pnpm test が通ったらプルリクエストを作って` |

エージェントの成果物は、確認してから使用する。

## 5 ブリッジによる対話の中継

### 5.1 構成

ブリッジは、Slackアプリとエージェントの間でメッセージを中継する常駐プロセスである。ブリッジは次の処理を行う。

1. Slackからメッセージを受け取る。
2. メッセージを、非対話モードのエージェントへ渡す。Claude Codeは `claude -p`、Codexは `codex exec` を使用する。
3. エージェントの応答を、元のメッセージのスレッドへ返信する。

Slackと双方向に対話する場合は、ブリッジを使用する。Claude Codeのチャネルは、実行中のセッションへ外部のメッセージを届ける機能である。ただし、リサーチプレビューに含まれるチャットのプラグインはTelegram、Discord及びiMessageであり、Slackは含まれない。

### 5.2 メッセージはSocket Modeで受信する

ブリッジは、Socket Modeでイベントを受信する。Socket ModeはWebSocketでイベントを受信するため、インターネットへ公開するHTTPのエンドポイントが不要である。ブリッジは、受信したイベントごとに `envelope_id` で確認応答し、接続の切断及び再接続を処理する。

Slackアプリには、[表8](#table-8)のスコープを付与する。

<a id="table-8"></a>表8−Slackアプリのスコープ

| トークン | スコープ | 用途 |
| --- | --- | --- |
| アプリレベルトークン | `connections:write` | Socket Modeの接続によるイベントの受信。 |
| ボットトークン | `chat:write` | スレッドへの返信。 |
| ボットトークン | `app_mentions:read` | メンションの受信。メンション以外も受け取る場合は、`channels:history` 又は `groups:history` を加える。 |

スコープに加えて、Event Subscriptionsで受信するイベントを登録する。メンションには、`app_mention` を登録する。スレッドへの返信などメンションのないメッセージには、公開チャンネルでは `message.channels` を、非公開チャンネルでは `message.groups` を登録する。

### 5.3 スレッドとセッションとを対応させる

Slackのスレッド一つに、エージェントのセッション一つを対応させる。スレッドの最初のメッセージで新しいセッションを開始し、セッションIDとスレッドの識別子との対応をファイルへ保存する。同じスレッドへの返信は、そのセッションを再開して渡す。

スレッドの識別子には、チャンネルIDと、次のいずれかの値とを組み合わせて使用する（例：`C024BE91L:1730700000.000100`）。複数のワークスペースを扱う場合は、ワークスペースIDも加える。

- スレッドへの返信では、メッセージの `thread_ts`

- スレッドの最初のメッセージでは、そのメッセージの `ts`

`ts` はチャンネルの中でだけ一意であるため、チャンネルIDを含めないと、別のチャンネルの会話を同じセッションへ渡す。スレッドへの返信の `thread_ts` は、最初のメッセージの `ts` と一致する。

ツールごとのセッションの操作は、[表9](#table-9)による。

<a id="table-9"></a>表9−ツールごとのセッションの操作

| ツール | 新しいセッション | セッションの再開 | セッションIDの取得 |
| --- | --- | --- | --- |
| Claude Code | `claude -p --session-id <UUID> "<本文>"` | `claude -p --resume <UUID> "<本文>"` | ブリッジがUUIDを生成して渡す。 |
| Codex | `codex exec --json "<本文>"` | `codex exec resume <スレッドID> "<本文>"` | `--json` の出力の `thread.started` イベントの `thread_id`。 |

同じセッションでは、エージェントを同時に二つ実行しない。実行中のスレッドに届いたメッセージは、待ち行列に入れ、実行の完了後に渡す。

ブリッジからCodexを起動する場合は、標準入力を閉じる。`codex exec` は、プロンプトの引数とともに標準入力をパイプで渡すと、標準入力の内容を追加の文脈として読むためである。

### 5.4 ボットのメッセージを無視する

ブリッジは、ボット自身及び他のボットのメッセージを無視し、応答が次の指示になる繰返しを防ぐ。スレッドの他の発言を文脈として渡す場合は、発言者を明記する。

### 5.5 応答の返し方

メッセージを受信したら、直ちに受付をスレッドへ返信し、エージェントの実行の完了後に結果を返信する。エージェントの実行には数分から数時間かかる場合があるため、実行の完了まで最初の返信を遅らせない。

応答の例は、[表10](#table-10)による。

<a id="table-10"></a>表10−応答の例

| 時点 | 返信の例 |
| --- | --- |
| 受け付けた場合 | `受け付けた。完了したらここへ返信する（session 6b1e）` |
| 完了した場合 | `完了：Q3の解約理由を集計した。上位は価格（38%）、機能不足（24%）、担当者の変更（11%）。analysis/churn-q3.md` |
| 止まった場合 | `停止：20ターンの上限に達した。未確認は残り2社。続ける場合は“続けて”と返信する` |

結果は、最後の応答を4 000文字以内に要約して返信する。長い出力は、ファイルとしてアップロードするか、作業環境に保存して場所を示す。

## 6 チェックリスト

- 通知、公式連携による依頼及びブリッジによる対話の中継から、目的に合う型を選んだ。
- 通知は、確認待ち、完了、失敗などの状態の変化に限定している。

- 通知の本文に、ログ及び差分の全文を含めていない。
- 通知の送信が失敗しても、エージェントの動作が変化しないことを確認した。
- ブリッジは、ボットのメッセージを無視する。
- ブリッジは、スレッドとセッションとを対応させ、同じセッションを同時に実行しない。

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
