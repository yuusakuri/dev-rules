# 共通設計原則

## 目次

1. [概要](#1-概要)
2. [責務の分離](#2-責務の分離)
3. [依存関係の管理](#3-依存関係の管理)
4. [複雑性の制御](#4-複雑性の制御)
5. [型とカプセル化](#5-型とカプセル化)
6. [設計パターン](#6-設計パターン)
7. [命名](#7-命名)
8. [エラーハンドリング](#8-エラーハンドリング)
9. [並行処理](#9-並行処理)
10. [ログ](#10-ログ)
11. [コードコメント](#11-コードコメント)
12. [参考資料](#12-参考資料)

---

## 1. 概要

本書は、言語やフレームワークに依存しないソフトウェア設計原則を定義する。

本書の原則は、使用する言語、フレームワークの標準的な書き方へ落とし込んで適用する。

本書のコード例と名前の例は、次のいずれかに当てはまるRust OSSの実装から採用する。

- Rust公式のプロジェクト。
- 大手企業が開発し、本番環境で使用されているもの。
- GitHubのStarが2,000以上のもの。

コード例は、対応する規則の直下へ短く置く。実装からの抜粋とし、規則に関係しない部分は削るか`// ...`、`/* ... */`で省略する。複数の型や引数を独自の型へまとめる、名前を変更するなどの書き換えは行わない。抜粋元は固定コミットへのリンクで「参考資料」に記載する。各コード例の直前に、そのコードが何をしているかを説明する文を置く。

名前の例は、型名または関数名と、その定義へのリンクを記載する。そのリンクは、「参考資料」へ重ねて記載しない。

---

## 2. 責務の分離

### 中核ロジックを外部技術から独立させる

業務ロジックは、データベース、通信方式、画面、フレームワークなどの外部技術から独立させる。業務上の制約は、呼び出す画面や保存先のDBが変わっても同じに効く必要がある。独立させておけば、外部技術を入れ替えても業務ロジックはそのまま使え、実際のDB接続、ネットワーク通信、ファイルI/O、UIフレームワークがなくても単体テストで検証できる。

UIのbuild処理やHTTPハンドラーなど、フレームワークへ強く依存してテストしにくいコードには業務ロジックを持たせず、テスト可能な処理へ渡すだけの薄い層（Humble Object）にとどめる。判断を外へ出せば、テストしにくいコードはテストが不要なほど単純になる。

### 外部データの型と内部で使う型を分離する

DBのレコードや外部APIのレスポンスなど、外部から来るデータの型と、業務ロジックで使う型は分け、境界で相互変換する。外部の型をそのまま使うと、APIのフィールドが1つ増えただけで業務ロジックまで書き換えることになる。分けておけば、影響は変換処理で止まる。

### 変化する理由は1つに絞る（Single Responsibility）

1つのモジュール、クラスが変化する理由は1つだけにする。理由が1つなら、ある機能を変更しても無関係なコードへ影響が波及しない。

### 使わないメソッドを押し付けない（Interface Segregation）

呼び出し元が使わないメソッドを、インターフェースに含めない。大きなインターフェースを1つ置くと、実装側は使わないメソッドまで実装させられ、呼び出し元は無関係な変更の影響を受ける。目的ごとに小さく分ければ、影響はそれを使う箇所だけで済む。

### 読み取りと書き込みを分離する

読み取りと書き込みで、必要な処理、状態、依存関係、性能要件が異なる場合は、別の型に分け、利用側には必要な操作だけを公開する。分ければ、読み取りと書き込みを別々に実装、所有、テストでき、片方だけキャッシュを挟むなどの変更も、もう一方に触れずに行える。

### ファイルは言語の構成要素ではなくドメインで分割する

Type、Interface、Class、Functionなどのプログラミング言語上の構成要素を理由に、ファイルを分割、集約しない。

型定義は、それが属するドメイン、責務、機能ごと（例: `user`、`payment_client`）のファイルへ分けるか、その型を最も強く所有するロジックと同じモジュールへ置く。

---

## 3. 依存関係の管理

### 具体的な実装に直接依存せず、抽象に依存する（Dependency Inversion）

業務ロジックを、外部I/O、永続化、時刻、ID生成、乱数などの外部技術から分離する必要がある場合は、必要とする契約を定義し、その契約に依存させる。依存の向きを利用側の要求へ向けることで、具体的な実装の変更が業務処理へ波及しない。

抽象を導入するのは、実装の交換、外部技術との分離、複数実装の切り替えが必要な場合に限る。交換する必要のない実装には、抽象を追加しない。

次は、ビルドの実行方法だけを差し替えられるようにした例である。`compile`はコンパイル処理全体を担うが、コンパイラーを実際に起動する部分だけを`Executor`という契約へ切り出している。既定の呼び出し元は`DefaultExecutor`を渡し、ビルドの進行を観測したい呼び出し元は別の実装を渡す。`compile`は`exec`の中身を知らないため、実行方法が変わってもビルドの手順には影響しない。契約にしたのは差し替えたい一点だけで、コンパイル処理の他の部分は抽象化していない。

```rust
pub trait Executor: Send + Sync + 'static {
    fn exec(&self, cmd: &ProcessBuilder, id: PackageId /* ... */) -> CargoResult<()>;
    // ...
}

pub fn compile<'a>(ws: &Workspace<'a>, options: &CompileOptions) -> CargoResult<Compilation<'a>> {
    let exec: Arc<dyn Executor> = Arc::new(DefaultExecutor);
    compile_with_exec(ws, options, &exec)
}
```

### 差し替えても壊れないようにする（Liskov Substitution）

あるインターフェースの実装を別の実装へ差し替えても、呼び出し元の動作が壊れてはならない。実装が事前条件、事後条件、不変条件を破ると、呼び出し元は特定の実装でしか動かない書き方に暗黙のうちに依存し、抽象は形だけのものになる。

### 追加で拡張し、修正では拡張しない（Open/Closed）

モジュールは、新しい振る舞いの追加に対して開き、既存コードの変更に対して閉じた状態を目指す。機能追加のたびに既存コードへ手を入れると、動いていた処理まで巻き込む。インターフェースとDependency Inversionを組み合わせれば、実装を追加するだけで機能を広げられる。

### 依存関係を明示的に受け渡す（Dependency Injection）

必要な依存関係はその具体型または抽象型をコンストラクターまたは関数の引数として受け取る。ただし、処理対象となる入力値や、実装の内部だけで使う補助オブジェクトは、依存関係として外部から渡さない。

処理の内部から、グローバル変数、静的アクセサー、DIコンテナー、Service Locatorを使って依存関係を検索しない。取得場所が隠れると、処理の理解と単体テストが難しくなる。

次は、検索処理が協働オブジェクトと処理対象を別々に受け取る例である。パターン照合を行う`matcher`、走査を行う`searcher`、結果を出力する`printer`は、いずれも実行前に決まり検索の間ずっと使い回すため、`search_worker`の引数として一度だけ渡す。対して走査先の`haystack`は呼び出しごとに変わる処理対象なので、依存関係ではなく`search`の引数として渡す。協働オブジェクトと処理対象を引数の位置で区別しているため、`search_worker`の呼び出しを見れば、この検索が何に依存しているかが分かる。テストでは、`printer`に検証用の実装を渡して出力を確認できる。

```rust
let mut searcher = args.search_worker(
    args.matcher()?,
    args.searcher()?,
    args.printer(mode, args.stdout()),
)?;
for haystack in haystacks {
    searcher.search(&haystack)?;
}
```

### 起動点で依存関係を構成する

実行可能なアプリケーションは、`main`などの起動点で設定を読み、複数の処理で共有する外部資源と依存関係の実装を生成し、最上位の実行対象を組み立ててから実行を開始する。この構成箇所をComposition Rootと呼ぶ。一回の操作の間だけ使う資源は、起動点ではなく、その操作を担う処理の内部で生成する。

DIコンテナーを使用する場合も参照箇所は起動点に限定する。業務処理を担う型や関数はコンテナーへ依存させない。

次は、Webアプリケーションの起動点の例である。`main`は`InMemoryUserRepo`という具体的な実装をここで一度だけ生成し、`Arc`で包んで共有状態`AppState`へ入れ、ルーティングと結び付けてから待ち受けを開始する。ハンドラーとその先の処理は、どの実装が選ばれたかを知らない。

```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let user_repo = InMemoryUserRepo::default();

    let app = Router::new()
        .route("/users", post(handle_create_user))
        // ...
        .with_state(AppState {
            user_repo: Arc::new(user_repo),
        });

    let listener = TcpListener::bind("127.0.0.1:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
```

生成手順が複雑な場合は、生成対象に固有のBuilderまたはFactoryを使用し、任意の依存関係を検索する汎用コンテナーとして扱わない。

次は、一回の操作の間だけ必要な資源を、それを使う処理の内部で生成する例である。前処理コマンドのプロセスと、その出力を読む`rdr`は、この`path`の検索でしか使わない。呼び出し側がこれらを組み立てて渡す形にすると、終了処理の責任まで呼び出し側へ広がる。ここでは生成から`close`までを`search_preprocessor`が持ち、検索が失敗した場合でも終了処理を実行するために、`result?`より先に`rdr.close()`を呼んでいる。

```rust
fn search_preprocessor(&mut self, path: &Path) -> io::Result<SearchResult> {
    let bin = self.config.preprocessor.as_ref().unwrap();
    let mut cmd = std::process::Command::new(bin);
    cmd.arg(path).stdin(Stdio::from(File::open(path)?));

    let mut rdr = self.command_builder.build(&mut cmd)?;
    let result = self.search_reader(path, &mut rdr);
    let close_result = rdr.close();
    let search_result = result?;
    close_result?;
    Ok(search_result)
}
```

### 通信の共通処理をサービスごとのClientから分離する

外部サービスや機能ごとの`Client`は、その対象に固有の操作と、接続先など対象ごとに異なる設定を担当する。認証、リトライ、タイムアウト、共通ヘッダー、通信エラーの変換など、複数の`Client`に共通する通信処理は下位の通信層へ分離し、各`Client`から必要な設定を渡す。サービスごとに異なる設定まで一つの共通`Client`へ集約しない。

次は、サービスごとのClientが共通して使う通信設定を、下位の層が一つの型へまとめた例である。資格情報の供給元、再試行とタイムアウトの方針、HTTP通信の実装をこの型が持つため、各Clientはこれらを自前で用意せず、対象に固有の操作だけを担当する。`credentials_provider`と`http_client`が示すとおり、まとめているのは設定値だけではなく、値を供給する仕組みと通信に使う資源も含む。

```rust
pub struct SdkConfig {
    credentials_provider: Option<SharedCredentialsProvider>,
    region: Option<Region>,
    endpoint_url: Option<String>,
    retry_config: Option<RetryConfig>,
    timeout_config: Option<TimeoutConfig>,
    http_client: Option<SharedHttpClient>,
    // ...
}
```

### 共有可能な通信資源を再利用する

複数のClientが共有する認証、接続、Retryなどの動作を決める設定や、実装の指定などは、Configにまとめて各Clientへ渡す。

次は、その設定を組み立ててClientへ渡す側の例である。`load_defaults`が環境変数、共有設定ファイル、実行環境のメタデータなどを順に探索して設定を一度だけ作り、各サービスのClientは`Client::new(&config)`で同じ値を受け取る。扱うサービスが増えても資格情報の解決はやり直されず、接続に使う資源もClient間で共有される。

```rust
let config = aws_config::load_defaults(BehaviorVersion::v2023_11_09()).await;
let client = aws_sdk_dynamodb::Client::new(&config);
```

### 共有状態は実行責務とライフサイクルでまとめる

フレームワークが一つの状態型を要求する場合や、イベントループなどの実行主体が複数の状態と資源を同じ期間所有する場合は、利用範囲とライフサイクルが一致する値を専用の型へまとめてよい。利用側が共有状態の一部しか使わない場合は、その部分だけを渡す。新しく定義する共有状態の型名には、`AppState`または`GlobalState`を優先して使用する。フレームワークが別の名前を定めている場合は、その規約に従う。

次は、言語サーバーのイベントループを実行する型の例である。`GlobalState`は、クライアントへの送信路`sender`、処理を別スレッドで走らせる`task_pool`、設定`config`を持つ。これらは`new`で組み立てられ、`run`の実行中は同じライフサイクルで管理されるため、一つの型にまとめている。`GlobalState`は`run`でイベントを受け取り`handle_event`へ渡す。

```rust
pub(crate) struct GlobalState {
    sender: Sender<lsp_server::Message>,
    pub(crate) task_pool: Handle<TaskPool<Task>, Receiver<Task>>,
    pub(crate) config: Arc<Config>,
    // ...
}

impl GlobalState {
    pub(crate) fn new(sender: Sender<lsp_server::Message>, config: Config) -> GlobalState {
        let task_pool = {
            let (sender, receiver) = unbounded();
            let handle = TaskPool::new_with_threads(sender, config.main_loop_num_threads());
            Handle { handle, receiver }
        };
        // ...
        GlobalState {
            sender,
            task_pool,
            config: Arc::new(config),
        }
    }

    fn run(mut self, inbox: Receiver<lsp_server::Message>) -> anyhow::Result<()> {
        while let Ok(event) = self.next_event(&inbox) {
            self.handle_event(event);
        }
        // ...
    }

    pub(crate) fn snapshot(&self) -> GlobalStateSnapshot {
        GlobalStateSnapshot {
            config: Arc::clone(&self.config),
            analysis: self.analysis_host.analysis(),
            // ...
        }
    }
}
```

次は、その状態を使う側の例である。重い処理を別スレッドで走らせるため、`GlobalState`は自身が持つ`task_pool`へ処理を渡す。このとき状態そのものは渡せないので、`snapshot()`で読み取りに必要な値だけを写した`GlobalStateSnapshot`を作り、クロージャーへ移動させる。

```rust
self.task_pool
    .handle
    .spawn(ThreadIntent::LatencySensitive, {
        let snapshot = self.snapshot();
        move || {
            // ...
        }
    });
```

次は、同じ考え方をWebフレームワークの共有状態へ当てはめた例である。`AppState`はプロセス全体で共有する値をまとめた型で、フレームワークはハンドラーへこれを`State`として渡す。`handle_create_user`は状態を受け取ってそのまま使う。一方`handle_get_user`は`user_repo`しか使わないため、`FromRef`の実装を通じて、状態全体ではなくその部分だけを受け取っている。

```rust
#[derive(Clone)]
struct AppState {
    user_repo: Arc<dyn UserRepo>,
}

async fn handle_create_user(
    State(state): State<AppState>,
    Json(params): Json<UserParams>,
) -> Json<User> {
    // ...
    state.user_repo.save_user(&user);

    Json(user)
}

impl FromRef<AppState> for Arc<dyn UserRepo> {
    fn from_ref(app_state: &AppState) -> Arc<dyn UserRepo> {
        app_state.user_repo.clone()
    }
}

async fn handle_get_user(
    State(user_repo): State<Arc<dyn UserRepo>>,
    Path(id): Path<Uuid>,
) -> Result<Json<User>, StatusCode> {
    // ...
}
```

### 循環依存を避ける

A → B → A のような循環依存は、モジュール間の境界が崩れている状態を示す。一方を変更すればもう一方も変更が必要になり、単独でのビルドやテストもできない。

両者が必要とする共通部分は、双方から依存される下位モジュールとして切り出す。

### 設定値をロジックに直接埋め込まない

タイムアウト値、リトライ回数、アドレスなど、実行環境や運用によって変わる値をコードへ直接書かない。

---

## 4. 複雑性の制御

### 必要になるまで作らない（YAGNI）

将来使うかもしれない機能、抽象化、汎用化は、今は作らない。使われない実装も保守の対象になり、読み手はどこで使われているのか探索してしまう。実際に要件が来たときには、想定と違っていることも多い。

### 最も単純な方法を選ぶ（KISS）

同じ結果になる実装方法が複数あるなら、最も単純なものを選ぶ。

### 同じ知識を繰り返さない（DRY）

同じ概念や業務知識が複数箇所に散らばると、変更のたびに全箇所を直す必要があり、直し漏れがバグになる。関数化、共通化して、変更する場所を1か所へ集約する。

### 同じ情報を複数の状態として持たない

他の状態から計算できる値は、独立した状態として保存せず、必要な時点で導出する。同じ情報の写しが複数あると、片方だけ更新されて食い違う。

### 隣の相手までしか知らない（Law of Demeter）

オブジェクトの処理内で操作してよいのは、自分自身、自身が直接保持する変数、渡された引数、その処理内で生成したオブジェクトに限る。`a.b().c().d()`のように連鎖して奥へ入り込むと、途中の型の内部構造すべてに依存することになる。

### 副作用は境界に閉じ込める

ファイル書き込み、ネットワーク送受信、グローバル状態の変更などの副作用を、ロジックを担う関数の中へ混ぜない。

ロジック層の関数は、同じ入力なら常に同じ結果を返す処理だけを行う。副作用を持つ処理は、Infrastructure層、ハンドラー、エントリポイントなど、あらかじめ決めた境界にのみ書く。ロジック層のテストに実際のI/Oは要らず、外の世界に触れている箇所も探さずに分かる。

### リファクタリングは振る舞いを保った小さな変更に分ける

既存コードの内部構造を整理する場合は、外部から観測できる振る舞いを変えない小さな変更に分け、各変更後に関連するテストを実行する。機能変更を伴う場合も、構造の整理と振る舞いの変更を個別に確認できる単位へ分ける。

### ネストを深くしない

条件分岐や反復処理などのコードブロックが3段を超えてネストする場合は、早期returnまたは関数抽出を検討する。

深いネストは、1つの関数が複数の判断を抱え込んでいる兆候なので、インデントを浅くする小手先の変更ではなく、責務の分け方を見直す。

---

## 5. 型とカプセル化

### 内部構造を外部へ公開しない

利用側が子要素の配置や内部状態を直接操作しなければ使えない設計を避ける。内部構造が外から見えていると事実上の仕様になり、内部を変えるだけで利用側が壊れる。コンポーネント自身に内部構造を管理させ、外へは操作の意味だけを見せる。

### データと、そのデータを扱う操作を同じ型に置く

ある型のデータを取り出して外側で判断、加工する処理が繰り返し現れる場合、その判断はデータを持つ型の操作として定義する。データだけを持つ型と、それを外から操作する処理に分かれていると、同じ判断が呼び出し側ごとに書かれ、規則が変わったときの直し漏れが起きる。

### 意味を持つ値は専用の型で表す

金額、識別子、期間など、業務上の意味を持つ値は、生の文字列や数値のままにせず専用の型で表す。値を表す型は生成後は不変とし、等価性は保持する値で判断する。

### 不正な値と状態を型の内側で防ぐ

値の範囲や形式、要素の重複、並び順、件数など、型が満たすべき条件は、その型の生成と操作の内側で検証し、外から不正な値や状態を作れないようにする。

### 継承より合成と委譲を選ぶ

継承は、インターフェースの実装、つまり振る舞いの契約を表す目的でのみ使う。実装を再利用したい場合は、その実装を持つ型を部品として保持する合成と、処理をその部品へ任せる委譲を使う。

実装継承では、子クラスが親クラスの内部実装に依存するため、親の内部を変えると子が壊れる。合成では、部品として保持していることだけが両者の関係になり、委譲が依存するのも部品の公開インターフェースに限られるため、部品の内部が変わっても影響を受けない。部品をインターフェース経由で差し替えられるため、テストも容易になる。

---

## 6. 設計パターン

### オブジェクト生成

生成に必要な引数が多い場合や、任意項目を組み合わせて段階的に組み立てる場合は、Builderパターンを採用する。生成手順を専用のBuilderへ分離すれば、引数が並んだだけのコンストラクタや、散らばった生成処理を避けられる。

条件によって異なる実装を返す場合や、外部リソースを参照して生成する場合は、専用の生成関数またはFactoryパターンで生成の詳細を隠す。

### アルゴリズムや処理の切り替えを可能にする（Strategy）

同じ処理の「やり方」を差し替えたい場面では、if / switchの分岐が増え続ける。Strategyパターンで各アルゴリズムをインターフェースとして定義し、呼び出し元を変更せずに実装を差し替えられるようにする。

### 状態遷移を安全に管理する（State）

モジュールが複数の状態を持ち、状態ごとに振る舞いが変わる場合、条件分岐が絡み合って遷移の全体像が読めなくなる。Stateパターンで各状態を独立した単位として表現し、遷移ロジックを1か所へ集める。

### 一連の設定や操作を順に書けるようにする（Fluent API）

関連する設定や操作を続けて記述したほうが読みやすい場合は、Fluent APIによるメソッドチェーンを使う。各メソッドは自身、または次の操作段階を表す型を返し、利用側が処理の流れを順番に書けるようにする。

### 操作を値として表現する（Command）

操作を遅延実行、キューイング、再試行、記録、取り消しする必要がある場合は、Commandパターンを使う。操作の種類と入力をCommandとして表し、操作を要求する側と実行する側を分ける。実行の順序や方法を、要求するコードに触れずに変更できる。

### 既存の非互換インターフェースを接続する（Adapter）

利用側と提供側にすでに存在するインターフェースが互換でない場合は、Adapterパターンで一方の操作とデータを他方の形式へ変換する。変換以外の業務上の判断はAdapterに持たせない。

### 保存先を交換する場合はRepositoryへ分離する

業務ロジックを保存方式から独立させ、保存先を交換できるようにする場合は、Repositoryパターンを使う。Repositoryは利用側に必要な取得、保存、削除などの操作だけを契約として公開し、保存方式に固有の型と処理を実装内へ閉じ込める。

次は、保存方式を実装の内側へ閉じ込めた例である。`UserRepo`は取得と保存の2つの操作を宣言し、`InMemoryUserRepo`がそれを実装する。保持には`HashMap`を使い、複数スレッドから扱うために`Arc<Mutex<_>>`で包んでいる。

```rust
trait UserRepo: Send + Sync {
    fn get_user(&self, id: Uuid) -> Option<User>;

    fn save_user(&self, user: &User);
}

struct InMemoryUserRepo {
    map: Arc<Mutex<HashMap<Uuid, User>>>,
}

impl UserRepo for InMemoryUserRepo {
    // ...
}
```

### 外部システムとの境界を分離する

外部資源（通知、他サービスのAPI、デバイス、時刻、乱数など）を利用する場合は、利用側の目的に沿った操作を公開する境界を定義し、外部APIの呼び出し、外部形式との変換、外部SDKの型とエラーを実装内へ閉じ込める。引数、戻り値、エラーは利用側が扱う型で定義し、業務上の判断は利用側で行う。

### 既存モジュールに手を加えずに機能を追加する（Decorator）

ロギング、計測、リトライなどの横断的な処理を、既存の実装を変更せずに足したい場合は、Decoratorパターンでラッパーを被せる。元のインターフェースを保ったまま拡張できるため、利用側は付いているかどうかを意識しなくてよい。

### モジュールへのアクセスを制御する（Proxy）

遅延初期化、権限チェック、アクセス回数制限など、対象モジュールへのアクセス自体を制御する必要がある場合は、Proxyパターンを使う。呼び出し元からは本物と同じインターフェースに見えたまま、制御のロジックをProxyが引き受ける。

### 複雑なサブシステムをシンプルな窓口で隠す（Facade）

複数のコンポーネントを個別に呼び出す手順が呼び出し元へ漏れ出している場合は、Facadeパターンで窓口を1つ用意し、内部の複雑さを隠す。

---

## 7. 命名

### 規則

| ルール | 内容 |
| --- | --- |
| 名前の具体性 | 名前だけで役割、対象、処理内容が推測できるようにする。接続先、扱うデータ、責務を含め、`Abstract`、`Base`、`Common`、`Shared`、`Manager`、`Helper`、`Process`、`Do`、`Util`、`Object`、`Raw` のような汎用名は使わない。責務を表す具体的な名前を使う。 |
| 層やパターンの名前 | 型名に`UseCase`、`Interactor`、`Logic`のような層やパターンの区分を付けない。その型が実行する責務を名前にする。NG: `SignInUseCase`、`AuthLogic`、OK: [`tower`の`Timeout`](https://docs.rs/tower/latest/tower/timeout/struct.Timeout.html)、[`notify`の`Watcher`](https://docs.rs/notify/latest/notify/trait.Watcher.html) |
| 外部境界の配置名 | 外部システムや外部資源に依存する実装を置くモジュールとディレクトリは、型の役割ではなく、実際の接続先または外部資源で命名する。NG: `connectors`、`clients`、`gateways`、OK: [`github`](https://github.com/apache/opendal/tree/main/core/services/github)、[`mysql`](https://github.com/apache/opendal/tree/main/core/services/mysql)、[`s3`](https://github.com/apache/opendal/tree/main/core/services/s3) |
| 外部境界の型名 | 外部との境界を表す型は、その型が実際に行う役割で命名する。複数の実装を区別する場合は、具体型に接続先または供給元を含める。NG: `PaymentConnector`、`SettingsGateway`、OK: [`notify`の`Watcher`](https://docs.rs/notify/latest/notify/trait.Watcher.html)、[`lettre`の`Transport`](https://docs.rs/lettre/latest/lettre/trait.Transport.html) / [`SmtpTransport`](https://docs.rs/lettre/latest/lettre/transport/smtp/struct.SmtpTransport.html) |
| 省略、略語 | 独自略語は禁止する。業界標準の略語は使用してよい。NG: `tbl`、OK: `table` `uuid` |
| 短く命名する | 文脈上明らかな語は省き、意味を損なわない範囲で簡潔にする。型名が4単語以上、関数名が5単語以上になる場合は見直す。名前空間、型名、メソッド名のどこかで既に表現されている概念を、隣接する層で繰り返さない。NG: `reqwest::RequestBuilder::send_request`、`aws_sdk_s3::S3Client`、OK: [`reqwest`の`RequestBuilder::send`](https://docs.rs/reqwest/latest/reqwest/struct.RequestBuilder.html#method.send)、[`aws-sdk-s3`の`Client`](https://docs.rs/aws-sdk-s3/latest/aws_sdk_s3/struct.Client.html) |
| 抽象と具体、インターフェース | 抽象側（インターフェース）には汎用的、概念的な名前を付ける。`I` プレフィックスと `Impl` サフィックスは禁止。具体側（実装）には詳細、技術的な名前を付ける。インターフェースは能力、役割を表す名詞または形容詞にする。NG: `ITransport` / `TransportImpl`、OK: [`lettre`の`Transport`](https://docs.rs/lettre/latest/lettre/trait.Transport.html) / [`SmtpTransport`](https://docs.rs/lettre/latest/lettre/transport/smtp/struct.SmtpTransport.html) |
| データ構造 | 内部の処理状態を名前に含めない。データ構造としてふさわしいドメイン名を付ける。NG: `ParsedMessage`、`RawFrame`、OK: [`tungstenite`の`Message`](https://docs.rs/tungstenite/latest/tungstenite/protocol/enum.Message.html)、[`Frame`](https://docs.rs/tungstenite/latest/tungstenite/protocol/frame/struct.Frame.html) |
| 真偽値 | 真偽値を返す関数は、その判定内容を表す自然な動詞または `is` / `has` / `can` / `should` を使用する。 |
| 要求と完了イベントの名前 | 処理の実行を求める型名は`Request`で終える。完了した出来事を表すイベントの名前には過去形を使用する。例：`InitRequest`、`Initialized` |
| イベント待受属性名 | 要求またはイベントの発生を待ち受ける属性名は`on_`で始め、その後に対応するイベント名を続ける。例：`on_init_request`、`on_initialized` |
| イベント処理関数名 | 要求またはイベントを受け取って処理する関数名は`handle_`で始め、その後に対応するイベント名を続ける。例：`handle_init_request`、`handle_initialized` |
| 定数、マジックナンバー | マジックナンバーを避け、意味を持つ名前付き定数にする。 |

### 単語

本節は、よく使用される用語の意味と使い分けを示す。

命名は、本節の表に記載の有る無しに関わらず、対象の責務を直接表すものを優先する。

言語、プロトコル、フレームワーク、ライブラリで意味が確立している名前は、その名前を使用する。

| 名前 | 説明 | 例 | 品詞 | タグ |
| --- | --- | --- | --- | --- |
| `error` | エラーを表す型の名前は `error` で終える。特定の操作や対象に対応する場合は、何に失敗したかが分かる名前にする。 | [`io::Error`](https://doc.rust-lang.org/std/io/struct.Error.html)、[`ParseIntError`](https://doc.rust-lang.org/std/num/struct.ParseIntError.html) | 名詞 | エラー |
| `guard` | スコープ内でロック、アクセス権、状態変更などを一時的に保持し、破棄時またはスコープ終了時に自動解放、復元する型に使用する。 | [`MutexGuard`](https://doc.rust-lang.org/std/sync/struct.MutexGuard.html) | 名詞 | リソース |
| `handle` | 実行中の処理、外部リソース、サービスなどを操作、監視、終了待機するための参照や権限を表す型に使用する。要求やイベントを受け取って処理する関数の名前は`handle_`で始め、対応する要求名またはイベント名を続ける。 | [`tokio`の`JoinHandle`](https://docs.rs/tokio/latest/tokio/task/struct.JoinHandle.html)、[`Handle`](https://docs.rs/tokio/latest/tokio/runtime/struct.Handle.html)、[`s2n_quic`の`connection::Handle`](https://docs.rs/s2n-quic/latest/s2n_quic/connection/struct.Handle.html) | 名詞、動詞 | リソース |
| `sender` | メッセージ経路やチャネルの送信側を表す型に使用する。通信方式や容量などを区別する必要がある場合は、その性質を名前に付ける。関連: `receiver`も参照。 | [`mpsc::Sender`](https://doc.rust-lang.org/std/sync/mpsc/struct.Sender.html) | 名詞 | 通信 |
| `receiver` | メッセージ経路やチャネルの受信側を表す型に使用する。通信方式や容量などを区別する必要がある場合は、その性質を名前に付ける。関連: `sender`も参照。 | [`mpsc::Receiver`](https://doc.rust-lang.org/std/sync/mpsc/struct.Receiver.html) | 名詞 | 通信 |
| `permit` | 一時的に確保した容量、実行権、アクセス権を表す値に使用する。使用、破棄、スコープ終了などによって権利を返却する構造にする。 | [`SemaphorePermit`](https://docs.rs/tokio/latest/tokio/sync/struct.SemaphorePermit.html) | 名詞 | リソース |
| `runtime` | タスクの実行、スケジューリング、資源の保持を担う実行基盤を表す型に使用する。 | [`tokio`の`Runtime`](https://docs.rs/tokio/latest/tokio/runtime/struct.Runtime.html) | 名詞 | リソース |
| `token` | 取り消し要求や実行権など、保持していること自体が意味を持ち、複製して配れる値に使用する。 | [`tokio_util`の`CancellationToken`](https://docs.rs/tokio-util/latest/tokio_util/sync/struct.CancellationToken.html) | 名詞 | 制御 |
| `layer` | 既存の処理を包み、横断的な機能を足した処理を生成する構成単位に使用する。包む対象のインターフェースは変えない。`layer`自身は要求を処理しない。関連: `service`も参照。 | [`tower`の`Layer`](https://docs.rs/tower/latest/tower/trait.Layer.html)、[`tracing_subscriber`の`Layer`](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/layer/trait.Layer.html) | 名詞 | 制御 |
| `span` | 開始と終了を持つ処理区間を表す型に使用する。区間に属するログや計測を、その区間へ結び付ける。 | [`tracing`の`Span`](https://docs.rs/tracing/latest/tracing/struct.Span.html) | 名詞 | ログ |
| `bytes` | 整数値をバイト列として保持する型、変数には、対象を表す名前に `bytes` を付ける。 | [`u32::to_be_bytes`](https://doc.rust-lang.org/std/primitive.u32.html#method.to_be_bytes) | 名詞 | データ |
| `frame` | 連続したバイト列の中で、長さ、区切り、ヘッダー、ペイロード、検査値などによって境界が定められる伝送単位を表す型に使用する。通信内容の意味よりも、送受信時のバイト配置や境界を管理する場合に使用する。 | [`smoltcp`の`EthernetFrame`](https://docs.rs/smoltcp/latest/smoltcp/wire/struct.EthernetFrame.html)、[`tungstenite`の`Frame`](https://docs.rs/tungstenite/latest/tungstenite/protocol/frame/struct.Frame.html) | 名詞 | 通信 |
| `packet` | プロトコル上の意味を持つ通信データの単位を表す型に使用する。コマンド、応答、イベント、送信元、送信先、データ種別など、通信内容を扱う場合に使用する。 | [`smoltcp`の`TcpPacket`](https://docs.rs/smoltcp/latest/smoltcp/wire/struct.TcpPacket.html)、[`UdpPacket`](https://docs.rs/smoltcp/latest/smoltcp/wire/struct.UdpPacket.html)、[`Ipv4Packet`](https://docs.rs/smoltcp/latest/smoltcp/wire/struct.Ipv4Packet.html) | 名詞 | 通信 |
| `datagram` | 送達確認と順序保証を持たない単位で送受信する通信データを表す型に使用する。 | [`quinn`の`Datagram`](https://docs.rs/quinn-proto/latest/quinn_proto/struct.Datagram.html) | 名詞 | 通信 |
| `endpoint` | プロトコルが定める通信の端点を表す型に使用する。接続を開始する側と受け付ける側で役割が定まっている端点は、`client`、`server`で命名する。外部との境界一般には使わない。関連: `client`、`server`も参照。 | [`quinn`の`Endpoint`](https://docs.rs/quinn/latest/quinn/struct.Endpoint.html) | 名詞 | 通信 |
| `listener` | 接続要求または通知の到着を待ち受け、受け取る型に使用する。待ち受ける対象を名前に含める。受け取った後に動く処理の名前には使わず、`handler`を使用する。資源や状態の変化を監視する型は`watcher`を使用する。関連: `server`、`subscriber`、`handler`も参照。 | [`TcpListener`](https://doc.rust-lang.org/std/net/struct.TcpListener.html)、[`tokio`の`TcpListener`](https://docs.rs/tokio/latest/tokio/net/struct.TcpListener.html)、[`sqlx`の`PgListener`](https://docs.rs/sqlx/latest/sqlx/postgres/struct.PgListener.html) | 名詞 | 通信 |
| `subscriber` | 発行側へ購読を登録し、配信された通知を受け取る型に使用する。受け取った通知に対して動く処理は`handler`で表し、`subscriber`の名前には処理内容を含めない。購読の登録を`listen`と定めるプロトコルやライブラリでは`listener`を使用する。関連: `listener`、`handler`も参照。 | [`async_nats`の`Subscriber`](https://docs.rs/async-nats/latest/async_nats/struct.Subscriber.html)、[`zenoh`の`Subscriber`](https://docs.rs/zenoh/latest/zenoh/pubsub/struct.Subscriber.html) | 名詞 | 通信 |
| `watcher` | 既存の資源や状態の変化を監視し、変化を通知する型に使用する。監視する対象を名前に含める。関連: `listener`も参照。 | [`notify`の`Watcher`](https://docs.rs/notify/latest/notify/trait.Watcher.html) | 名詞 | 通信 |
| `socket` | OSが提供する通信端点をそのまま扱う型に使用する。 | [`UdpSocket`](https://doc.rust-lang.org/std/net/struct.UdpSocket.html) | 名詞 | 通信 |
| `connection` | 確立済みの通信路を表す型に使用する。接続先または方式を実装の名前に含める。 | [`quinn`の`Connection`](https://docs.rs/quinn/latest/quinn/struct.Connection.html)、[`s2n_quic`の`Connection`](https://docs.rs/s2n-quic/latest/s2n_quic/connection/struct.Connection.html) | 名詞 | 通信 |
| `stream` | 連続して流れるバイト列または値を、順に読み書きする型に使用する。境界が定められた単位を扱う場合は `frame`、`packet` を使う。関連: `sink`も参照。 | [`TcpStream`](https://doc.rust-lang.org/std/net/struct.TcpStream.html)、[`futures`の`Stream`](https://docs.rs/futures/latest/futures/stream/trait.Stream.html) | 名詞 | 通信 |
| `sink` | 連続して流れる値を順に受け取り、送り先へ渡す型に使用する。送り先を名前に含める。関連: `stream`も参照。 | [`futures`の`Sink`](https://docs.rs/futures/latest/futures/sink/trait.Sink.html) | 名詞 | 通信 |
| `request` | 外部へ送る要求を表す型に使用する。対象の操作を名前に含める。関連: `response`も参照。 | [`http`の`Request`](https://docs.rs/http/latest/http/request/struct.Request.html) | 名詞 | 通信 |
| `response` | 要求に対する応答を表す型に使用する。対象の操作を名前に含める。関連: `request`も参照。 | [`http`の`Response`](https://docs.rs/http/latest/http/response/struct.Response.html) | 名詞 | 通信 |
| `service` | 要求を受け取って応答を返す処理を、要求と応答の型で表した抽象に使用する。個別の業務処理と横断処理を同じ形で扱えるようにする。業務処理をまとめただけの型の名前には使わない。関連: `handler`、`layer`も参照。 | [`tower`の`Service`](https://docs.rs/tower/latest/tower/trait.Service.html) | 名詞 | 通信 |
| `router` | 受け取った要求を、経路や条件に対応する処理へ振り分ける型に使用する。 | [`axum`の`Router`](https://docs.rs/axum/latest/axum/struct.Router.html) | 名詞 | 通信 |
| `handler` | 受け取った要求、通知、イベントに対して、個別の処理そのものを実行する型または関数に使用する。受け取る種類ごとに定義し、処理する対象を名前に含める。関連: `service`、`listener`、`subscriber`も参照。 | [`axum`の`Handler`](https://docs.rs/axum/latest/axum/handler/trait.Handler.html)、[`notify`の`EventHandler`](https://docs.rs/notify/latest/notify/trait.EventHandler.html) | 名詞 | 通信 |
| `interceptor` | 要求が処理へ届く前に検査し、必要なら内容を変更するか処理を中断する型に使用する。検査する内容を名前に含める。関連: `layer`も参照。 | [`tonic`の`Interceptor`](https://docs.rs/tonic/latest/tonic/service/interceptor/trait.Interceptor.html) | 名詞 | 通信 |
| `widget` | 画面へ描画する部品を表す型に使用する。描画する対象を名前に含める。 | [`ratatui`の`Widget`](https://docs.rs/ratatui/latest/ratatui/widgets/trait.Widget.html) | 名詞 | 表示 |
| `tokenizer` | 自然言語や検索対象の文字列を、単語、サブワード、検索語などの処理単位へ分割する型に使用する。 | [`tokenizers`の`Tokenizer`](https://docs.rs/tokenizers/latest/tokenizers/tokenizer/struct.Tokenizer.html) | 名詞 | 解析 |
| `lexer` | プログラム言語や独自言語の入力文字列を、識別子、数値、キーワード、記号などの種類付きトークンへ変換する型に使用する。 | [`logos`の`Lexer`](https://docs.rs/logos/latest/logos/struct.Lexer.html) | 名詞 | 解析 |
| `reader` | ファイル、ストリーム、デバイス、メモリなどの入力元からデータを読み取る型に使用する。読み取り位置、部分読み取り、終端、入力バッファの管理を主な責務とする。関連: `writer`も参照。 | [`BufReader`](https://doc.rust-lang.org/std/io/struct.BufReader.html)、[`csv`の`Reader`](https://docs.rs/csv/latest/csv/struct.Reader.html) | 名詞 | 入出力 |
| `writer` | データをファイル、ストリーム、デバイス、メモリなどの出力先へ書き込む型に使用する。部分書き込み、出力バッファ、`flush` の管理を主な責務とする。関連: `reader`も参照。 | [`BufWriter`](https://doc.rust-lang.org/std/io/struct.BufWriter.html)、[`csv`の`Writer`](https://docs.rs/csv/latest/csv/struct.Writer.html) | 名詞 | 入出力 |
| `parser` | 文字列、バイト列、トークン列を、定義された文法や形式に従った構文構造へ変換する型に使用する。区切り、階層、順序、構文上の妥当性の判断を主な責務とする。 | [`clap`の`Parser`](https://docs.rs/clap/latest/clap/trait.Parser.html) | 名詞 | 解析 |
| `encoder` | 値やPacketを、保存、転送、通信などに使用する符号化表現へ変換する型に使用する。通信ではPacketからFrameを構築する処理や、Frameを送信可能なバイト列へ変換してヘッダー、長さ、区切り、検査値などを付加する処理に使用する。関連: `decoder`、`codec`も参照。 | [`tokio_util::codec`の`Encoder`](https://docs.rs/tokio-util/latest/tokio_util/codec/trait.Encoder.html) | 名詞 | 変換 |
| `decoder` | 符号化された表現を、元の表現または後続処理が利用できる表現へ戻す型に使用する。通信では受信したバイト列からFrameを復元する処理や、Frameの内容を解釈してPacketを生成する処理に使用する。関連: `encoder`、`codec`も参照。 | [`tokio_util::codec`の`Decoder`](https://docs.rs/tokio-util/latest/tokio_util/codec/trait.Decoder.html) | 名詞 | 変換 |
| `codec` | 同じ形式の符号化と復号を一つの型にまとめる場合に使用する。対象の形式を名前に含める。関連: `encoder`、`decoder`も参照。 | [`tokio_util`の`LinesCodec`](https://docs.rs/tokio-util/latest/tokio_util/codec/struct.LinesCodec.html) | 名詞 | 変換 |
| `serializer` | プログラム内の構造化された値や型付きオブジェクトを、保存または転送できる表現へ変換する型に使用する。関連: `deserializer`も参照。 | [`serde`の`Serializer`](https://docs.rs/serde/latest/serde/trait.Serializer.html) | 名詞 | 変換 |
| `deserializer` | 保存または転送された表現から、プログラム内で使用する構造化された値や型付きオブジェクトを生成する型に使用する。関連: `serializer`も参照。 | [`serde`の`Deserializer`](https://docs.rs/serde/latest/serde/trait.Deserializer.html) | 名詞 | 変換 |
| `record` | CSVの1行、ログの1件、固定長データの1件など、複数のフィールドから構成される1つの論理単位を表す型に使用する。文字列のフィールドを保持する場合は `StringRecord`、未変換のバイト列を保持する場合は `ByteRecord` を使用する。 | [`StringRecord`](https://docs.rs/csv/latest/csv/struct.StringRecord.html)、[`ByteRecord`](https://docs.rs/csv/latest/csv/struct.ByteRecord.html) | 名詞 | データ |
| `snapshot` | ある時点の状態を写した読み取り専用の値を表す型に使用する。写した後は、元の状態の変化に影響されない。 | [`iceberg`の`Snapshot`](https://docs.rs/iceberg/latest/iceberg/spec/struct.Snapshot.html) | 名詞 | データ |
| `id` | 識別子を表す型の名前は `id` で終える。識別する対象を名前に含め、生の文字列や整数のまま扱わない。 | [`quinn`の`ConnectionId`](https://docs.rs/quinn-proto/latest/quinn_proto/struct.ConnectionId.html) | 名詞 | データ |
| `event` | すでに起きた出来事を表す型に使用する。名前は過去形にする。 | [`winit`の`Event`](https://docs.rs/winit/latest/winit/event/enum.Event.html) | 名詞 | データ |
| `config` | 動作を決める設定値と、使用する実装の指定をまとめる型に使用する。適用範囲が異なる設定は範囲ごとに型を分け、その範囲を名前に含める。 | [`config`の`Config`](https://docs.rs/config/latest/config/struct.Config.html)、[AWS SDK for Rustの`SdkConfig`](https://docs.rs/aws-config/latest/aws_config/struct.SdkConfig.html)、[`quinn`の`EndpointConfig`](https://docs.rs/quinn/latest/quinn/struct.EndpointConfig.html)、[`ClientConfig`](https://docs.rs/quinn/latest/quinn/struct.ClientConfig.html)、[`TransportConfig`](https://docs.rs/quinn/latest/quinn/struct.TransportConfig.html) | 名詞 | データ |
| `formatter` | 値を人が読むための文字列表現へ整形する型に使用する。 | [`fmt::Formatter`](https://doc.rust-lang.org/std/fmt/struct.Formatter.html) | 名詞 | 変換 |
| `validate` | 入力が形式、範囲、不変条件などの制約を満たすか検証する操作に使用する。検証専用の型を作らず、検証対象の型へ実装する。 | [`validator`の`Validate`](https://docs.rs/validator/latest/validator/trait.Validate.html) | 動詞 | 解析 |
| `loader` | 外部の保存場所からデータを取得し、必要に応じて読み取り、解析、復号、デシリアライズを組み合わせて、利用可能な値を生成する高水準の型に使用する。 | [AWS SDK for Rustの`ConfigLoader`](https://docs.rs/aws-config/latest/aws_config/struct.ConfigLoader.html)、[`bevy`の`AssetLoader`](https://docs.rs/bevy_asset/latest/bevy_asset/trait.AssetLoader.html) | 名詞 | 入出力 |
| `list` | 順序があり、重複を許可する要素の集合を表す型に使用する。 | [`LinkedList`](https://doc.rust-lang.org/std/collections/struct.LinkedList.html) | 名詞 | 集合 |
| `set` | 重複を許可せず、順序を保証しない要素の集合を表す型に使用する。 | [`HashSet`](https://doc.rust-lang.org/std/collections/struct.HashSet.html)、[`BTreeSet`](https://doc.rust-lang.org/std/collections/struct.BTreeSet.html) | 名詞 | 集合 |
| `map` | キーと値の対応を保持し、順序を保証しない集合を表す型に使用する。 | [`HashMap`](https://doc.rust-lang.org/std/collections/struct.HashMap.html)、[`BTreeMap`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html) | 名詞 | 集合 |
| `store` | 読み書きの両方が発生し、順序を問わない状態またはデータの保持場所を表す型に使用する。保持する対象を名前に含める。 | [`rustls`の`RootCertStore`](https://docs.rs/rustls/latest/rustls/struct.RootCertStore.html)、[`ClientSessionStore`](https://docs.rs/rustls/latest/rustls/client/trait.ClientSessionStore.html) | 名詞 | データ |
| `repository` | データをDB、ファイルなどの永続化ストレージへ保存し、取得する契約に使用する。利用側が必要とする操作だけを公開し、保存方式は実装へ閉じ込める。実装の名前には保存先を含める。 | axumの[`UserRepo` / `InMemoryUserRepo`](https://github.com/tokio-rs/axum/blob/main/examples/dependency-injection/src/main.rs) | 名詞 | データ |
| `registry` | 名前やキーによって要素を登録、照会し、何が登録されているかをメモリ上で管理する型に使用する。 | [`tracing_subscriber`の`Registry`](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/registry/struct.Registry.html) | 名詞 | データ |
| `transaction` | 複数の操作をまとめて確定または取消しする境界を表す型に使用する。 | [`sqlx`の`Transaction`](https://docs.rs/sqlx/latest/sqlx/struct.Transaction.html) | 名詞 | データ |
| `clock` | 現在時刻または経過時間を供給する型に使用する。実装の名前には、供給元と時刻の性質を含める。 | [`wasmtime_wasi`の`HostWallClock`](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/clocks/trait.HostWallClock.html)、[`HostMonotonicClock`](https://docs.rs/wasmtime-wasi/latest/wasmtime_wasi/clocks/trait.HostMonotonicClock.html) | 名詞 | リソース |
| `provider` | 要求に応じて、値または使用する実装を取得、生成して供給する型に使用する。何を供給するかを名前に含める。 | [`rustls`の`TimeProvider`](https://docs.rs/rustls/latest/rustls/time_provider/trait.TimeProvider.html)、[`CryptoProvider`](https://docs.rs/rustls/latest/rustls/crypto/struct.CryptoProvider.html)、[AWS SDK for Rustの`SharedCredentialsProvider`](https://docs.rs/aws-credential-types/latest/aws_credential_types/provider/struct.SharedCredentialsProvider.html) | 名詞 | データ |
| `generator` | 新しい値や表現を生成する型に使用する。生成する対象を名前に含めるか、生成対象が文脈から決まるモジュールへ置く。 | [`ruff_python_codegen`の`Generator`](https://docs.rs/ruff_python_codegen/latest/ruff_python_codegen/struct.Generator.html) | 名詞 | 生成 |
| `rng` | 乱数を供給する型に使用する。再現可能な生成が必要な場合は、種を指定する生成手段を併せて提供する。 | [`Rng`](https://docs.rs/rand_core/latest/rand_core/trait.Rng.html) | 名詞 | 生成 |
| `mock` | テストのために、本物の実装や値を差し替える型に使用する。差し替える対象を名前に含める。関連: `fake`も参照。 | [`axum`の`MockConnectInfo`](https://docs.rs/axum/latest/axum/extract/connect_info/struct.MockConnectInfo.html) | 名詞 | 検証 |
| `fake` | テストのために本物の実装を置き換える、動作する簡易な代替実装に使用する。置き換える対象を名前に含める。関連: `mock`も参照。 | Zedの[`FakeAcpAgentServer` / `FakeAcpConnectionHarness`](https://github.com/zed-industries/zed/blob/main/crates/agent_servers/src/acp.rs) | 名詞 | 検証 |
| `client` | 外部へ要求を送信し応答を受け取る窓口となる型に使用する。接続先のサービスを名前に含める。プロトコルを実装する場合は、接続を開始する側の端点を表す型に使用する。関連: `server`、`endpoint`も参照。 | [`aws-sdk-s3`の`Client`](https://docs.rs/aws-sdk-s3/latest/aws_sdk_s3/struct.Client.html)、[`aws-sdk-dynamodb`の`Client`](https://docs.rs/aws-sdk-dynamodb/latest/aws_sdk_dynamodb/struct.Client.html)、[`reqwest`の`Client`](https://docs.rs/reqwest/latest/reqwest/struct.Client.html)、[`kube`の`Client`](https://docs.rs/kube/latest/kube/struct.Client.html)、[`s2n_quic`の`Client`](https://docs.rs/s2n-quic/latest/s2n_quic/client/struct.Client.html) | 名詞 | 通信 |
| `server` | プロトコルを実装する場合に、接続を受け付ける側の端点を表す型に使用する。受け付けた接続の設定と資源をこの型が持ち、待ち受けそのものを担う型と区別する。関連: `client`、`endpoint`、`listener`も参照。 | [`s2n_quic`の`Server`](https://docs.rs/s2n-quic/latest/s2n_quic/server/struct.Server.html) | 名詞 | 通信 |
| `transport` | メッセージを運ぶ経路と手段を表す型に使用する。運ぶ内容の意味は扱わず、経路と手段ごとに実装を分ける。関連: `client`も参照。 | [`lettre`の`Transport`](https://docs.rs/lettre/latest/lettre/trait.Transport.html)、[`SmtpTransport`](https://docs.rs/lettre/latest/lettre/transport/smtp/struct.SmtpTransport.html) | 名詞 | 通信 |
| `publisher` | メッセージをトピックまたは購読者へ公開する型に使用する。公開先の方式を実装の名前に含める。関連: `subscriber`、`producer`も参照。 | [`zenoh`の`Publisher`](https://docs.rs/zenoh/latest/zenoh/pubsub/struct.Publisher.html) | 名詞 | 通信 |
| `producer` | メッセージをブローカーまたはキューへ送出する型に使用する。送出先の方式を実装の名前に含める。関連: `consumer`、`publisher`も参照。 | [`rdkafka`の`Producer`](https://docs.rs/rdkafka/latest/rdkafka/producer/trait.Producer.html) | 名詞 | 通信 |
| `subscriber` | トピックを購読してメッセージを受け取り、処理する型に使用する。購読元の方式を実装の名前に含める。関連: `publisher`、`consumer`も参照。 | [`zenoh`の`Subscriber`](https://docs.rs/zenoh/latest/zenoh/pubsub/struct.Subscriber.html) | 名詞 | 通信 |
| `consumer` | ブローカーまたはキューからメッセージを受け取って処理する型に使用する。取得元の方式を実装の名前に含める。関連: `producer`、`subscriber`も参照。 | [`rdkafka`の`Consumer`](https://docs.rs/rdkafka/latest/rdkafka/consumer/trait.Consumer.html) | 名詞 | 通信 |
| `pool` | 再利用可能なリソースの集合を表す型に使用する。 | [`sqlx`の`Pool`](https://docs.rs/sqlx/latest/sqlx/struct.Pool.html) | 名詞 | リソース |
| `cache` | TTL、容量制限、無効化規則を持つ一時保持を表す型に使用する。 | [`moka`の`Cache`](https://docs.rs/moka/latest/moka/sync/struct.Cache.html) | 名詞 | データ |
| `buffer`、`buf` | バイト列や要素を一時的に蓄積する型に使用する。短縮形の`buf`も同じ意味で使用し、標準ライブラリや外部crateの慣例に合わせる場合に使う。 | [`arrow`の`MutableBuffer`](https://docs.rs/arrow-buffer/latest/arrow_buffer/buffer/struct.MutableBuffer.html)、[`tokio`の`ReadBuf`](https://docs.rs/tokio/latest/tokio/io/struct.ReadBuf.html)、[`bytes`の`BufMut`](https://docs.rs/bytes/latest/bytes/buf/trait.BufMut.html) | 名詞 | データ |
| `table` | 行またはエントリの集合を、テーブル構造として参照、検索する型に使用する。 | [`datafusion`の`MemTable`](https://docs.rs/datafusion/latest/datafusion/datasource/memory/struct.MemTable.html) | 名詞 | データ |
| `queue` | FIFOが保証され、順序が意味を持つ集合を表す型に使用する。 | [`crossbeam`の`SegQueue`](https://docs.rs/crossbeam/latest/crossbeam/queue/struct.SegQueue.html) | 名詞 | 集合 |
| `stack` | 重なり順のように、前後の並び自体が意味を持つ集合を表す型に使用する。並べる対象を名前に含める。 | [`bevy`の`UiStack`](https://docs.rs/bevy_ui/latest/bevy_ui/struct.UiStack.html) | 名詞 | データ |
| `new` | 型を生成する標準的なコンストラクターに使用する。 | [`String::new`](https://doc.rust-lang.org/std/string/struct.String.html#method.new) | 形容詞 | 生成 |
| `options` | 生成や実行時に指定する任意設定をまとめる型に使用する。既定値を持ち、必要な項目だけを変更できる構造にする。 | [`OpenOptions`](https://doc.rust-lang.org/std/fs/struct.OpenOptions.html)、[`sqlx`の`PgConnectOptions`](https://docs.rs/sqlx/latest/sqlx/postgres/struct.PgConnectOptions.html) | 名詞 | 生成 |
| `builder` | 値を段階的に組み立てて生成する型に使用する。組み立てる対象を名前に含める。 | [`thread::Builder`](https://doc.rust-lang.org/std/thread/struct.Builder.html)、[`tokio`の`runtime::Builder`](https://docs.rs/tokio/latest/tokio/runtime/struct.Builder.html)、[`reqwest`の`ClientBuilder`](https://docs.rs/reqwest/latest/reqwest/struct.ClientBuilder.html) | 名詞 | 生成 |
| `default` | デフォルト値によって型を生成するコンストラクターに使用する。`new` と両方を提供する場合は、同じ結果になるようにする。 | [`Default::default`](https://doc.rust-lang.org/std/default/trait.Default.html#tymethod.default) | 形容詞 | 生成 |
| `with` + 設定名 | 追加の初期設定を指定する副コンストラクターに使用する。 | [`Vec::with_capacity`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.with_capacity) | 前置詞 | 生成 |
| `from` | 既存データの意味や形式を示しながら、ある型や表現を別の型や表現へ変換する場合に使用する。フィールド間の対応付けを含め、変換専用の型を作らず、変換元または変換先の型へ言語標準の変換機構またはコンストラクターとして実装する。関連: `try_from`も参照。 | [`From`](https://doc.rust-lang.org/std/convert/trait.From.html)、[`String::from_utf8`](https://doc.rust-lang.org/std/string/struct.String.html#method.from_utf8) | 前置詞 | 変換 |
| `try_from` | 失敗しうる変換に使用する。変換できない入力を戻り値で表し、成功を前提とする`from`と区別する。関連: `from`も参照。 | [`TryFrom`](https://doc.rust-lang.org/std/convert/trait.TryFrom.html) | 前置詞 | 変換 |
| `open` | 既存のファイルやデバイスなどを開き、利用可能な外部リソースを取得する処理に使用する。 | [`File::open(path)`](https://doc.rust-lang.org/std/fs/struct.File.html#method.open) | 動詞 | 生成 |
| `create` | 新しいファイル、ディレクトリ、リソースなどを生成する処理に使用する。 | [`File::create(path)`](https://doc.rust-lang.org/std/fs/struct.File.html#method.create) | 動詞 | 生成 |
| `connect` | リモートの接続先との通信路を確立する処理に使用する。 | [`TcpStream::connect(address)`](https://doc.rust-lang.org/std/net/struct.TcpStream.html#method.connect) | 動詞 | 生成 |
| `bind` | ローカルのアドレス、ポート、名前などへリソースを関連付ける処理に使用する。 | [`UdpSocket::bind(address)`](https://doc.rust-lang.org/std/net/struct.UdpSocket.html#method.bind) | 動詞 | 生成 |
| `as` + 型名 | コストなしで同じデータを別の型として参照する変換に使用する。 | [`as_bytes`](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes) | 前置詞 | 変換 |
| `to` + 型名 | コピー、割り当て、検査、計算などを伴い、新しい値または別表現を生成する変換に使用する。 | [`to_vec`](https://doc.rust-lang.org/std/primitive.slice.html#method.to_vec) | 前置詞 | 変換 |
| `into` + 型名 | 元の値の所有権または管理責任を移して別の型へ変換する場合に使用する。所有権の概念がない言語では、元の値を消費する変換に使用する。 | [`into_bytes`](https://doc.rust-lang.org/std/string/struct.String.html#method.into_bytes) | 前置詞 | 変換 |
| `try` + 操作名 | 通常版と対になり、待機、ブロック、パニックなどを避けて失敗を戻り値として返す代替操作に使用する。 | [`try_lock`](https://doc.rust-lang.org/std/sync/struct.Mutex.html#method.try_lock) | 動詞 | 制御 |
| `checked` + 演算名 | 演算結果が表現できる範囲を超える場合に、失敗を戻り値として返す処理に使用する。 | [`u32::checked_add`](https://doc.rust-lang.org/std/primitive.u32.html#method.checked_add) | 動詞句 | 制御 |
| `saturating` + 演算名 | 演算結果が表現できる範囲を超える場合に、上限または下限で止めた値を返す処理に使用する。 | [`u32::saturating_add`](https://doc.rust-lang.org/std/primitive.u32.html#method.saturating_add) | 動詞句 | 制御 |
| `wrapping` + 演算名 | 演算結果が表現できる範囲を超える場合に、あふれた分を切り捨てた値を返す処理に使用する。 | [`u32::wrapping_add`](https://doc.rust-lang.org/std/primitive.u32.html#method.wrapping_add) | 動詞句 | 制御 |
| `spawn` | 独立して実行されるスレッド、タスク、プロセスなどを開始する処理に使用する。開始した処理を監視または終了待機する必要がある場合は、`handle` を返す。 | [`thread::spawn`](https://doc.rust-lang.org/std/thread/fn.spawn.html) | 動詞 | 制御 |
| `take` | 保持している値を取り出し、元の場所を空の状態または既定値へ置き換える処理に使用する。 | [`mem::take`](https://doc.rust-lang.org/std/mem/fn.take.html) | 動詞 | 制御 |
| `replace` | 保持している値を新しい値へ置き換え、以前の値を返す処理に使用する。 | [`mem::replace`](https://doc.rust-lang.org/std/mem/fn.replace.html) | 動詞 | 制御 |
| `push` | 単一要素を末尾に追加する処理に使用する。 | [`push(item)`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.push) | 動詞 | 集合 |
| `push_front` | 順序が重要なコレクションの先頭へ単一要素を追加する処理に使用する。 | [`push_front(item)`](https://doc.rust-lang.org/std/collections/struct.VecDeque.html#method.push_front) | 動詞句 | 集合 |
| `pop` | 末尾の要素を取り出す処理に使用する。 | [`pop()`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.pop) | 動詞 | 集合 |
| `pop_front` | 順序が重要なコレクションの先頭要素を取り出す処理に使用する。 | [`pop_front()`](https://doc.rust-lang.org/std/collections/struct.VecDeque.html#method.pop_front) | 動詞句 | 集合 |
| `front` | 先頭要素への参照を返す処理に使用する。 | [`front()`](https://doc.rust-lang.org/std/collections/struct.VecDeque.html#method.front) | 名詞 | 集合 |
| `back` | 末尾要素への参照を返す処理に使用する。 | [`back()`](https://doc.rust-lang.org/std/collections/struct.VecDeque.html#method.back) | 名詞 | 集合 |
| `insert` | 指定した位置またはキーへ要素を挿入する処理に使用する。 | [`insert(index, item)`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.insert) | 動詞 | 集合 |
| `remove` | 指定した位置またはキーの要素を取り出して削除する処理に使用する。 | [`remove(index)`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.remove) | 動詞 | 集合 |
| `retain` | 条件を満たす要素だけを残す処理に使用する。 | [`retain(predicate)`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.retain) | 動詞 | 集合 |
| `drain` | 指定範囲または全要素を集合から一括して取り出す処理に使用する。 | [`drain(range)`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.drain) | 動詞 | 集合 |
| `clear` | 全要素を削除して空にする処理に使用する。 | [`clear()`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.clear) | 動詞 | 集合 |
| `extend` | イテレーターや別の集合から複数の要素を追加する処理に使用する。 | [`extend(items)`](https://doc.rust-lang.org/std/iter/trait.Extend.html#tymethod.extend) | 動詞 | 集合 |
| `iter` | コレクションの反復子を返す処理に使用する。可変参照を返す場合は `iter_mut`、所有権を渡す場合は `into_iter` を使う。 | [`slice::iter`](https://doc.rust-lang.org/std/primitive.slice.html#method.iter)、[`iter_mut`](https://doc.rust-lang.org/std/primitive.slice.html#method.iter_mut) | 動詞 | 集合 |
| `len` | 要素数を返す処理に使用する。 | [`len()`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.len) | 名詞 | 集合 |
| `is_empty` | 集合が空かどうかを判定する処理に使用する。 | [`is_empty()`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.is_empty) | 動詞句 | 集合 |
| `contains` | 指定した要素またはキーを含むか判定する処理に使用する。 | [`contains(item)`](https://doc.rust-lang.org/std/collections/struct.HashSet.html#method.contains) | 動詞 | 集合 |
| `sort` | 要素を規則に従って並べ替える処理に使用する。 | [`sort()`](https://doc.rust-lang.org/std/primitive.slice.html#method.sort) | 動詞 | 集合 |
| `entry` | 指定キーのエントリを返す処理に使用する。存在する場合は既存エントリ、存在しない場合は空エントリを返し、照会と挿入を一度の探索で行えるようにする。 | [`entry(key)`](https://doc.rust-lang.org/std/collections/struct.HashMap.html#method.entry) | 名詞 | 集合 |
| `get_or_insert` | 対応する要素が存在する場合はその要素を返し、存在しない場合は指定値を挿入して返す処理に使用する。 | [`get_or_insert(value)`](https://doc.rust-lang.org/std/option/enum.Option.html#method.get_or_insert)、[`Option::get_or_insert_default`](https://doc.rust-lang.org/std/option/enum.Option.html#method.get_or_insert_default) | 動詞句 | 集合 |
| `or_default` | 対応する要素が存在する場合はその要素を返し、存在しない場合はデフォルト値を挿入して返す処理に使用する。 | [`Entry::or_default`](https://doc.rust-lang.org/std/collections/hash_map/enum.Entry.html#method.or_default) | 動詞句 | 集合 |

---

## 8. エラーハンドリング

### 回復できる失敗とプログラムの誤りを区別する

入力の不正、通信の失敗など、想定内で呼び出し元が対処できる失敗は、戻り値のエラーとして表す。不変条件の破れなど、続行しても意味がない誤りは、その場で処理を打ち切る。

### エラー型はモジュール、レイヤーごとに定義する

エラー型はモジュール、レイヤーごとに定義し、上位へ渡すときにそのレイヤーの型へ変換して伝播させる。

エラー型には、何に失敗したかと、原因となった下位のエラーを保持する。原因を捨てると、上位に届いた時点で調査の手がかりがなくなる。

### エラーの無視を禁止する

呼び出し元が戻り値やエラーコードを必ず確認できる設計にする。未確認の戻り値を警告する仕組みが言語にある場合は有効にする。

### 対処できる場所まで伝播させる

エラーは、ログに記録する文脈が揃う境界まで伝播させる。発生場所では、誰のどの処理で起きたのかが分からない。

---

## 9. 並行処理

### メインスレッドを長時間占有しない

メインスレッドでは、完了時間を予測できない同期処理や、長時間または連続的にスレッドを占有する処理を行わない。I/O、重い計算、ロック待ち、同期IPCなどは別スレッドで実行する。メインスレッドが詰まると、画面の停止や入力の取りこぼしとして利用者に直接現れる。

### 状態の共有よりメッセージパッシングを優先する

スレッド、タスク間でデータを受け渡すときは、メモリの共有よりチャネルなどのメッセージパッシングを優先する。

### 共有する状態はロックで保護し、取得順序を決める

共有リソースへのアクセスはミューテックス、セマフォなどで保護する。複数のロックを取得する場合は、全体で同じ順序を守り、デッドロックを防ぐ。

ロックを保持したまま、I/Oや別のロックの取得など、完了時間を予測できない処理を行わない。待ち時間のあいだ、他のスレッドやタスクを止め続けることになる。

### 待機は通知の仕組みで行う

イベントやデータの到着を待つ処理は、チャネル、キュー、条件変数、セマフォ、シグナル、割り込みなど、通知を受け取って待機を解く仕組みで実装する。状態を繰り返し確認するポーリングループは、待つあいだCPUを消費し、応答も確認間隔のぶん遅れる。

通知の仕組みを持たない対象を監視する場合に限りポーリングを使い、確認間隔と打ち切り条件を決めたうえで行う。

### タイムアウトを設定する

すべての外部I/Oとブロッキング操作にタイムアウトを設定する。応答が返らない相手を無期限に待つと、原因の分からない停止になる。

---

## 10. ログ

### ログを記録する場所

| 項目 | タイミング | 説明 |
| --- | --- | --- |
| エラーログ | 失敗が誰のどの操作に対するものか判断できる最外郭の処理へ到達したとき | ハンドラー、エントリーポイントなどの境界で、一つの失敗につき1回だけ出力する。下位では出力せず、エラーを上位へ伝播させる。エラーの種類とメッセージは別々の項目として記録し、スタックトレースを取得できる環境ではこれも別の項目として出力する。種類が項目として分かれていないと、発生箇所と種類による絞り込みができない。 |
| 監視のイベントログ | 監視対象の出来事を観測したとき | エラーログの回数制限の対象外とし、センサーの異常などを出来事ごとに記録する。 |
| 性能分析のイベントログ | 計測対象の出来事を観測したとき | エラーログの回数制限の対象外とし、処理時間や資源の利用状況に関わる出来事ごとに記録する。 |
| 監査のイベントログ | ログイン、権限の変更、設定の変更、データの更新と削除など、後から誰の操作かを説明する必要がある出来事を観測したとき | エラーログの回数制限の対象外とし、操作者、対象、変更前後の値とともに出来事ごとに記録する。業務上の記録であり、調査用のログと同じ扱いで無効化しない。 |
| UIの操作ログ | 画面遷移、押下、入力の確定など、利用者の操作を観測したとき | 画面と操作した要素の識別子を項目として出力する。識別子がないと、どの画面のどの操作から処理が始まったのかを後から特定できない。 |
| 完了までに時間がかかる処理 | 開始時、完了時、失敗時 | タスクなどの開始、完了、失敗をそれぞれ別のイベントとして記録する。例: `import.started`、`import.completed`、`import.failed` |
| 外部システムの呼び出し | 開始時、完了時、失敗時 | 通信の開始、完了、失敗をそれぞれ別のイベントとして記録する。 |

### 構造化して出力する

ログは、項目ごとに分けて機械処理できる形式で出力し、値をメッセージの文章へ埋め込まない。形式はJSONに限らず、出力経路と収集先が扱えるものを選ぶ。出力帯域やメモリが限られる環境では、識別子と値だけを送り、文字列化を受信側で行う方式（辞書方式、遅延フォーマット）を使う。

### 記録する項目

| 項目 | 要否 | 説明 | 例 |
| --- | --- | --- | --- |
| 時刻 | 実時刻を取得できる場合は必須 | 出来事が発生した時刻を、タイムゾーンを含めて記録する。 | `2026-01-31T09:12:45.123+09:00` |
| 起動からの経過時間 | 実時刻を取得できない場合は必須 | 起動後に経過した時間を記録する。 | `12345`（ミリ秒） |
| 起動識別子 | 実時刻を取得できない場合は必須 | 起動からの経過時間とともに、起動ごとに変わる識別子を記録する。 | `boot-7f3a1c9e` |
| レベル | 必須 | 出来事の重大度を「ログレベル」の区分で記録する。 | `ERROR` |
| イベント名 | 必須 | 出来事の種類を表す固定の識別子を記録する。過去形または結果を表す語を使い、小文字とドット区切りで名前空間を付ける。 | `user.created`、`sensor.read.failed` |
| 実行単位の名前 | 必須 | ログを出力したアプリケーション、サービス、プロセスなどを識別する固定の名前を記録する。 | `payment-api` |
| トレースID | 条件付き | 複数の処理や外部システムの呼び出しをまたぐ一連の処理を追跡する場合に記録する。 | `4bf92f3577b34da6a3ce929d0e0e4736` |
| リクエストID | 条件付き | 一つの要求に対する処理を追跡する場合に記録する。 | `req-8f4a2b` |
| セッションID | 条件付き | 一つの利用セッションに属する処理を追跡する場合に記録する。 | `sess-3f9c1a` |
| 利用者ID | 条件付き | 処理を要求した利用者を識別する必要がある場合に記録する。 | `user-10482` |
| テナントID | 条件付き | 処理が属するテナントを識別する必要がある場合に記録する。 | `tenant-acme` |
| デバイスID | 条件付き | 処理または出来事が発生したデバイスを識別する必要がある場合に記録する。 | `device-0a1b2c` |
| ノードID | 条件付き | 分散して動作するノードを識別する必要がある場合に記録する。 | `node-03` |
| タスクID | 条件付き | 非同期タスクやジョブを識別する必要がある場合に記録する。 | `task-2481` |
| 所要時間 | 条件付き | 完了した処理にかかった時間を性能分析や監視に使用する場合に記録する。 | `1250`（ミリ秒） |
| 件数 | 条件付き | 処理した対象や結果の数量を記録する必要がある場合に記録する。 | `120` |
| 応答コード | 条件付き | 外部システムの応答や処理結果をコードで識別する場合に記録する。 | `503` |

### ログレベル

プラットフォームやフレームワークが提供する定義を優先する。

| レベル | 用途 | 本番の既定 |
| --- | --- | --- |
| FATAL | 継続できず、実行を停止する異常 | 有効 |
| ERROR | 処理が失敗し、対処が必要な事象 | 有効 |
| WARN | 処理は継続できるが、確認が必要な事象。リトライ、上限への接近など | 有効 |
| INFO | 業務上または運用上意味のある出来事。ログイン、注文の作成、タスクの開始と完了など | 有効 |
| DEBUG | 調査に使う内部情報 | 無効 |
| TRACE | 関数の入出力、問い合わせの開始と終了など、最も細かい追跡情報 | 無効 |

### 出力量を抑える

高頻度で繰り返す事象は、発生ごとに出力せず、一定時間あたりの回数へ集約するか、流量を制限する。ログの出力自体が処理の遅延や取りこぼしの原因にならないよう、書き出しは業務処理から切り離す。停止に至る異常だけは、失われないように同期的に書き出す。

### 出力しない情報

- パスワード、APIキー、シークレット、トークン、認証ヘッダー、秘密鍵は出力しない
- 個人情報は識別子で代替する。やむを得ず含める場合はマスクする。例: `abcd****xyz`
- 問い合わせ文、要求と応答の本文をそのまま出力しない。対象、件数、所要時間など、調査に必要な項目へ置き換える
- 調査のために一時的に追加したログをリリースコードへ残さない

---

## 11. コードコメント

### 記述の基準

- コメントは最小限にする。コードを読めば分かることではなく、そう書いた理由を書く
- コメントアウトしたコードは残さない。復元はバージョン管理の履歴に任せる
- 暫定的な固定値には `TODO:` を付け、その値の意味と、変更が必要になる理由を書く
- コメントは英語で書き、語彙は平易なものにとどめる

### コメントでコードを区切らない

装飾的なコメントブロック（`# ===== Title =====` など）でコードのセクションを区切らない。

処理のまとまりに見出しコメントが必要だと判断した場合は、コメントを書かず、そのまとまりを適切な名前の関数やクラスへ抽出する。

### ドキュメントコメントの対象

利用側へ公開するAPIには、ドキュメントコメントを書く。内部実装を分割する都合で公開範囲を広げているだけの要素は、対象に含めない。

### 実行例を記載する

公開APIのドキュメントコメントには、呼び出し方と実行結果の関係が分かる実行例を記載する。実行例の書式は、使用する言語またはドキュメント生成ツールの標準に従う。自動検証できる場合は、テストで実行例の正しさを確認する。

---

## 12. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 3. 依存関係の管理 | [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) | 依存性注入とService Locatorを比較し、構成と利用の分離を説明する。 |
| 3. 依存関係の管理 | [Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/) | Composition Rootをアプリケーションの起動点付近に置き、アプリケーションごとに一つ設ける考え方を説明する。 |
| 3. 依存関係の管理 | [Architectural principles - .NET](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles) | Dependency Inversionと依存関係の明示を、上位の方針と下位の実装詳細の依存方向から説明する。 |
| 3. 依存関係の管理 | [Dependency injection guidelines - .NET \| Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines) | 明示的な依存性注入、Service Locatorの回避、依存関係のライフサイクルを説明する。 |
| 3. 依存関係の管理 | [Dependency Injection :: Spring Framework](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html) | コンストラクター注入とコンテナーによる依存関係の構成を説明する。 |
| 3. 依存関係の管理 | [Cargo `Executor`](https://github.com/rust-lang/cargo/blob/75d17360928f57ff2a7d2f2da1c753f5fe1926d1/src/compiler/mod.rs#L130-L153) | 「具体的な実装に直接依存せず、抽象に依存する」のコード例の抜粋元。契約の定義。掲載時に既定実装を持つ`init`と`force_rebuild`を削っている。 |
| 3. 依存関係の管理 | [Cargo `ops::compile`](https://github.com/rust-lang/cargo/blob/75d17360928f57ff2a7d2f2da1c753f5fe1926d1/src/ops/cargo_compile/mod.rs#L131-L137) | 同じコード例の抜粋元。差し替えを必要としない呼び出しが`DefaultExecutor`を選ぶ箇所。 |
| 3. 依存関係の管理 | [Cargo `main`](https://github.com/rust-lang/cargo/blob/75d17360928f57ff2a7d2f2da1c753f5fe1926d1/src/bin/cargo/main.rs#L17-L58) | 起動点で`GlobalContext`を生成し、CLIの実行処理へ渡す実装。 |
| 3. 依存関係の管理 | [ripgrep `search`](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/core/main.rs#L113-L141) | 「依存関係を明示的に受け渡す」のコード例の抜粋元。掲載時に統計と打ち切り、エラーの分岐を削っている。 |
| 3. 依存関係の管理 | [ripgrep `SearchWorker::search_preprocessor`](https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/core/search.rs#L294-L324) | 「起動点で依存関係を構成する」の操作単位の資源を示すコード例の抜粋元。掲載時にエラーへの文脈付与（`map_err`）を削っている。 |
| 3. 依存関係の管理 | [Google Cloud Rust Storage `ClientBuilder`](https://github.com/googleapis/google-cloud-rust/blob/714e6ba9c814bdd97b19db014aeae7900f5639e1/src/storage/src/storage/client.rs#L388-L608) | Storage固有のClientが、接続先、認証情報、リトライなどの設定を共通の`ClientConfig`へ渡し、GAXのHTTPおよびgRPC通信層を構成する実装。 |
| 3. 依存関係の管理 | [Google Cloud Rust GAX `ClientBuilder`](https://github.com/googleapis/google-cloud-rust/blob/714e6ba9c814bdd97b19db014aeae7900f5639e1/src/gax/src/client_builder.rs#L145-L425) | サービスごとのClientBuilderに共通する接続先、認証情報、リトライ、タイムアウトの設定機構を提供する実装。 |
| 3. 依存関係の管理 | [rust-analyzer `GlobalState`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/global_state.rs#L86-L338) | 「共有状態は実行責務とライフサイクルでまとめる」のコード例の抜粋元。掲載時に約40あるフィールドと、その生成のうち4つ以外を削っている。 |
| 3. 依存関係の管理 | [rust-analyzer `GlobalState::run`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/main_loop.rs#L177-L218) | 同じコード例の抜粋元。状態を所有する型自身がイベントループを回す箇所。掲載時に起動時の登録処理と終了通知の判定を削っている。 |
| 3. 依存関係の管理 | [rust-analyzer `GlobalState::snapshot`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/global_state.rs#L574-L588) | 同じコード例の抜粋元。状態から読み取り用の値を写す箇所。掲載時に写す12フィールドのうち2つ以外を削っている。 |
| 3. 依存関係の管理 | [rust-analyzer `GlobalState::update_tests`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/main_loop.rs#L792-L800) | 所有した値を取り出して使うコード例の抜粋元。タスクプールへ、状態から作った読み取り用の値を渡して実行する。 |
| 3. 依存関係の管理 | [axum `State`のSubstates](https://github.com/tokio-rs/axum/blob/3d78036dcac289d6c1d54934708acb6a5bd73686/axum/src/extract/state.rs#L169-L215) | 部分状態を受け取るコード例の抜粋元。`FromRef`で共有状態から必要な値だけを取り出す。 |
| 3. 依存関係の管理 | [axum `examples/dependency-injection`](https://github.com/tokio-rs/axum/blob/3d78036dcac289d6c1d54934708acb6a5bd73686/examples/dependency-injection/src/main.rs#L23-L169) | 「起動点で依存関係を構成する」「共有状態は実行責務とライフサイクルでまとめる」のコード例の抜粋元。掲載時にログの初期化と、ジェネリクスで構成したルーターを削っている。 |
| 3. 依存関係の管理 | [State in axum::extract](https://docs.rs/axum/latest/axum/extract/struct.State.html) | フレームワークが要求する共有状態の設定方法と、必要な部分状態を`FromRef`で取り出す方法を説明する。 |
| 3. 依存関係の管理 | [AWS SDK for Rust `SdkConfig`](https://github.com/awslabs/aws-sdk-rust/blob/3e53e326e97f4272ec282ce460aaee77a26f7e30/sdk/aws-types/src/sdk_config.rs#L110-L137) | 「通信の共通処理をサービスごとのClientから分離する」のコード例の抜粋元。掲載時に26あるフィールドのうち6つ以外を削っている。 |
| 3. 依存関係の管理 | [AWS SDK for Rust `load_defaults`の実行例](https://github.com/awslabs/aws-sdk-rust/blob/3e53e326e97f4272ec282ce460aaee77a26f7e30/sdk/aws-config/src/lib.rs#L40-L41) | 「共有可能な通信資源を再利用する」のコード例の抜粋元。組み立てた設定をサービスのClientへ渡す箇所。 |
| 3. 依存関係の管理 | [AWS SDK for Rust `CredentialsProviderChain`](https://github.com/awslabs/aws-sdk-rust/blob/3e53e326e97f4272ec282ce460aaee77a26f7e30/sdk/aws-config/src/default_provider/credentials.rs#L189-L193) | 資格情報を環境変数、プロファイル、実行環境のメタデータの順に解決する構成を確認する。 |
| 3. 依存関係の管理 | [AWS SDK for Rust `region::default_provider`](https://github.com/awslabs/aws-sdk-rust/blob/3e53e326e97f4272ec282ce460aaee77a26f7e30/sdk/aws-config/src/default_provider/region.rs#L19-L21) | 接続先リージョンの探索元と順序を確認する。 |
| 3. 依存関係の管理 | [rust-analyzer `main`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/bin/main.rs#L28-L38) | 抜粋元の`unwrap()`を`?`へ変えた際の、起動点が`anyhow::Result`を返す書き方の出典。 |
| 6. 設計パターン | [axum `examples/dependency-injection`](https://github.com/tokio-rs/axum/blob/3d78036dcac289d6c1d54934708acb6a5bd73686/examples/dependency-injection/src/main.rs#L150-L169) | 「保存先を交換する場合はRepositoryへ分離する」のコード例の抜粋元。掲載時に実装の本体と`#[derive(..)]`を削っている。 |
| 6. 設計パターン | [Repository](https://martinfowler.com/eaaCatalog/repository.html) | 永続化されたデータを、コレクションのように扱う境界として分離する構造を説明する。 |
| 7. 命名 | [rust-analyzer `handle_workspace_reload`](https://github.com/rust-lang/rust-analyzer/blob/70d74f4d134c45b073c82167fb7e7d61334bd8f5/crates/rust-analyzer/src/handlers/request.rs#L60-L67) | 「イベント処理関数名」のコード例の抜粋元。同じモジュールに`handle_completion`、`handle_hover`、`handle_rename`が並ぶ。 |
| 5. 型とカプセル化 | [TellDontAsk](https://martinfowler.com/bliki/TellDontAsk.html) | データを取り出して外側で判断せず、操作を持つ側へ依頼する設計を説明する。 |
| 5. 型とカプセル化 | [ValueObject](https://martinfowler.com/bliki/ValueObject.html) | 値を表す型の不変性と、保持する値による等価性を説明する。 |
| 5. 型とカプセル化 | [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) | 検証結果を型として持ち、不正な値を後段へ持ち込まない設計を説明する。 |
| 6. 設計パターン | [Gateway](https://martinfowler.com/eaaCatalog/gateway.html) | 外部システムや外部資源へのアクセスを1つの型へ包む構造を説明する。 |
| 10. ログ | [Logs Data Model \| OpenTelemetry](https://opentelemetry.io/docs/specs/otel/logs/data-model/) | ログの重大度と構造化項目の標準を定義する。 |
| 10. ログ | [Naming \| OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/general/naming/) | 属性名とイベント名の命名規則を定義する。 |
| 10. ログ | [Exception attributes \| OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/attributes-registry/exception/) | 例外を記録する項目の名称と内容を定義する。 |
| 10. ログ | [Logging Cheat Sheet \| OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | 記録すべき事象と、出力してはならない情報を示す。 |
| 10. ログ | [Logging \| Zephyr Project](https://docs.zephyrproject.org/latest/services/logging/index.html) | 資源が限られる環境での辞書方式、遅延出力、流量制限を示す。 |
| 10. ログ | [App attributes \| OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/app/) | 画面と操作要素の識別子など、UIの操作を記録する項目を定義する。 |
