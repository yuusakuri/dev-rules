# AIエージェントのSlack連携ガイドライン

## 目次

1. [概要](#1-概要)
2. [連携の型の選び方](#2-連携の型の選び方)
3. [通知](#3-通知)
4. [公式連携による依頼](#4-公式連携による依頼)
5. [ブリッジによる対話の中継](#5-ブリッジによる対話の中継)
6. [チェックリスト](#6-チェックリスト)
7. [参考文献](#7-参考文献)

---

## 1. 概要

本書は、Claude CodeやCodexなどのAIエージェントをSlackと連携させ、作業の通知、作業の依頼、実行中のエージェントとの対話を行う方法を定義する。

本書は、個人の端末、サーバー、クラウドのいずれでエージェントを動かす場合にも適用する。連携の型ごとに、Claude CodeとCodexのそれぞれで使う機能を示す。

---

## 2. 連携の型の選び方

連携は、情報の向きとエージェントの実行場所によって、次の3つの型に分ける。目的に合う型を選び、複数の目的がある場合は型を組み合わせる。

| 型 | 情報の向き | エージェントの実行場所 | 実現方法 | 適する用途 |
| --- | --- | --- | --- | --- |
| 通知 | エージェントからSlack | 任意 | フックまたは通知用の外部プログラムから、Slackへ投稿する。 | 長時間の作業の完了、確認待ち、失敗を知らせる。 |
| 公式連携による依頼 | Slackからエージェント | 各ツールのクラウド | Slackでエージェントのアプリへメンションし、クラウドのセッションまたはタスクを起動する。 | GitHubのリポジトリに対する、独立した作業を依頼する。 |
| ブリッジによる対話の中継 | 双方向 | 端末、サーバー | 自作のSlackアプリが受け取ったメッセージを非対話モードのエージェントへ渡し、応答をSlackへ返す。 | 手元のファイル、社内ネットワーク、専用の実行環境が必要な作業を、Slackから指示する。 |

公式連携で足りる場合は、ブリッジを作らない。ブリッジは、スレッドとセッションの対応づけや障害時の再開を自分で実装する必要がある。

---

## 3. 通知

### 状態が変わった時だけ送る

通知は、人の対応が必要な状態か、作業の区切りに限定する。ツールの実行ごとや応答ごとに送ると、重要な通知が埋もれる。たとえば、1,000ファイルの移行では、1ファイルごとではなく、全件の完了、失敗の発生、確認待ちの時に送る。

通知のきっかけには、各ツールの次の機能を使う。

| 状態 | Claude Code | Codex |
| --- | --- | --- |
| 確認や入力を待っている | Notificationフック（matcherは `permission_prompt`、`idle_prompt`、`agent_needs_input` など） | PermissionRequestフック |
| 応答を返して止まった | Stopフック（入力の `last_assistant_message` に最後の応答がある） | `config.toml` の `notify`（`agent-turn-complete` のJSONが引数で渡される）、またはStopフック |
| APIのエラーでターンが終わった | StopFailureフック（matcherはエラーの種類で、`rate_limit`、`authentication_failed`、`billing_error` など） | 該当するフックはない。`codex exec` で動かす場合は、終了コードで検知する。 |
| セッションが終了した | SessionEndフック | SessionEndフック |

Stopフックを作業の継続の判断にも使う場合は、通知の送信を別のフックとして登録し、判断の処理と分ける。

### 送信先はIncoming Webhookを基本にする

通知だけを送る場合は、SlackアプリのIncoming Webhookを使う。Incoming WebhookのURLは、1つのチャンネルに結び付く。

スレッドへの返信や複数のチャンネルへの投稿が必要な場合は、ボットトークンと `chat.postMessage` を使う。この場合は、`chat:write` のスコープを付与し、アプリを投稿先のチャンネルへ招待する。

進捗を1件の投稿で示す場合は、`chat.postMessage` の応答のチャンネルと `ts` を保存し、`chat.update` で同じ投稿を更新する。`chat.postMessage` を繰り返すと、新しい投稿が増える。

### 本文は概要に限定する

通知の本文には、次の事項を含める。

- 作業対象を識別する名前（プロジェクト名、作業ディレクトリ）。
- セッションを識別するID。
- 起きた事象（確認待ち、完了、失敗）。
- 最後の応答の要約。

| 事象 | 本文の例 |
| --- | --- |
| 完了 | `[sales-report] 完了：10月の売上レポートを作成した。全部門の合計が会計の総額と一致。reports/2026-10.md（session 6b1e）` |
| 確認待ち | `[web] 確認待ち：pnpm add date-fns の実行の確認を待っている（session 91fa）` |
| 失敗 | `[web] 失敗：rate_limit で停止した。未完了は残り3件（session 91fa）` |

最後の応答、ログ、差分の全文は送らない。全文は長く、通知として読みにくい。Slackは1回の投稿を4,000文字以内にすることを推奨しているため、要約はこの範囲に収める。詳細は、作業環境のファイルや成果物のリンクで示す。

### 送信の失敗でエージェントを止めない

通知の処理は、短いタイムアウトで送信し、失敗した場合はエラーを記録して正常に終了する。通知の失敗でフックがエラーを返すと、エージェントの作業が止まることがある。

Slackの投稿は、1つのチャンネルにつき毎秒1件を目安に制限される。HTTP 429が返った場合は、`Retry-After` ヘッダーの秒数だけ待ってから再送する。

---

## 4. 公式連携による依頼

### Claude Code

Claude Code in Slackでは、チャンネルで `@Claude` にメンションして作業を依頼すると、Claude Codeのクラウドセッションが起動する。進捗と結果はスレッドへ返信され、結果からプルリクエストを作成できる。

| 項目 | 内容 |
| --- | --- |
| 利用できるプラン | Pro、Max、Ultra。Team、EnterpriseではClaude Tagを使う。 |
| 前提 | Slackのワークスペースが、どの組織のClaude Tagにも接続されていない。接続されているワークスペースでは、個人のプランでも使えない。クラウドセッションが有効で、claude.aiにGitHubのリポジトリを接続している。SlackのアカウントをClaudeのアカウントに接続している。 |
| 使える場所 | アプリを招待した公開チャンネルと非公開チャンネル。DMでは使えない。 |
| ルーティング | Code onlyは全てのメンションを作業として扱い、Code + Chatは作業か質問かを判定する。 |
| 制限 | リポジトリはGitHubに限る。1つのセッションで作成できるプルリクエストは1つである。 |

### Codex

Slackのアプリ（`@ChatGPT`）にメンションして作業を依頼すると、Codex Cloudのタスクが起動し、結果がスレッドへ返信される。

| 項目 | 内容 |
| --- | --- |
| 前提 | ChatGPTのワークスペースの管理者が、Slack連携とCodex Cloudを有効にしている。作業に使うクラウド環境を、ワークスペースで共有している。 |
| 使える場所 | 有効にした公開チャンネルと非公開チャンネル。Slack Connectのチャンネルでは使えない。 |
| 環境の選択 | ワークスペースで共有したクラウド環境から選ばれる。個人のクラウド環境は選ばれない。 |

### 依頼の規則

- 依頼には、対象、期待する結果、完了の条件を書く。長いスレッドでは、最新の依頼に要点をまとめ直す。

| 依頼の良否 | 例 |
| --- | --- |
| 曖昧 | `@Claude ログインの不具合を見て` |
| 具体的 | `@Claude acme/web で、セッションの期限切れの後にログインが失敗する不具合を直して。再現するテストを追加し、pnpm test が通ったらプルリクエストを作って` |

- エージェントの成果物は、確認してから使う。

---

## 5. ブリッジによる対話の中継

### 構成

ブリッジは、Slackアプリとエージェントの間でメッセージを中継する常駐プロセスである。ブリッジは次の処理を行う。

1. Slackからメッセージを受け取る。
2. メッセージを、非対話モードのエージェントへ渡す。Claude Codeは `claude -p`、Codexは `codex exec` を使う。
3. エージェントの応答を、元のメッセージのスレッドへ返信する。

Claude Codeのchannels機能は、実行中のセッションへ外部のメッセージを届けるが、研究プレビューに含まれるチャットのプラグインはTelegram、Discord、iMessageである。Slackと双方向に対話する場合は、ブリッジを使う。

### メッセージはSocket Modeで受け取る

ブリッジは、Socket Modeでイベントを受け取る。Socket Modeは、WebSocketでイベントを受け取るため、インターネットへ公開するHTTPのエンドポイントが要らない。受け取ったイベントは `envelope_id` で一つずつ確認応答し、接続の切断と再接続を処理する。

Slackアプリには、次のスコープを付与する。

| トークン | スコープ | 用途 |
| --- | --- | --- |
| アプリレベルトークン | Socket Modeの接続 | イベントの受信。 |
| ボットトークン | `chat:write` | スレッドへの返信。 |
| ボットトークン | `app_mentions:read` | メンションの受信。メンション以外も受け取る場合は、`channels:history` または `groups:history` を加える。 |

スコープに加えて、Event Subscriptionsで受け取るイベントを登録する。メンションは `app_mention`、スレッドへの返信などメンションのないメッセージは、公開チャンネルなら `message.channels`、非公開チャンネルなら `message.groups` を登録する。

### スレッドとセッションを対応させる

Slackのスレッド1つに、エージェントのセッション1つを対応させる。スレッドの最初のメッセージで新しいセッションを開始し、セッションIDとスレッドの識別子の対応をファイルへ保存する。スレッドの識別子には、チャンネルIDと、メッセージに `thread_ts` があればその値を、なければ最初のメッセージ自身の `ts` を組み合わせて使う（例：`C024BE91L:1730700000.000100`）。`ts` はチャンネルの中でだけ一意であり、チャンネルIDがないと別のチャンネルの会話を同じセッションへ渡してしまう。複数のワークスペースを扱う場合は、ワークスペースIDも加える。スレッドへの返信の `thread_ts` は、最初のメッセージの `ts` と一致する。同じスレッドへの返信は、そのセッションを再開して渡す。

| ツール | 新しいセッション | セッションの再開 | セッションIDの取得 |
| --- | --- | --- | --- |
| Claude Code | `claude -p --session-id <UUID> "<本文>"` | `claude -p --resume <UUID> "<本文>"` | ブリッジがUUIDを生成して渡す。 |
| Codex | `codex exec --json "<本文>"` | `codex exec resume <スレッドID> "<本文>"` | `--json` の出力の `thread.started` イベントの `thread_id`。 |

同じセッションでは、エージェントを同時に2つ実行しない。実行中のスレッドに届いたメッセージは、待ち行列に入れ、実行が終わってから渡す。Codexは標準入力からも指示を読むため、標準入力を閉じて起動する。

### ボットのメッセージを無視する

ブリッジは、ボット自身と他のボットのメッセージを無視し、応答が次の指示になる繰り返しを防ぐ。スレッドの他の発言を文脈として渡す場合は、発言者を明記する。

### 応答の返し方

メッセージを受け取ったら、すぐに受け付けたことをスレッドへ返信し、エージェントの実行が終わってから結果を返信する。エージェントの実行には数分から数時間かかるため、結果を待ってから最初の返信をしない。

| 時点 | 返信の例 |
| --- | --- |
| 受け付けた時 | `受け付けた。完了したらここへ返信する（session 6b1e）` |
| 完了した時 | `完了：Q3の解約理由を集計した。上位は価格（38%）、機能不足（24%）、担当者の変更（11%）。analysis/churn-q3.md` |
| 止まった時 | `停止：20ターンの上限に達した。未確認は残り2社。続ける場合は「続けて」と返信する` |

結果は、最後の応答を4,000文字以内に要約して返信する。長い出力は、ファイルとしてアップロードするか、作業環境に保存して場所を示す。

---

## 6. チェックリスト

- 通知、公式連携による依頼、ブリッジによる対話の中継から、目的に合う型を選んだ。
- 通知は、確認待ち、完了、失敗などの状態の変化に限定し、本文にログや差分の全文を含めていない。
- 通知の送信の失敗で、エージェントが止まらないことを確かめた。
- ブリッジは、ボットのメッセージを無視する。
- ブリッジは、スレッドとセッションを対応させ、同じセッションを同時に実行しない。

---

## 7. 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3. 通知 | [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks) | Claude CodeのNotification、Stop、StopFailure、SessionEndの各フックのきっかけと入力を定義する。 |
| 3. 通知 | [Advanced Configuration \| ChatGPT Learn](https://learn.chatgpt.com/docs/config-file/config-advanced) | Codexの `notify` の設定と、`agent-turn-complete` のJSONの項目を定義する。 |
| 3. 通知 | [Hooks \| ChatGPT Learn](https://learn.chatgpt.com/docs/hooks) | CodexのPermissionRequest、Stop、SessionEndを含むフックのイベントを定義する。 |
| 3. 通知 | [Sending messages using incoming webhooks \| Slack Developer Docs](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks) | Incoming Webhookの作成方法と送信形式を示す。 |
| 3. 通知<br>5. ブリッジによる対話の中継 | [chat.postMessage method \| Slack Developer Docs](https://docs.slack.dev/reference/methods/chat.postMessage) | 投稿に必要なスコープ、スレッドへの返信、本文の長さの推奨値を定義する。 |
| 3. 通知 | [chat.update method \| Slack Developer Docs](https://docs.slack.dev/reference/methods/chat.update) | チャンネルと `ts` で指定した投稿を更新する方法を定義する。 |
| 5. ブリッジによる対話の中継 | [message event \| Slack Developer Docs](https://docs.slack.dev/reference/events/message) | メッセージのイベントと、受け取るために登録するイベントの種類を定義する。 |
| 3. 通知 | [Rate limits \| Slack Developer Docs](https://docs.slack.dev/apis/web-api/rate-limits) | 投稿の頻度の制限と、HTTP 429の `Retry-After` ヘッダーを定義する。 |
| 4. 公式連携による依頼 | [Claude Code in Slack - Claude Code Docs](https://code.claude.com/docs/en/slack) | Claude Code in Slackの前提、設定、ルーティング、アクセスの制御、制限を示す。 |
| 4. 公式連携による依頼 | [Work with Claude Tag - Claude.ai Documentation](https://claude.com/docs/claude-tag/overview) | Team、Enterpriseのプランで使う、組織が管理するSlackの `@Claude` を示す。 |
| 4. 公式連携による依頼 | [Use ChatGPT in Slack \| ChatGPT Learn](https://learn.chatgpt.com/docs/third-party/slack) | SlackからCodex Cloudのタスクを起動する前提、使い方、返信の公開範囲、制限を示す。 |
| 5. ブリッジによる対話の中継 | [Push events into a running session with channels - Claude Code Docs](https://code.claude.com/docs/en/channels) | Claude Codeのchannels機能と、研究プレビューに含まれるチャットのプラグインを示す。 |
| 5. ブリッジによる対話の中継 | [Using Socket Mode \| Slack Developer Docs](https://docs.slack.dev/apis/events-api/using-socket-mode) | WebSocketによるイベントの受信、確認応答、再接続を定義する。 |
| 5. ブリッジによる対話の中継 | [Run Claude Code programmatically - Claude Code Docs](https://code.claude.com/docs/en/headless) | Claude Codeの非対話モードでの実行とセッションの再開を示す。 |
| 5. ブリッジによる対話の中継 | [Non-interactive mode \| ChatGPT Learn](https://learn.chatgpt.com/docs/non-interactive-mode) | `codex exec` の出力形式とセッションの再開を定義する。 |
