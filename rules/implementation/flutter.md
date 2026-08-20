# Flutter固有規約

## 1. 概要

本書は、Dartで実装するFlutterアプリケーションの言語、フレームワーク固有規則を定義する。本書は、[共通設計原則](../core/architecture.md)、[アプリケーション設計規則](../core/application-architecture.md)を前提とする。

---

## 2. フォルダ構成

表のパスはリポジトリルートを基準とする。フォルダは配置するファイルが生じた時点で作る。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/pubspec.yaml` | `apps/myproject-client/pubspec.yaml` | パッケージ、アセット、フォント、Flutterの設定を定義する。 |
| `apps/<app-name>/analysis_options.yaml` | `apps/myproject-client/analysis_options.yaml` | Dart Analyzerとlintの設定を定義する。 |
| `apps/<app-name>/l10n.yaml` | `apps/myproject-client/l10n.yaml` | 多言語対応コードの生成元、生成先、基準言語を定義する。 |
| `apps/<app-name>/assets/images/` | `apps/myproject-client/assets/images/placeholder.png` | 画像を配置する。 |
| `apps/<app-name>/assets/icons/` | `apps/myproject-client/assets/icons/app_icon.svg` | アプリケーション内で使用するアイコンを配置する。 |
| `apps/<app-name>/assets/fonts/` | `apps/myproject-client/assets/fonts/NotoSansJP-Regular.ttf` | アプリケーションに同梱するフォントを配置する。 |
| `apps/<app-name>/android/` | `apps/myproject-client/android/app/src/main/AndroidManifest.xml` | Android固有の設定とネイティブコードを配置する。Androidへ配信する場合に使用する。 |
| `apps/<app-name>/ios/` | `apps/myproject-client/ios/Runner/Info.plist` | iOS固有の設定とネイティブコードを配置する。iOSへ配信する場合に使用する。 |
| `apps/<app-name>/web/` | `apps/myproject-client/web/index.html` | Web固有の起動ファイルと設定を配置する。Webへ配信する場合に使用する。 |
| `apps/<app-name>/macos/` | `apps/myproject-client/macos/Runner/Info.plist` | macOS固有の設定とネイティブコードを配置する。macOSへ配信する場合に使用する。 |
| `apps/<app-name>/linux/` | `apps/myproject-client/linux/runner/main.cc` | Linux固有の設定とネイティブコードを配置する。Linuxへ配信する場合に使用する。 |
| `apps/<app-name>/windows/` | `apps/myproject-client/windows/runner/main.cpp` | Windows固有の設定とネイティブコードを配置する。Windowsへ配信する場合に使用する。 |
| `apps/<app-name>/lib/main.dart` | `apps/myproject-client/lib/main.dart` | エントリーポイント。初期化処理を呼び出し、`runApp`を実行する。 |
| `apps/<app-name>/lib/app/app.dart` | `apps/myproject-client/lib/app/app.dart` | `MaterialApp`、`MultiRepositoryProvider`、ルーター、テーマ、多言語対応を接続する。 |
| `apps/<app-name>/lib/app/bootstrap.dart` | `apps/myproject-client/lib/app/bootstrap.dart` | 外部SDKのクライアントと各FeatureのRepositoryを生成し、アプリケーションへ渡す。 |
| `apps/<app-name>/lib/app/router/` | `apps/myproject-client/lib/app/router/app_router.dart` | アプリケーション全体のルーティングを定義する。各Featureの公開APIだけを参照する。 |
| `apps/<app-name>/lib/app/theme/` | `apps/myproject-client/lib/app/theme/app_theme.dart` | Theme、色、文字スタイル、余白など、アプリケーション全体のデザイン値を定義する。 |
| `apps/<app-name>/lib/l10n/` | `apps/myproject-client/lib/l10n/app_ja.arb` | ARB形式の翻訳リソースを配置する。 |
| `apps/<app-name>/lib/l10n/generated/` | `apps/myproject-client/lib/l10n/generated/app_localizations.dart` | `gen_l10n`が生成する多言語対応コードを配置する。手動では編集しない。 |
| `apps/<app-name>/lib/core/` | `apps/myproject-client/lib/core/user_id.dart` | 複数のFeatureにまたがって同じ意味を持つドメイン型とエラー型（Shared Kernel）を配置する。特定のFeatureに閉じた型を、汎用ユーティリティ置き場として先回りして置かない。 |
| `apps/<app-name>/lib/infra/` | `apps/myproject-client/lib/infra/analytics_client.dart` | 業務ロジックを持たない技術基盤（Analytics SDK、Crash Reportingなど）の構築処理を配置する。`app/bootstrap.dart`から呼び出す。 |
| `apps/<app-name>/lib/ui/ui.dart` | `apps/myproject-client/lib/ui/ui.dart` | 複数のFeatureへ公開する、機能固有の判断を持たないUI部品だけを`export`する。 |
| `apps/<app-name>/lib/ui/button/` | `apps/myproject-client/lib/ui/button/primary_button.dart` | ボタンとボタンに付随する表示を配置する。 |
| `apps/<app-name>/lib/ui/form/` | `apps/myproject-client/lib/ui/form/email_field.dart` | 入力欄、選択欄、入力エラー表示を配置する。 |
| `apps/<app-name>/lib/ui/feedback/` | `apps/myproject-client/lib/ui/feedback/error_notice.dart` | ダイアログ、通知、進行表示、空状態、エラー状態を配置する。 |
| `apps/<app-name>/lib/ui/layout/` | `apps/myproject-client/lib/ui/layout/responsive_scaffold.dart` | 画面枠、余白、並び方を制御するWidgetを配置する。 |
| `apps/<app-name>/lib/ui/navigation/` | `apps/myproject-client/lib/ui/navigation/app_navigation_bar.dart` | ナビゲーションバー、タブ、パンくずを配置する。 |
| `apps/<app-name>/lib/ui/list/` | `apps/myproject-client/lib/ui/list/paged_list.dart` | 機能固有の判断を持たない一覧表示を配置する。 |
| `apps/<app-name>/lib/ui/table/` | `apps/myproject-client/lib/ui/table/sortable_table.dart` | 機能固有の判断を持たない表を配置する。 |
| `apps/<app-name>/lib/features/<feature>/<feature>.dart` | `apps/myproject-client/lib/features/auth/auth.dart` | Feature外へ公開する型、Screen、Repositoryの生成関数だけを`export`する。 |
| `apps/<app-name>/lib/features/<feature>/<type>.dart` | `apps/myproject-client/lib/features/auth/auth_session.dart` | Featureが所有する値、状態、識別子、制約を型として定義する。 |
| `apps/<app-name>/lib/features/<feature>/<responsibility>/` | `apps/myproject-client/lib/features/auth/sign_in/` | Feature内の一つの責務に属する型と処理を配置する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/screens/` | `apps/myproject-client/lib/features/auth/presentation/screens/sign_in_screen.dart` | ルーティングの遷移先となるScreenを配置する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/widgets/` | `apps/myproject-client/lib/features/auth/presentation/widgets/password_field.dart` | 同じFeatureの表示で再利用するWidgetを配置する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/bloc/` | `apps/myproject-client/lib/features/auth/presentation/bloc/sign_in_bloc.dart` | Featureの状態管理コードを配置する。採用する状態管理ライブラリ（BLoC、Provider、Riverpodなど）に対応する型（BLoCならEvent、State、BLoC）を配置する。一つのScreenだけが使用する状態はそのScreenで生成し、複数のScreenが使用する状態はその状態を所有する最も近い共通の親で生成する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/` | `apps/myproject-client/lib/features/auth/repositories/auth_repository.dart` | Featureが所有するデータを永続化ストレージへ保存、取得する契約、接続先別の実装、外部データ形式との変換を配置する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<resource>_repository.dart` | `apps/myproject-client/lib/features/auth/repositories/auth_repository.dart` | Featureが必要とするデータ操作をRepositoryの契約として定義する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<connection>_<resource>_repository.dart` | `apps/myproject-client/lib/features/auth/repositories/http_auth_repository.dart` | データベース、端末ストレージなど、接続先別のRepository実装を定義する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<resource>_request.dart` | `apps/myproject-client/lib/features/auth/repositories/sign_in_request.dart` | 外部へ送るデータ形式とFeature内の型からの変換を定義する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<resource>_response.dart` | `apps/myproject-client/lib/features/auth/repositories/auth_session_response.dart` | 外部から受け取るデータ形式とFeature内の型への変換を定義する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<resource>_record.dart` | `apps/myproject-client/lib/features/auth/repositories/auth_session_record.dart` | データベースや端末ストレージへ保存する形式とFeature内の型との変換を定義する。 |
| `apps/<app-name>/lib/features/<feature>/gateways/` | `apps/myproject-client/lib/features/payment/gateways/stripe_payment_gateway.dart` | 永続化以外の外部システム、外部サービス（決済、通知、他サービスのAPIなど）と通信する契約と接続先別の実装を配置する。 |
| `apps/<app-name>/test/ui/` | `apps/myproject-client/test/ui/button/primary_button_test.dart` | `lib/ui/`に配置したUI部品のWidgetテストを配置する。 |
| `apps/<app-name>/test/features/<feature>/<feature>_test.dart` | `apps/myproject-client/test/features/auth/auth_test.dart` | Featureが所有する型の値、状態、識別子、制約を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/<responsibility>/` | `apps/myproject-client/test/features/auth/sign_in/` | Feature内の責務に対応する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/repositories/` | `apps/myproject-client/test/features/auth/repositories/http_auth_repository_test.dart` | Repositoryの変換、キャッシュ、エラー処理を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/gateways/` | `apps/myproject-client/test/features/payment/gateways/stripe_payment_gateway_test.dart` | Gatewayの変換、エラー処理を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/presentation/bloc/<bloc>_test.dart` | `apps/myproject-client/test/features/auth/presentation/bloc/sign_in_bloc_test.dart` | 状態管理コードの状態遷移を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/presentation/screens/<screen>_test.dart` | `apps/myproject-client/test/features/auth/presentation/screens/sign_in_screen_test.dart` | Screenの表示と操作を検証するWidgetテストを配置する。 |
| `apps/<app-name>/test/features/<feature>/presentation/widgets/<widget>_test.dart` | `apps/myproject-client/test/features/auth/presentation/widgets/password_field_test.dart` | Feature内で再利用するWidgetの表示と操作を検証するWidgetテストを配置する。 |
| `apps/<app-name>/integration_test/<feature>_test.dart` | `apps/myproject-client/integration_test/auth_test.dart` | Featureと実際の外部I/Oとの接続を検証する結合テストを配置する。 |
| `apps/<app-name>/integration_test/<flow>_test.dart` | `apps/myproject-client/integration_test/sign_in_test.dart` | 利用者の主要な操作をアプリケーション全体で検証するE2Eテストを配置する。 |

---

## 3. 依存方向

依存方向を次のように固定する。

| 依存元 | 依存先 |
| --- | --- |
| `app/` | 各Featureの公開API、`core/`、`infra/`、`ui/` |
| `core/` | Dart標準ライブラリと外部パッケージのみ |
| `infra/` | 技術基盤の外部SDK、パッケージのみ |
| Screen、Widget | 同じFeatureの状態管理コードと型、`core/`、`ui/` |
| 状態管理コード | 同じFeatureの処理、Repository契約、Gateway契約、型 |
| Feature内の処理 | 同じFeatureのRepository契約、Gateway契約、型、`core/` |
| Repository実装 | Repository契約、同じFeatureの型、外部SDK、外部データ形式 |
| Gateway実装 | Gateway契約、同じFeatureの型、外部SDK |
| `ui/` | Flutter SDKのみ |

外部SDKのクライアント、Repository、Gatewayの実装は`app/bootstrap.dart`で生成し、コンストラクタから明示的に渡す。Repositoryはデータの永続化、Gatewayは永続化以外の外部システムとの連携を担う。

---

## 4. 検証

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | アプリケーション内の全Dartソースコード。 | `dart format -o none --set-exit-if-changed .` |
| 型エラー、静的解析違反、lint違反を検出する。 | アプリケーション内のDartソースコードと解析設定。 | `flutter analyze` |
| ロジック、Repository、状態管理コード、Widgetの振る舞いの破壊を検出する。 | `test/`に配置した単体テストとWidgetテスト。 | `flutter test` |
| Feature、外部I/O、実行環境を結合した主要フローの破壊を検出する。 | `integration_test/`に配置した結合テストとE2Eテスト。 | `flutter test integration_test` |
