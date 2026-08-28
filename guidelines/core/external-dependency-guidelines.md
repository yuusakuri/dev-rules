# 外部依存の配置規則

## 目次

1. [概要](#1-概要)
2. [依存の種類と置き場所](#2-依存の種類と置き場所)
3. [実行環境の供給](#3-実行環境の供給)
4. [外部サービスとの通信](#4-外部サービスとの通信)
5. [契約と実装](#5-契約と実装)
6. [参考資料](#6-参考資料)

---

## 1. 概要

本書は、外部システムと実行環境に依存する処理について、契約と実装をどのフォルダへ置くかを定める。本書は、[共通設計原則](software-design-guidelines.md)、[アプリケーション設計規則](application-design-guidelines.md)を前提とする。

パスは「アプリケーション設計規則」のフォルダ構成に従い、`<source-root>`を基準とする。

---

## 2. 依存の種類と置き場所

依存先の性質で種類を分け、置き場所を決める。

| 種類 | 依存先 | 契約の置き場所 | 実装の置き場所 |
| --- | --- | --- | --- |
| 永続化 | 自分が所有するデータの保存先 | `features/<feature>/repositories/` | 契約と同じフォルダ |
| 外部サービス | ネットワーク越しの他者のシステム | `features/<feature>/connectors/` | 契約と同じフォルダ |
| 実行環境の供給 | 通信を伴わずに実行環境から得る値 | `core/<capability>/` | 契約と同じフォルダ |
| 端末とOSの機能 | カメラ、位置情報、通知の表示など | 使うFeatureが一つなら`features/<feature>/connectors/`、複数のFeatureが使うなら`core/<capability>/` | 契約と同じフォルダ |

種類は次の順で判断する。保存して取り出すことが目的であれば永続化とする。依存先がネットワーク越しの特定のサービスであれば外部サービスとする。通信を伴わず実行環境から値を得るだけであれば実行環境の供給とする。

---

## 3. 実行環境の供給

`core/<capability>/`の`<capability>`には、供給する対象を表す名前を入れる。時刻を表す`clock`はその一例であり、供給する対象ごとに同じ形でフォルダを作る。

単一のFeatureでしか使わない場合は、そのFeatureの中へ置く。複数のFeatureが使う場合、または実行単位の起動時に一度だけ構築する場合は`core/<capability>/`へ置く。

`<capability>`の例と、実在するプロジェクトでの配置を示す。

| `<capability>` | 供給する対象 | 実在する配置 |
| --- | --- | --- |
| `clock` | 現在時刻、経過時間 | [zedの`crates/clock/src`](https://github.com/zed-industries/zed/tree/main/crates/clock/src)<br>[bevyの`crates/bevy_time/src`](https://github.com/bevyengine/bevy/tree/main/crates/bevy_time/src)<br>[tokioの`tokio/src/time`](https://github.com/tokio-rs/tokio/tree/master/tokio/src/time) |
| `id` | 識別子の発番と対応付け | [qdrantの`lib/segment/src/id_tracker`](https://github.com/qdrant/qdrant/tree/master/lib/segment/src/id_tracker)<br>[hyperswitchの`crates/common_utils/src/id_type`](https://github.com/juspay/hyperswitch/tree/main/crates/common_utils/src/id_type)<br>[bevyの`crates/bevy_ecs/src/entity`](https://github.com/bevyengine/bevy/tree/main/crates/bevy_ecs/src/entity) |
| `random` | 乱数 | [randの`src/rngs`](https://github.com/rust-random/rand/tree/master/src/rngs) |
| `config` | 設定値、環境変数 | [hyperswitchの`crates/router_env/src`](https://github.com/juspay/hyperswitch/tree/main/crates/router_env/src) |
| `secret` | APIキーなどの機密情報の取得 | [hyperswitchの`crates/hyperswitch_interfaces/src`](https://github.com/juspay/hyperswitch/tree/main/crates/hyperswitch_interfaces/src) |
| `crypto` | 署名、ハッシュ、暗号化 | [hyperswitchの`crates/common_utils/src`](https://github.com/juspay/hyperswitch/tree/main/crates/common_utils/src) |

この表は網羅ではない。供給する対象がほかにある場合も、同じ形で`core/`の下へフォルダを作る。

---

## 4. 外部サービスとの通信

接続先ごとに実装を分ける。関連するファイルが一つで収まるうちは`connectors/<system>_client`のファイルとし、設定と形式変換でファイルが増えたら`connectors/<system>/`のフォルダへ移す。

フォルダへ移した場合は、接続処理と、送受信するデータ形式の変換を別のファイルへ分ける。

| 規模 | 配置 | 実在する配置 |
| --- | --- | --- |
| ファイル一つ | `connectors/<system>_client` | [zero-to-productionの`src/email_client.rs`](https://github.com/LukeMathWalker/zero-to-production/blob/main/src/email_client.rs) |
| 複数ファイル | `connectors/<system>/` | [vectorの`src/sinks/clickhouse`](https://github.com/vectordotdev/vector/tree/master/src/sinks/clickhouse)<br>[hyperswitchの`crates/hyperswitch_connectors/src/connectors/stripe`](https://github.com/juspay/hyperswitch/tree/main/crates/hyperswitch_connectors/src/connectors/stripe) |

---

## 5. 契約と実装

契約には、利用側が必要とする操作だけを公開する。契約と実装は同じフォルダへ置き、実装の名前で接続先、保存先、供給元を区別する。

テストで使う代替実装も、本来の実装と同じフォルダへ置く。実装を隔離すると、契約を変更したときに追随漏れが起きる。

実行単位ごとにどの実装を使うかは、Composition Rootで決める。

---

## 6. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 2. 依存の種類と置き場所 | [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) | 外部との境界をPortとAdapterへ分ける構造を確認する。 |
| 2. 依存の種類と置き場所 | [App architecture \| Flutter](https://docs.flutter.dev/app-architecture/guide) | データを扱う層をRepositoryと外部データ源へ分ける構成を確認する。 |
| 2. 依存の種類と置き場所 | [Data layer \| Android Developers](https://developer.android.com/topic/architecture/data-layer) | 一つのデータ源につき一つの実装を持たせる構成を確認する。 |
| 5. 契約と実装 | [Designing the infrastructure persistence layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design) | 契約を利用側へ置き、実装を差し替え可能にする構成を確認する。 |
| 3. 実行環境の供給 | [zedの`system_clock.rs`](https://github.com/zed-industries/zed/blob/main/crates/clock/src/system_clock.rs) | 契約、実時刻の実装、テスト用の実装を同じ場所へ置く例を確認する。 |
| 3. 実行環境の供給 | [qdrantの`id_tracker`](https://github.com/qdrant/qdrant/tree/master/lib/segment/src/id_tracker) | 契約と、保持方式ごとの実装を並べる例を確認する。 |
| 4. 外部サービスとの通信 | [vectorの`src/sinks`](https://github.com/vectordotdev/vector/tree/master/src/sinks) | 接続先ごとにフォルダを分け、設定と送信処理をファイルへ分ける例を確認する。 |
| 4. 外部サービスとの通信 | [hyperswitchの`connectors`](https://github.com/juspay/hyperswitch/tree/main/crates/hyperswitch_connectors/src/connectors) | 接続先ごとのフォルダで、形式変換を別ファイルへ分ける例を確認する。 |
