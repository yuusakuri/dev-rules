# コーディングエージェントのDiscord連携ガイドライン

## 目次

1. [概要](#1-概要)
2. [連携の型の選び方](#2-連携の型の選び方)
3. [通知](#3-通知)
4. [Claude Codeのchannelsによる対話](#4-claude-codeのchannelsによる対話)
5. [ブリッジによる対話の中継](#5-ブリッジによる対話の中継)
6. [秘密情報と権限](#6-秘密情報と権限)
7. [チェックリスト](#7-チェックリスト)
8. [参考文献](#8-参考文献)

---

## 1. 概要

本書は、Claude CodeとCodexなどのコーディングエージェントをDiscordと連携させ、作業の通知と、実行中のエージェントとの対話を行う方法を定義する。

本書は、個人の端末、サーバー、クラウドのいずれでエージェントを動かす場合にも適用する。連携の型ごとに、Claude CodeとCodexのそれぞれで使う機能を示す。

---

## 2. 連携の型の選び方

連携は、情報の向きと対応するツールによって、次の3つの型に分ける。目的に合う型を選び、複数の目的がある場合は型を組み合わせる。

| 型 | 情報の向き | 対応するツール | 実現方法 | 適する用途 |
| --- | --- | --- | --- | --- |
| 通知 | エージェントからDiscord | Claude Code、Codex | フックまたは通知用の外部プログラムから、Discordのウェブフックへ投稿する。 | 長時間の作業の完了、確認待ち、失敗を知らせる。 |
| channelsによる対話 | 双方向 | Claude Code | 公式のDiscordプラグインが、実行中のセッションへメッセージを届け、応答を返す。 | 手元で動かしているセッションへ、外出先から指示する。 |
| ブリッジによる対話の中継 | 双方向 | Claude Code、Codex | 自作のDiscordボットが受け取ったメッセージを非対話モードのエージェントへ渡し、応答をDiscordへ返す。 | Codexと対話する。複数の人やチャンネルから、サーバーで動くエージェントへ指示する。 |

Claude Codeだけを使い、指示する人が自分だけの場合は、channelsを使い、ブリッジを作らない。ブリッジは、認証情報の管理、権限の制御、障害時の再開を自分で実装する必要がある。

---

## 3. 通知

### 状態が変わった時だけ送る

通知は、人の対応が必要な状態か、作業の区切りに限定する。ツールの実行ごとや応答ごとに送ると、重要な通知が埋もれる。

通知のきっかけには、各ツールの次の機能を使う。

| 状態 | Claude Code | Codex |
| --- | --- | --- |
| 権限の確認や入力を待っている | Notificationフック（matcherは `permission_prompt`、`idle_prompt`、`agent_needs_input` など） | PermissionRequestフック |
| 応答を返して止まった | Stopフック（入力の `last_assistant_message` に最後の応答がある） | `config.toml` の `notify`（`agent-turn-complete` のJSONが引数で渡される）、またはStopフック |
| APIのエラーでターンが終わった | StopFailureフック（matcherはエラーの種類で、`rate_limit`、`authentication_failed`、`billing_error` など） | 該当するフックはない。`codex exec` で動かす場合は、終了コードで検知する。 |
| セッションが終了した | SessionEndフック | SessionEndフック |

Stopフックを作業の継続の判断にも使う場合は、通知の送信を別のフックとして登録し、判断の処理と分ける。

### 送信先はウェブフックにする

通知だけを送る場合は、チャンネルのウェブフックを使う。ウェブフックはボットを作らずに投稿でき、URLに含まれるトークンで認証する。ウェブフックのURLは、知っていれば誰でも投稿できる秘密情報として扱う。

投稿には、`allowed_mentions` に空の `parse` を指定し、本文に含まれる `@everyone` やユーザーへのメンションで通知が飛ばないようにする。

進捗を1件の投稿で示す場合は、`wait=true` を付けて投稿し、返された投稿のIDで同じ投稿を編集する。

### 本文は概要に限定する

通知の本文には、次の事項を含める。

- 作業対象を識別する名前（リポジトリ名、作業ディレクトリ）。
- セッションを識別するID。
- 起きた事象（確認待ち、完了、失敗）。
- 最後の応答の要約。

最後の応答、ログ、差分の全文は送らない。これらにはコード、環境変数、認証情報が含まれることがある。Discordの投稿の本文は2,000文字までのため、要約はこの範囲に収める。詳細は、作業環境のファイルやプルリクエストのリンクで示す。

### 送信の失敗でエージェントを止めない

通知の処理は、短いタイムアウトで送信し、失敗した場合はエラーを記録して正常に終了する。通知の失敗でフックがエラーを返すと、エージェントの作業が止まることがある。

DiscordのAPIは、HTTP 429で頻度の制限を知らせる。429が返った場合は、応答の `retry_after` の秒数だけ待ってから再送する。

---

## 4. Claude Codeのchannelsによる対話

### 仕組み

channelsは、MCPサーバーが実行中のClaude Codeのセッションへイベントを届ける機能である。公式のDiscordプラグインを使うと、Discordのボットへ送ったメッセージがセッションへ届き、Claude Codeの応答がDiscordへ返る。

channelsは研究プレビューであり、起動オプションと動作が変わることがある。メッセージは、セッションが動いている間だけ届く。常に受け付ける場合は、端末を閉じても止まらない常駐のプロセスでClaude Codeを動かす。

| 項目 | 内容 |
| --- | --- |
| 認証 | claude.aiのアカウントまたはConsoleのAPIキー。Amazon Bedrock、Google CloudのAgent Platform、Microsoft Foundryでは使えない。 |
| 必要なもの | プラグインの実行に使うBun。 |
| 組織の設定 | Team、Enterpriseでは、管理者が `channelsEnabled` を有効にするまで使えない。 |
| 非対話モード | `-p` で動かす場合は、端末での入力が必要なツールが無効になる。 |

### 設定の手順

1. Discord Developer Portalでアプリケーションとボットを作成し、ボットのトークンを取得する。
2. ボットの設定で、Message Content Intentを有効にする。
3. OAuth2のURL Generatorで `bot` スコープと、View Channels、Send Messages、Send Messages in Threads、Read Message History、Attach Files、Add Reactionsの権限を選び、ボットをサーバーへ招待する。
4. Claude Codeで `discord@claude-plugins-official` プラグインをインストールし、ボットのトークンを設定する。
5. `--channels plugin:discord@claude-plugins-official` を付けてClaude Codeを起動する。
6. ボットへDMを送り、返されたペアリングのコードをClaude Codeで承認する。
7. アクセスの方針を許可リストに切り替え、ペアリングしたアカウント以外のメッセージを受け付けないようにする。

### 規則

- 許可リストには、セッションの権限で実行できる操作を任せてよい人だけを加える。権限の確認をDiscordへ転送する場合は、許可リストの人がツールの実行を承認できる。
- 権限の確認を省略して起動する場合は、作業者の個人の環境ではなく、隔離した環境で動かす。
- Discordへ返る応答は、チャンネルやDMの相手が読める。秘密情報を含む作業結果を応答させない。

---

## 5. ブリッジによる対話の中継

### 構成

ブリッジは、Discordのボットとエージェントの間でメッセージを中継する常駐プロセスである。ブリッジは次の処理を行う。

1. Discordから、許可したユーザーのメッセージを受け取る。
2. メッセージを、非対話モードのエージェントへ渡す。Claude Codeは `claude -p`、Codexは `codex exec` を使う。
3. エージェントの応答を、元のメッセージへの返信またはスレッドへ投稿する。

### メンションとDMだけを受け付ける

ブリッジは、ボットへのメンションとDMだけを指示として受け付ける。Message Content Intentは特権インテントであり、有効にしないと他人のメッセージの本文が空で届くが、ボットへのメンションとDMの本文は届く。この範囲に限定すると、特権インテントを有効にせずに済み、指示の入口も明確になる。

メッセージは、Gatewayに接続して受け取る。受け取る頻度が低い場合は、チャンネルのメッセージの取得APIを `after` で定期的に呼ぶ方法でもよい。

ボットには、次の権限を付与する。

| 権限 | 用途 |
| --- | --- |
| View Channels | チャンネルのメッセージの受信。 |
| Read Message History | 取得APIによるメッセージの取得。この権限がないとメッセージが返らない。 |
| Send Messages<br>Send Messages in Threads | 応答の投稿。 |
| Create Public Threads | セッションごとのスレッドを作る場合。 |
| Attach Files | 長い結果をファイルとして添付する場合。 |

### スレッドとセッションを対応させる

サーバーのチャンネルでは、Discordのスレッド1つに、エージェントのセッション1つを対応させる。最初の指示のメッセージからスレッドを作って新しいセッションを開始し、セッションIDとスレッドのIDの対応をファイルへ保存する。同じスレッドへの投稿は、そのセッションを再開して渡す。

DMにはスレッドを作れない。DMでは、DMのチャンネルのIDとセッションIDの対応を保存し、同じDMへの投稿をそのセッションへ渡す。新しいセッションを始める指示（`new` など）を決め、受け取った時に対応を作り直す。

| ツール | 新しいセッション | セッションの再開 | セッションIDの取得 |
| --- | --- | --- | --- |
| Claude Code | `claude -p --session-id <UUID> "<本文>"` | `claude -p --resume <UUID> "<本文>"` | ブリッジがUUIDを生成して渡す。 |
| Codex | `codex exec --json "<本文>"` | `codex exec resume <スレッドID> "<本文>"` | `--json` の出力の `thread.started` イベントの `thread_id`。 |

同じセッションでは、エージェントを同時に2つ実行しない。実行中のスレッドに届いたメッセージは、待ち行列に入れ、実行が終わってから渡す。Codexは標準入力からも指示を読むため、標準入力を閉じて起動する。

### 送信者を限定する

ブリッジは、許可したユーザーIDのメッセージだけを指示として扱い、他のメッセージは無視する。ボット自身と他のボットのメッセージも無視し、応答が次の指示になる繰り返しを防ぐ。

エージェントへ渡すのは、許可したユーザーのメッセージの本文だけとする。スレッドの他の発言を文脈として渡す場合は、発言者を明記し、指示ではなく資料であることを本文で示す。

### 応答の返し方

メッセージを受け取ったら、すぐに受け付けたことを返信し、エージェントの実行が終わってから結果を投稿する。エージェントの実行には数分から数時間かかるため、結果を待ってから最初の返信をしない。

結果は、最後の応答を2,000文字以内に要約して投稿する。長い出力は、ファイルとして添付するか、作業環境に保存して場所を示す。投稿には `allowed_mentions` に空の `parse` を指定し、エージェントの出力でメンションの通知が飛ばないようにする。

---

## 6. 秘密情報と権限

### トークンをエージェントへ渡さない

ウェブフックのURLとボットのトークンは、リポジトリにコミットしない。ユーザーの設定ファイルまたは秘密情報の管理機能から読み込む。

ブリッジは、エージェントを起動する時に、Discordのトークンを含む環境変数を引き継がない。エージェントがトークンを読めると、ブリッジの許可を経ずにDiscordへ投稿できる。ブリッジとエージェントは、可能であれば別のOSユーザーで実行する。

トークンが漏れた場合は、Discord Developer Portalでボットのトークンを再発行するか、ウェブフックを削除して作り直す。

### エージェントの権限を作業に合わせて限定する

ブリッジから起動したエージェントは、権限の確認に応答する人がいない。次のいずれかで、確認なしに実行できる操作を限定する。

- Claude Codeは、権限の設定で許可するツールとコマンドを列挙する。Codexは、サンドボックスを `workspace-write` にして、書き込みを作業ディレクトリに限定する。
- 権限の確認を全て省略する場合は、使い捨ての仮想マシンまたはコンテナで実行する。

Discordでボットへ指示を送れる人は、ブリッジを経由してエージェントの操作を指示できる。許可するユーザーは、エージェントの権限で実行できる操作を任せてよい人に限定する。ボットを招待するサーバーは、参加者を管理できるサーバーに限る。

---

## 7. チェックリスト

- 通知、channelsによる対話、ブリッジによる対話の中継から、目的と使うツールに合う型を選んだ。
- 通知は、確認待ち、完了、失敗などの状態の変化に限定し、本文にログや差分の全文を含めていない。
- 通知と応答の投稿で、`allowed_mentions` によりメンションの通知を抑止している。
- 通知の送信の失敗で、エージェントが止まらないことを確かめた。
- channelsを使う場合は、アクセスの方針を許可リストにし、信頼できる人だけを加えた。
- ブリッジは、許可したユーザーIDのメンションとDMだけを指示として扱い、ボットのメッセージを無視する。
- ブリッジは、スレッドまたはDMとセッションを対応させ、同じセッションを同時に実行しない。
- ウェブフックのURLとトークンをリポジトリにコミットしておらず、エージェントの環境変数へ渡していない。
- ブリッジから起動するエージェントの権限を、作業に必要な範囲に限定したか、隔離した環境で実行している。

---

## 8. 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3. 通知 | [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks) | Claude CodeのNotification、Stop、StopFailure、SessionEndの各フックのきっかけと入力を定義する。 |
| 3. 通知 | [Advanced Configuration \| ChatGPT Learn](https://learn.chatgpt.com/docs/config-file/config-advanced) | Codexの `notify` の設定と、`agent-turn-complete` のJSONの項目を定義する。 |
| 3. 通知 | [Hooks \| ChatGPT Learn](https://learn.chatgpt.com/docs/hooks) | CodexのPermissionRequest、Stop、SessionEndを含むフックのイベントを定義する。 |
| 3. 通知 | [Webhook Resource - Documentation - Discord](https://docs.discord.com/developers/resources/webhook) | ウェブフックによる投稿、`wait` による投稿の取得、投稿の編集、本文の長さ、`allowed_mentions` を定義する。 |
| 3. 通知 | [Rate Limits - Documentation - Discord](https://docs.discord.com/developers/topics/rate-limits) | 頻度の制限と、HTTP 429の応答を定義する。 |
| 4. Claude Codeのchannelsによる対話 | [Push events into a running session with channels - Claude Code Docs](https://code.claude.com/docs/en/channels) | channelsの仕組み、Discordプラグインの設定、許可リスト、組織の設定、研究プレビューの制約を示す。 |
| 5. ブリッジによる対話の中継 | [Gateway - Documentation - Discord](https://docs.discord.com/developers/events/gateway) | Gatewayの接続と、Message Content Intentの対象と例外を定義する。 |
| 5. ブリッジによる対話の中継 | [Message Resource - Documentation - Discord](https://docs.discord.com/developers/resources/message) | メッセージの取得と投稿のAPI、必要な権限、本文の長さ、`allowed_mentions` を定義する。 |
| 5. ブリッジによる対話の中継 | [Run Claude Code programmatically - Claude Code Docs](https://code.claude.com/docs/en/headless) | Claude Codeの非対話モードでの実行とセッションの再開を示す。 |
| 5. ブリッジによる対話の中継 | [Non-interactive mode \| ChatGPT Learn](https://learn.chatgpt.com/docs/non-interactive-mode) | `codex exec` の出力形式とセッションの再開を定義する。 |
