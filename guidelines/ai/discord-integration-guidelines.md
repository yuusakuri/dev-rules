# AIエージェントのDiscord連携ガイドライン

## 1 はじめに

### 1.1 目的

本書の目的は、Claude Code、CodexなどのAIエージェントをDiscordと連携させ、作業の通知及び実行中のエージェントとの対話を行えるようにすることである。

### 1.2 適用範囲

本書は、AIエージェントとDiscordとの連携の方法について規定する。個人の端末、サーバー又はクラウドのいずれでエージェントを実行する場合にも適用する。

---

## 2 連携の型の選び方

連携は、情報の向きと対応するツールによって、[表1](#table-1)の三つの型に分ける。目的に合う型を選び、複数の目的がある場合は型を組み合わせる。

<a id="table-1"></a>表1−連携の型

| 型 | 情報の向き | 対応するツール | 実現方法 | 適する用途 |
| --- | --- | --- | --- | --- |
| 通知 | エージェントからDiscord | Claude Code、Codex | フック又は通知用の外部プログラムから、Discordのウェブフックへ投稿する。 | 長時間の作業の完了、確認待ち、失敗を知らせる。 |
| チャネルによる対話 | 双方向 | Claude Code | 公式のDiscordプラグインが、実行中のセッションへメッセージを届け、応答を返す。 | 手元で実行しているセッションへ、外出先から指示する。 |
| ブリッジによる対話の中継 | 双方向 | Claude Code、Codex | 自作のDiscordボットが受け取ったメッセージを非対話モードのエージェントへ渡し、応答をDiscordへ返す。 | Codexと対話する。複数の人又はチャンネルから、サーバーで動くエージェントへ指示する。 |

Claude Codeだけを使用し、指示する人が自分だけの場合は、チャネルを使用し、ブリッジを作らない。ブリッジは、スレッドとセッションの対応づけ又は障害時の再開を自分で実装する必要がある。

---

## 3 通知

### 3.1 状態が変わった場合だけ送る

通知は、人の対応が必要な状態か、作業の区切りに限定する。ツールの実行ごと又は応答ごとに送ると、重要な通知が埋もれる。例えば、1 000ファイルの移行では、1ファイルごとではなく、全件の完了、失敗の発生、確認待ちの場合に送る。

通知のきっかけには、各ツールの[表2](#table-2)の機能を使用する。

<a id="table-2"></a>表2−状態ごとの通知の機能

| 状態 | Claude Code | Codex |
| --- | --- | --- |
| 確認又は入力を待っている | Notificationフック（matcherは `permission_prompt`、`idle_prompt`、`agent_needs_input` など） | PermissionRequestフック |
| 応答を返して止まった | Stopフック（入力の `last_assistant_message` に最後の応答がある） | `config.toml` の `notify`（`agent-turn-complete` のJSONが引数で渡される）、又はStopフック |
| APIのエラーでターンが終わった | StopFailureフック（matcherはエラーの種類で、`rate_limit`、`authentication_failed`、`billing_error` など） | 該当するフックはない。`codex exec` で実行する場合は、終了コードで検知する。 |
| セッションが終了した | SessionEndフック | SessionEndフック |

Stopフックを作業の継続の判断にも使用する場合は、通知の送信を別のフックとして登録し、判断の処理と分ける。

### 3.2 送信先はウェブフックにする

通知だけを送る場合は、チャンネルのウェブフックを使用する。ウェブフックはボットを作らずに投稿できる。

投稿には、`allowed_mentions` に空の `parse` を指定し、本文に含まれる `@everyone` やユーザーへのメンションで通知が飛ばないようにする。

進捗を1件の投稿で示す場合は、`wait=true` を付けて投稿し、返された投稿のIDで同じ投稿を編集する。

### 3.3 本文は概要に限定する

通知の本文には、次の事項を含める。

- 作業対象を識別する名前（プロジェクト名、作業ディレクトリ）。
- セッションを識別するID。
- 起きた事象（確認待ち、完了、失敗）。
- 最後の応答の要約。

通知の本文の例は、[表3](#table-3)による。

<a id="table-3"></a>表3−通知の本文の例

| 事象 | 本文の例 |
| --- | --- |
| 完了 | `[sales-report] 完了：10月の売上レポートを作成した。全部門の合計が会計の総額と一致。reports/2026-10.md（session 6b1e）` |
| 確認待ち | `[web] 確認待ち：pnpm add date-fns の実行の確認を待っている（session 91fa）` |
| 失敗 | `[web] 失敗：rate_limit で停止した。未完了は残り3件（session 91fa）` |

最後の応答、ログ、差分の全文は送らない。全文は長く、通知として読みにくい。Discordの投稿の本文は2 000文字までのため、要約はこの範囲に収める。詳細は、作業環境のファイル又は成果物のリンクで示す。

### 3.4 送信の失敗でエージェントを止めない

通知の処理は、短いタイムアウトで送信し、失敗した場合はエラーを記録して正常に終了する。通知の失敗でフックがエラーを返すと、エージェントの作業が止まることがある。

DiscordのAPIは、HTTP 429で頻度の制限を知らせる。429が返った場合は、応答の `retry_after` の秒数だけ待ってから再送する。

---

## 4 Claude Codeのチャネルによる対話

### 4.1 仕組み

チャネルは、MCPサーバーが実行中のClaude Codeのセッションへイベントを届ける機能である。公式のDiscordプラグインを使用すると、Discordのボットへ送ったメッセージがセッションへ届き、Claude Codeの応答がDiscordへ返る。

チャネルはリサーチプレビューであり、起動オプションと動作が変わることがある。メッセージは、セッションが動いている間だけ届く。常に受け付ける場合は、端末を閉じても止まらない常駐のプロセスでClaude Codeを実行する。

チャネルの利用条件は、[表4](#table-4)による。

<a id="table-4"></a>表4−チャネルの利用条件

| 項目 | 内容 |
| --- | --- |
| 必要なアカウント | claude.aiのアカウント又はConsoleのAPIキー。Amazon Bedrock、Google CloudのAgent Platform、Microsoft Foundryでは使用できない。 |
| 必要なもの | プラグインの実行に使用するBun。 |
| 組織の設定 | Team、Enterpriseでは、管理者が `channelsEnabled` を有効にするまで使用できない。 |
| 非対話モード | `-p` で実行する場合は、端末での入力が必要なツールが無効になる。 |

### 4.2 設定の手順

1. Discord Developer Portalでアプリケーションとボットを作成し、ボットのトークンを取得する。
2. ボットの設定で、Message Content Intentを有効にする。
3. OAuth2のURL Generatorで `bot` スコープと、View Channels、Send Messages、Send Messages in Threads、Read Message History、Attach Files、Add Reactionsの権限を選び、ボットをサーバーへ招待する。
4. Claude Codeで `discord@claude-plugins-official` プラグインをインストールし、ボットのトークンを設定する。
5. `--channels plugin:discord@claude-plugins-official` を付けてClaude Codeを起動する。
6. ボットへDMを送り、返されたペアリングのコードをClaude Codeで承認する。

---

## 5 ブリッジによる対話の中継

### 5.1 構成

ブリッジは、Discordのボットとエージェントの間でメッセージを中継する常駐プロセスである。ブリッジは次の処理を行う。

1. Discordからメッセージを受け取る。
2. メッセージを、非対話モードのエージェントへ渡す。Claude Codeは `claude -p`、Codexは `codex exec` を使用する。
3. エージェントの応答を、元のメッセージへの返信又はスレッドへ投稿する。

### 5.2 メンションとDMだけを受け付ける

ブリッジは、ボットへのメンションとDMだけを指示として受け付ける。Message Content Intentは特権インテントであり、有効にしないと他人のメッセージの本文が空で届くが、ボットへのメンションとDMの本文は届く。この範囲に限定すると、特権インテントを有効にせずに済み、指示の入口も明確になる。

メッセージは、Gatewayに接続して受け取る。受け取る頻度が低い場合は、チャンネルのメッセージの取得APIを `after` で定期的に呼ぶ方法でもよい。

ボットには、[表5](#table-5)の権限を付与する。

<a id="table-5"></a>表5−ボットの権限

| 権限 | 用途 |
| --- | --- |
| View Channels | チャンネルのメッセージの受信。 |
| Read Message History | 取得APIによるメッセージの取得。この権限がないとメッセージが返らない。 |
| Send Messages<br>Send Messages in Threads | 応答の投稿。 |
| Create Public Threads | セッションごとのスレッドを作る場合。 |
| Attach Files | 長い結果をファイルとして添付する場合。 |

### 5.3 スレッドとセッションを対応させる

サーバーのチャンネルでは、Discordのスレッド一つに、エージェントのセッション一つを対応させる。最初の指示のメッセージからスレッドを作って新しいセッションを開始し、セッションIDとスレッドのIDの対応をファイルへ保存する。同じスレッドへの投稿は、そのセッションを再開して渡す。

DMにはスレッドを作れない。DMでは、DMのチャンネルのIDとセッションIDの対応を保存し、同じDMへの投稿をそのセッションへ渡す。新しいセッションを始める指示（`new` など）を決め、受け取った場合に対応を作り直す。

ツールごとのセッションの操作は、[表6](#table-6)による。

<a id="table-6"></a>表6−ツールごとのセッションの操作

| ツール | 新しいセッション | セッションの再開 | セッションIDの取得 |
| --- | --- | --- | --- |
| Claude Code | `claude -p --session-id <UUID> "<本文>"` | `claude -p --resume <UUID> "<本文>"` | ブリッジがUUIDを生成して渡す。 |
| Codex | `codex exec --json "<本文>"` | `codex exec resume <スレッドID> "<本文>"` | `--json` の出力の `thread.started` イベントの `thread_id`。 |

同じセッションでは、エージェントを同時に二つ実行しない。実行中のスレッドに届いたメッセージは、待ち行列に入れ、実行が終わってから渡す。Codexは標準入力からも指示を読むため、標準入力を閉じて起動する。

### 5.4 ボットのメッセージを無視する

ブリッジは、ボット自身と他のボットのメッセージを無視し、応答が次の指示になる繰り返しを防ぐ。スレッドの他の発言を文脈として渡す場合は、発言者を明記する。

### 5.5 応答の返し方

メッセージを受け取ったら、すぐに受け付けたことを返信し、エージェントの実行が終わってから結果を投稿する。エージェントの実行には数分から数時間かかるため、結果を待ってから最初の返信をしない。

応答の例は、[表7](#table-7)による。

<a id="table-7"></a>表7−応答の例

| 時点 | 返信の例 |
| --- | --- |
| 受け付けた場合 | `受け付けた。完了したらここへ返信する（session 6b1e）` |
| 完了した場合 | `完了：Q3の解約理由を集計した。上位は価格（38%）、機能不足（24%）、担当者の変更（11%）。analysis/churn-q3.md` |
| 止まった場合 | `停止：20ターンの上限に達した。未確認は残り2社。続ける場合は“続けて”と返信する` |

結果は、最後の応答を2 000文字以内に要約して投稿する。長い出力は、ファイルとして添付するか、作業環境に保存して場所を示す。投稿には `allowed_mentions` に空の `parse` を指定し、エージェントの出力でメンションの通知が飛ばないようにする。

---

## 6 チェックリスト

- 通知、チャネルによる対話、ブリッジによる対話の中継から、目的と使用するツールに合う型を選んだ。
- 通知は、確認待ち、完了、失敗などの状態の変化に限定し、本文にログ又は差分の全文を含めていない。
- 通知と応答の投稿で、`allowed_mentions` によりメンションの通知を抑止している。
- 通知の送信の失敗で、エージェントが止まらないことを確認した。
- ブリッジは、メンションとDMだけを指示として扱い、ボットのメッセージを無視する。
- ブリッジは、スレッド又はDMとセッションを対応させ、同じセッションを同時に実行しない。

---

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章 | [Hooks リファレンス - Claude Code Docs](https://code.claude.com/docs/ja/hooks) | Claude CodeのNotification、Stop、StopFailure、SessionEndの各フックのきっかけと入力を定義する。 |
| 3章 | [Advanced Configuration \| ChatGPT Learn](https://learn.chatgpt.com/docs/config-file/config-advanced) | Codexの `notify` の設定と、`agent-turn-complete` のJSONの項目を定義する。 |
| 3章 | [Hooks \| ChatGPT Learn](https://learn.chatgpt.com/docs/hooks) | CodexのPermissionRequest、Stop、SessionEndを含むフックのイベントを定義する。 |
| 3章 | [Webhook Resource - Documentation - Discord](https://docs.discord.com/developers/resources/webhook) | ウェブフックによる投稿、`wait` による投稿の取得、投稿の編集、本文の長さ、`allowed_mentions` を定義する。 |
| 3章 | [Rate Limits - Documentation - Discord](https://docs.discord.com/developers/topics/rate-limits) | 頻度の制限と、HTTP 429の応答を定義する。 |
| 4章 | [チャネルを使用して実行中のセッションにイベントをプッシュする - Claude Code Docs](https://code.claude.com/docs/ja/channels) | チャネルの仕組み、Discordプラグインの設定、組織の設定、リサーチプレビューの制約を示す。 |
| 5章 | [Gateway - Documentation - Discord](https://docs.discord.com/developers/events/gateway) | Gatewayの接続と、Message Content Intentの対象と例外を定義する。 |
| 5章 | [Message Resource - Documentation - Discord](https://docs.discord.com/developers/resources/message) | メッセージの取得と投稿のAPI、必要な権限、本文の長さ、`allowed_mentions` を定義する。 |
| 5章 | [Claude Code をプログラムで実行する - Claude Code Docs](https://code.claude.com/docs/ja/headless) | Claude Codeの非対話モードでの実行とセッションの再開を示す。 |
| 5章 | [Non-interactive mode \| ChatGPT Learn](https://learn.chatgpt.com/docs/non-interactive-mode) | `codex exec` の出力形式とセッションの再開を定義する。 |
