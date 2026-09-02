# Flutter固有規約

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [依存の向き](#3-依存の向き)
4. [検証](#4-検証)
5. [参考資料](#5-参考資料)

---

## 1. 概要

本書は、Dartで実装するFlutterアプリケーションの言語、フレームワーク固有規則を定義する。本書は、[共通設計原則](../core/software-design-guidelines.md)、[アプリケーション設計規則](../core/application-design-guidelines.md)を前提とする。

---

## 2. フォルダ構成

ソースルートは`lib/`とし、「アプリケーション設計規則」のフォルダ構成をその下へ置く。Flutter固有の配置を次に示す。

本書において、表示状態の管理にはBLoCを使用する前提で記載する。Provider、Riverpodなどを採用する場合は、`bloc/`をその方式が定める配置へ置き換える。方式が配置を定めない場合は、「参考資料」のFlutterアーキテクチャガイドに合わせて`view_models/`を使用する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/pubspec.yaml` | `apps/myproject-client/pubspec.yaml` | パッケージ、アセット、フォント、Flutterの設定を定義する。生成した多言語対応コードを使用する場合は、`flutter`の`generate`に`true`を指定する。 |
| `apps/<app-name>/l10n.yaml` | `apps/myproject-client/l10n.yaml` | 多言語対応コードの`arb-dir`、`template-arb-file`、`output-localization-file`、`output-dir`を定義する。`output-dir`には`arb-dir`と別のディレクトリを指定する。`synthetic-package`を持つバージョンでは`false`を指定する。 |
| `apps/<app-name>/assets/<asset-type>/` | `apps/myproject-client/assets/images/placeholder.png`、`apps/myproject-client/assets/fonts/NotoSansJP-Regular.ttf` | 画像、アイコン、フォントなど、アプリケーションへ同梱するリソースを種類ごとに配置する。 |
| `apps/<app-name>/<platform>/` | `apps/myproject-client/android/app/src/main/AndroidManifest.xml`、`apps/myproject-client/ios/Runner/Info.plist` | `android/`、`ios/`、`web/`、`macos/`、`linux/`、`windows/`のプラットフォーム固有の設定とネイティブコードを配置する。配信するプラットフォームだけ作る。 |
| `apps/<app-name>/lib/main.dart` | `apps/myproject-client/lib/main.dart` | エントリーポイント。設定を読み、外部境界の実装を生成してアプリケーションへ渡し、`runApp`を実行する。 |
| `apps/<app-name>/lib/app/app.dart` | `apps/myproject-client/lib/app/app.dart` | `MaterialApp`、アプリケーション全体で共有する`RepositoryProvider`と`BlocProvider`、ルーター、テーマ、多言語対応を接続する。 |
| `apps/<app-name>/lib/app/router/` | `apps/myproject-client/lib/app/router/app_router.dart` | ルーティングと、ルートまたは共通の親が所有するBLoCの生成、接続を定義する。各Featureの公開APIだけを参照する。 |
| `apps/<app-name>/lib/app/theme/` | `apps/myproject-client/lib/app/theme/app_theme.dart` | Theme、色、文字スタイル、余白など、アプリケーション全体のデザイン値を定義する。 |
| `apps/<app-name>/lib/l10n/` | `apps/myproject-client/lib/l10n/app_ja.arb` | ARB形式の翻訳データだけを配置する。生成コードは置かない。文言へ埋め込む数値、日付の書式は、プレースホルダーの`format`で指定する。 |
| `apps/<app-name>/lib/generated/l10n/` | `apps/myproject-client/lib/generated/l10n/app_localizations.dart` | `gen_l10n`が生成する多言語対応コードを配置する。`l10n.yaml`の`output-dir`で出力先を`lib/l10n/`の外へ指定する。手動では編集しない。 |
| `apps/<app-name>/lib/locale_format/` | `apps/myproject-client/lib/locale_format/currency_format.dart` | 文言の外側で使う数値、日付、通貨などの書式処理を`intl`パッケージで定義する。 |
| `apps/<app-name>/lib/ui/` | `apps/myproject-client/lib/ui/ui.dart`、`apps/myproject-client/lib/ui/button/primary_button.dart` | 複数のFeatureへ公開する、機能固有の判断を持たないUI部品を役割ごとのサブフォルダへ配置する。公開するUI部品は`ui.dart`から`export`する。 |
| `apps/<app-name>/lib/features/<feature>/<feature>.dart` | `apps/myproject-client/lib/features/auth/auth.dart` | Feature外へ公開する型、処理、Screen、Widget、BLoC、Handler、外部境界の契約、各実装の生成関数だけを`export`する。 |
| `apps/<app-name>/lib/features/<feature>/presentation/` | `apps/myproject-client/lib/features/auth/presentation/screens/sign_in_screen.dart`、`apps/myproject-client/lib/features/auth/presentation/bloc/sign_in_bloc.dart` | ルーティングの遷移先となるScreenを`screens/`、Featureが所有する表示で再利用するWidgetを`widgets/`、表示状態を管理するEvent、State、BLoCを`bloc/`へ配置する。別Featureでも再利用するWidgetは、`<feature>.dart`から明示的に`export`する。 |
| `apps/<app-name>/lib/features/<feature>/<capability>.dart` | `apps/myproject-client/lib/features/payment/payment_client.dart`、`apps/myproject-client/lib/features/checkout/cart_repository.dart` | Featureが必要とする外部境界の操作を契約として定義する。永続化の契約もここへ置く。ファイル名は型名に合わせる。 |
| `apps/<app-name>/lib/features/<feature>/<technical-resource>/` | `apps/myproject-client/lib/features/payment/stripe/stripe_client.dart`、`apps/myproject-client/lib/features/checkout/sqlite/sqlite_cart_repository.dart` | 外部境界の実装と外部データ形式を、接続先ごとに配置する。永続化の実装もここへ置く。 |
| `apps/<app-name>/test/` | `apps/myproject-client/test/features/auth/presentation/bloc/sign_in_bloc_test.dart`、`apps/myproject-client/test/features/checkout/sqlite/sqlite_cart_repository_test.dart` | `lib/`と同じ構成で、単体テストとWidgetテストを配置する。ファイル名は対象のファイル名へ`_test`を付ける。 |
| `apps/<app-name>/integration_test/<feature>_test.dart` | `apps/myproject-client/integration_test/auth_test.dart` | Featureと実際の外部I/Oとの接続を検証する結合テストを配置する。 |
| `apps/<app-name>/integration_test/<flow>_test.dart` | `apps/myproject-client/integration_test/sign_in_test.dart` | 利用者の主要な操作をアプリケーション全体で検証するE2Eテストを配置する。 |

---

## 3. 依存の向き

依存の向きは[アプリケーション設計規則](../core/application-design-guidelines.md)に従う。Flutter固有の依存関係を次に示す。

| 依存元 | 依存先 |
| --- | --- |
| Screen、Widget | 同じFeatureのBLoCと型、`ui/` |
| BLoC | 同じFeatureの処理と型 |
| `ui/` | Flutter SDKのみ |

---

## 4. 検証

モノレポでは、書式検査と脆弱性検査をリポジトリルートで実行する。静的解析と単体テストは各Flutterパッケージで、結合テストとE2Eテストは各アプリケーションで実行する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | アプリケーション内の全Dartソースコード。 | `dart format -o none --set-exit-if-changed .` |
| 型エラー、静的解析違反、lint違反を検出し、警告を残さない。 | アプリケーション内のDartソースコードと解析設定。 | `flutter analyze --fatal-infos --fatal-warnings` |
| ロジック、外部境界の実装、BLoC、Widgetの振る舞いの破壊を検出する。 | `test/`に配置した単体テストとWidgetテスト。 | `flutter test` |
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
