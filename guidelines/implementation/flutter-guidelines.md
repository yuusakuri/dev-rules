# Flutter固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [依存方向](#3-依存方向)
4. [検証](#4-検証)
5. [参考資料](#5-参考資料)

---

## 1. 概要

本書は、Dartで実装するFlutterアプリケーションの言語、フレームワーク固有規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)を前提とする。

---

## 2. フォルダ構成

本書において、表示状態の管理にはBLoCを使用する前提で記載する。Provider、Riverpodなどを採用する場合は、`bloc/`をその方式が定める配置へ置き換える。方式が配置を定めない場合は、「参考資料」のFlutterアーキテクチャガイドに合わせて`view_models/`を使用する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/pubspec.yaml` | `apps/myproject-client/pubspec.yaml` | パッケージ、アセット、フォント、Flutterの設定を定義する。生成した多言語対応コードを使用する場合は、`flutter`の`generate`に`true`を指定する。 |
| `apps/<app-name>/analysis_options.yaml` | `apps/myproject-client/analysis_options.yaml` | Dart Analyzerとlintの設定を定義する。 |
| `apps/<app-name>/l10n.yaml` | `apps/myproject-client/l10n.yaml` | 多言語対応コードの`arb-dir`、`template-arb-file`、`output-localization-file`、`output-dir`を定義する。`output-dir`には`arb-dir`と別のディレクトリを指定する。`synthetic-package`を持つバージョンでは`false`を指定する。 |
| `apps/<app-name>/assets/images/` | `apps/myproject-client/assets/images/placeholder.png` | 画像を配置する。 |
| `apps/<app-name>/assets/icons/` | `apps/myproject-client/assets/icons/app_icon.svg` | アプリケーション内で使用するアイコンを配置する。 |
| `apps/<app-name>/assets/fonts/` | `apps/myproject-client/assets/fonts/NotoSansJP-Regular.ttf` | アプリケーションに同梱するフォントを配置する。 |
| `apps/<app-name>/android/` | `apps/myproject-client/android/app/src/main/AndroidManifest.xml` | Android固有の設定とネイティブコードを配置する。Androidへ配信する場合に使用する。 |
| `apps/<app-name>/ios/` | `apps/myproject-client/ios/Runner/Info.plist` | iOS固有の設定とネイティブコードを配置する。iOSへ配信する場合に使用する。 |
| `apps/<app-name>/web/` | `apps/myproject-client/web/index.html` | Web固有の起動ファイルと設定を配置する。Webへ配信する場合に使用する。 |
| `apps/<app-name>/macos/` | `apps/myproject-client/macos/Runner/Info.plist` | macOS固有の設定とネイティブコードを配置する。macOSへ配信する場合に使用する。 |
| `apps/<app-name>/linux/` | `apps/myproject-client/linux/runner/main.cc` | Linux固有の設定とネイティブコードを配置する。Linuxへ配信する場合に使用する。 |
| `apps/<app-name>/windows/` | `apps/myproject-client/windows/runner/main.cpp` | Windows固有の設定とネイティブコードを配置する。Windowsへ配信する場合に使用する。 |
| `apps/<app-name>/lib/main.dart` | `apps/myproject-client/lib/main.dart` | エントリーポイント。設定を読み、外部SDKのクライアントとRepository、Gatewayの実装を生成してアプリケーションへ渡し、`runApp`を実行する。 |
| `apps/<app-name>/lib/app/app.dart` | `apps/myproject-client/lib/app/app.dart` | `MaterialApp`、アプリケーション全体で共有する`RepositoryProvider`と`BlocProvider`、ルーター、テーマ、多言語対応を接続する。 |
| `apps/<app-name>/lib/app/router/` | `apps/myproject-client/lib/app/router/app_router.dart` | ルーティングと、ルートまたは共通の親が所有するBLoCの生成、接続を定義する。各Featureの公開APIだけを参照する。 |
| `apps/<app-name>/lib/app/theme/` | `apps/myproject-client/lib/app/theme/app_theme.dart` | Theme、色、文字スタイル、余白など、アプリケーション全体のデザイン値を定義する。 |
| `apps/<app-name>/lib/l10n/` | `apps/myproject-client/lib/l10n/app_ja.arb` | ARB形式の翻訳データだけを配置する。生成コードは置かない。文言へ埋め込む数値、日付の書式は、プレースホルダーの`format`で指定する。 |
| `apps/<app-name>/lib/generated/l10n/` | `apps/myproject-client/lib/generated/l10n/app_localizations.dart` | `gen_l10n`が生成する多言語対応コードを配置する。`l10n.yaml`の`output-dir`で出力先を`lib/l10n/`の外へ指定する。手動では編集しない。 |
| `apps/<app-name>/lib/locale_format/` | `apps/myproject-client/lib/locale_format/currency_format.dart` | 文言の外側で使う数値、日付、通貨などの書式処理を`intl`パッケージで定義する。 |
| `apps/<app-name>/lib/infra/` | `apps/myproject-client/lib/infra/sentry/client.dart` | 業務ロジックを持たない技術基盤（DB接続プール、ロガー、Crash Reportingなど）の構築処理を配置する。呼び出すのは`main.dart`、アプリケーションの接続処理、テストに限る。Featureの業務処理からは呼び出さない。 |
| `apps/<app-name>/lib/ui/` | `apps/myproject-client/lib/ui/ui.dart`、`apps/myproject-client/lib/ui/button/primary_button.dart` | 複数のFeatureへ公開する、機能固有の判断を持たないUI部品を役割ごとのサブフォルダへ配置する。公開するUI部品は`ui.dart`から`export`する。 |
| `apps/<app-name>/lib/features/<feature>/<feature>.dart` | `apps/myproject-client/lib/features/auth/auth.dart` | Feature外へ公開する型、処理、Screen、Widget、BLoC、Handler、RepositoryとGatewayの契約、各実装の生成関数だけを`export`する。別Featureは、このファイルが公開する業務型、処理とその呼び出し契約、再利用用のWidgetだけを参照する。 |
| `apps/<app-name>/lib/features/<feature>/<concept>.dart` | `apps/myproject-client/lib/features/auth/auth_session.dart` | Featureが所有する一つの業務概念について、値、状態、識別子、制約を型として定義する。 |
| `apps/<app-name>/lib/features/<feature>/<responsibility>/` | `apps/myproject-client/lib/features/auth/sign_in/` | Feature内の一つの責務に属する型と処理を配置する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/screens/` | `apps/myproject-client/lib/features/auth/presentation/screens/sign_in_screen.dart` | ルーティングの遷移先となるScreenを配置する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/widgets/` | `apps/myproject-client/lib/features/auth/presentation/widgets/password_field.dart` | Featureが所有する表示で再利用するWidgetを配置する。別Featureでも再利用するWidgetは、`<feature>.dart`から明示的に`export`する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/bloc/` | `apps/myproject-client/lib/features/auth/presentation/bloc/sign_in_bloc.dart` | Featureの表示状態を管理するEvent、State、BLoCを配置する。 |
| `apps/<app-name>/lib/features/<feature>/handlers/` | `apps/myproject-client/lib/features/notification/handlers/push_notification_handler.dart` | UIを介さず外部からの要求を受け取る境界を配置する。業務ロジックは持たせず、Feature内の処理へ委譲する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/` | `apps/myproject-client/lib/features/checkout/repositories/cart_repository.dart` | Featureが所有するデータを永続化ストレージへ保存、取得する契約、接続先別の実装、保存形式との変換を配置する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<resource>_repository.dart` | `apps/myproject-client/lib/features/checkout/repositories/cart_repository.dart` | Featureが必要とするデータ操作をRepositoryの契約として定義する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<storage>_<resource>_repository.dart` | `apps/myproject-client/lib/features/checkout/repositories/sqlite_cart_repository.dart` | データベース、ファイル、端末ストレージなど、永続化先別のRepository実装を定義する。 |
| `apps/<app-name>/lib/features/<feature>/repositories/<storage>_<resource>_record.dart` | `apps/myproject-client/lib/features/checkout/repositories/sqlite_cart_record.dart` | データベース、ファイル、端末ストレージへ保存する形式とFeature内の型との変換を定義する。 |
| `apps/<app-name>/lib/features/<feature>/gateways/` | `apps/myproject-client/lib/features/payment/gateways/payment_gateway.dart` | 永続化以外の外部システム、外部サービス（決済、通知、他サービスのAPIなど）と通信する契約、接続先別の実装、外部データ形式との変換を配置する。 |
| `apps/<app-name>/lib/features/<feature>/gateways/<capability>_gateway.dart` | `apps/myproject-client/lib/features/payment/gateways/payment_gateway.dart` | Featureが必要とする外部システムの操作をGatewayの契約として定義する。 |
| `apps/<app-name>/lib/features/<feature>/gateways/<system>_<capability>_gateway.dart` | `apps/myproject-client/lib/features/payment/gateways/stripe_payment_gateway.dart` | 接続先のシステムまたはサービスごとのGateway実装を定義する。 |
| `apps/<app-name>/lib/features/<feature>/gateways/<system>_<operation>_request.dart` | `apps/myproject-client/lib/features/payment/gateways/stripe_create_payment_request.dart` | 外部システムへ送るデータ形式とFeature内の型からの変換を定義する。 |
| `apps/<app-name>/lib/features/<feature>/gateways/<system>_<operation>_response.dart` | `apps/myproject-client/lib/features/payment/gateways/stripe_create_payment_response.dart` | 外部システムから受け取るデータ形式とFeature内の型への変換を定義する。 |
| `apps/<app-name>/test/ui/` | `apps/myproject-client/test/ui/button/primary_button_test.dart` | `lib/ui/`に配置したUI部品のWidgetテストを配置する。 |
| `apps/<app-name>/test/features/<feature>/<feature>_test.dart` | `apps/myproject-client/test/features/auth/auth_test.dart` | Featureが所有する型の値、状態、識別子、制約を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/<responsibility>/` | `apps/myproject-client/test/features/auth/sign_in/` | Feature内の責務に対応する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/repositories/` | `apps/myproject-client/test/features/checkout/repositories/sqlite_cart_repository_test.dart` | Repositoryの変換、キャッシュ、エラー処理を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/gateways/` | `apps/myproject-client/test/features/payment/gateways/stripe_payment_gateway_test.dart` | Gatewayの変換、エラー処理を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/presentation/bloc/<bloc>_test.dart` | `apps/myproject-client/test/features/auth/presentation/bloc/sign_in_bloc_test.dart` | BLoCのEvent処理と状態遷移を検証する単体テストを配置する。 |
| `apps/<app-name>/test/features/<feature>/presentation/screens/<screen>_test.dart` | `apps/myproject-client/test/features/auth/presentation/screens/sign_in_screen_test.dart` | Screenの表示と操作を検証するWidgetテストを配置する。 |
| `apps/<app-name>/test/features/<feature>/presentation/widgets/<widget>_test.dart` | `apps/myproject-client/test/features/auth/presentation/widgets/password_field_test.dart` | Feature内で再利用するWidgetの表示と操作を検証するWidgetテストを配置する。 |
| `apps/<app-name>/integration_test/<feature>_test.dart` | `apps/myproject-client/integration_test/auth_test.dart` | Featureと実際の外部I/Oとの接続を検証する結合テストを配置する。 |
| `apps/<app-name>/integration_test/<flow>_test.dart` | `apps/myproject-client/integration_test/sign_in_test.dart` | 利用者の主要な操作をアプリケーション全体で検証するE2Eテストを配置する。 |

---

## 3. 依存方向

依存方向はアプリケーション設計規則に従う。Flutter固有の依存関係を次に示す。

| 依存元 | 依存先 |
| --- | --- |
| Screen、Widget | 同じFeatureのBLoCと型、`ui/` |
| BLoC | 同じFeatureの処理と型 |
| `ui/` | Flutter SDKのみ |

外部SDKのクライアント、Repository、Gatewayの実装は`main.dart`で生成する。Feature内の処理とBLoCは`app.dart`または`app/router/`で生成、接続し、RepositoryとGatewayはFeature内の処理へ、Feature内の処理はBLoCへコンストラクタから明示的に渡す。

---

## 4. 検証

モノレポでは、書式検査と脆弱性検査をリポジトリルートで実行する。静的解析と単体テストは各Flutterパッケージで、結合テストとE2Eテストは各アプリケーションで実行する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | アプリケーション内の全Dartソースコード。 | `dart format -o none --set-exit-if-changed .` |
| 型エラー、静的解析違反、lint違反を検出し、警告を残さない。 | アプリケーション内のDartソースコードと解析設定。 | `flutter analyze --fatal-infos --fatal-warnings` |
| ロジック、Repository、BLoC、Widgetの振る舞いの破壊を検出する。 | `test/`に配置した単体テストとWidgetテスト。 | `flutter test` |
| Feature、外部I/O、実行環境を結合した主要フローの破壊を検出する。 | `integration_test/`に配置した結合テストとE2Eテスト。 | `flutter test integration_test` |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべての`pubspec.lock`。 | `osv-scanner scan source -r .` |

---

## 5. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 2. フォルダ構成 | [Flutterアーキテクチャガイド](https://docs.flutter.dev/app-architecture/guide) | Flutterが示すUI層とデータ層の責務、ViewModelの配置を確認する。 |
| 2. フォルダ構成 | [Internationalizing Flutter apps](https://docs.flutter.dev/ui/internationalization) | 翻訳リソースと多言語対応コードの設定方法を確認する。 |
| 4. 検証 | [Testing Flutter apps](https://docs.flutter.dev/testing/overview) | 単体テスト、Widgetテスト、結合テストの役割を確認する。 |
| 4. 検証 | [Check app functionality with an integration test](https://docs.flutter.dev/testing/integration-tests) | `integration_test`による主要フローの検証方法を確認する。 |
