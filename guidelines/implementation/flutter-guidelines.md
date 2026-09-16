# Flutter実装ガイドライン

## 目次

1. [概要](#1-概要)
2. [フォルダ構成](#2-フォルダ構成)
3. [検証](#3-検証)
4. [参考資料](#4-参考資料)

---

## 1. 概要

本書は、Dartで実装するFlutterアプリケーションの実装ガイドラインを定義する。本書は、[ソフトウェア設計ガイドライン](../software/software-design-guidelines.md)、[アプリケーション設計ガイドライン](../software/application-design-guidelines.md)を前提とする。

---

## 2. フォルダ構成

ソースルートは`lib/`とし、「アプリケーション設計ガイドライン」のフォルダ構成をその下へ置く。Flutter固有の配置を次に示す。

本書において、表示状態の管理にはBLoCを使用する前提で記載する。Provider、Riverpodなどを採用する場合は、`bloc/`をその方式が定める配置へ置き換える。方式が配置を定めない場合は、「参考資料」のFlutterアーキテクチャガイドに合わせて`view_models/`を使用する。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/pubspec.yaml` | [flutter_todosの`pubspec.yaml`](https://github.com/felangel/bloc/blob/master/examples/flutter_todos/pubspec.yaml) | パッケージ、アセット、フォント、Flutterの設定を定義する。生成した多言語対応コードを使用する場合は、`flutter`の`generate`に`true`を指定する。 |
| `apps/<app-name>/l10n.yaml` | [flutter_todosの`l10n.yaml`](https://github.com/felangel/bloc/blob/master/examples/flutter_todos/l10n.yaml) | 多言語対応コードの`arb-dir`、`template-arb-file`、`output-localization-file`を定義する。`synthetic-package`を持つバージョンでは`false`を指定する。 |
| `apps/<app-name>/assets/<asset-type>/` | [flutter_weatherの`assets`](https://github.com/felangel/bloc/tree/master/examples/flutter_weather/assets) | 画像、アイコン、フォントなど、アプリケーションへ同梱するリソースを種類ごとに配置する。 |
| `apps/<app-name>/lib/app/router/` | [compass_appの`lib/routing`](https://github.com/flutter/samples/tree/main/compass_app/app/lib/routing) | ルーティングと、ルートまたは共通の親が所有するBLoCの生成、接続を定義する。各Featureの公開APIだけを参照する。 |
| `apps/<app-name>/lib/app/theme/` | [flutter_todosの`lib/theme`](https://github.com/felangel/bloc/tree/master/examples/flutter_todos/lib/theme) | Theme、色、文字スタイル、余白など、アプリケーション全体のデザイン値を定義する。 |
| `apps/<app-name>/lib/l10n/` | [flutter_todosの`lib/l10n/app_en.arb`](https://github.com/felangel/bloc/blob/master/examples/flutter_todos/lib/l10n/app_en.arb) | ARB形式の翻訳データを配置する。文言へ埋め込む数値、日付の書式は、プレースホルダーの`format`で指定する。 |
| `apps/<app-name>/lib/locale_format/` | [compass_appの`date_format_start_end.dart`](https://github.com/flutter/samples/blob/main/compass_app/app/lib/ui/core/ui/date_format_start_end.dart) | 文言の外側で使う数値、日付、通貨などの書式処理を`intl`パッケージで定義する。 |
| `apps/<app-name>/lib/ui/` | [compass_appの`lib/ui/core/ui`](https://github.com/flutter/samples/tree/main/compass_app/app/lib/ui/core/ui) | 複数のFeatureへ公開する、機能固有の判断を持たないUI部品を役割ごとのサブフォルダへ配置する。公開するUI部品は`ui.dart`から`export`する。 |
| `apps/<app-name>/lib/<feature>/<feature>.dart` | [flutter_todosの`todos_overview.dart`](https://github.com/felangel/bloc/blob/master/examples/flutter_todos/lib/todos_overview/todos_overview.dart) | Feature外へ公開する型、処理、Screen、Widget、BLoC、Handler、外部境界の契約、各実装の生成関数だけを`export`する。 |
| `apps/<app-name>/lib/<feature>/presentation/` | [flutter_todosの`todos_overview/view`](https://github.com/felangel/bloc/tree/master/examples/flutter_todos/lib/todos_overview/view)、[`todos_overview/bloc`](https://github.com/felangel/bloc/tree/master/examples/flutter_todos/lib/todos_overview/bloc)、[`todos_overview/widgets`](https://github.com/felangel/bloc/tree/master/examples/flutter_todos/lib/todos_overview/widgets) | ルーティングの遷移先となるScreenを`screens/`、Featureが所有する表示で再利用するWidgetを`widgets/`、表示状態を管理するEvent、State、BLoCを`bloc/`へ配置する。別Featureでも再利用するWidgetは、`<feature>.dart`から明示的に`export`する。 |
| `apps/<app-name>/lib/<feature>/<capability>.dart` | [todos_apiの`todos_api.dart`](https://github.com/felangel/bloc/blob/master/examples/flutter_todos/packages/todos_api/lib/src/todos_api.dart) | Featureが必要とする外部境界の操作を契約として定義する。 |
| `apps/<app-name>/test/` | [flutter_todosの`test`](https://github.com/felangel/bloc/tree/master/examples/flutter_todos/test) | `lib/`と同じ構成で、単体テストとWidgetテストを配置する。ファイル名は対象のファイル名へ`_test`を付ける。 |
| `apps/<app-name>/integration_test/<feature>_test.dart` | [compass_appの`app_server_data_test.dart`](https://github.com/flutter/samples/blob/main/compass_app/app/integration_test/app_server_data_test.dart) | Featureと実際の外部I/Oとの接続を検証する結合テストを配置する。 |
| `apps/<app-name>/integration_test/<flow>_test.dart` | [flutter_counterの`app_test.dart`](https://github.com/felangel/bloc/blob/master/examples/flutter_counter/integration_test/app_test.dart) | 利用者の主要な操作をアプリケーション全体で検証するE2Eテストを配置する。 |

---

## 3. 検証

モノレポでは、書式検査と脆弱性検査をリポジトリルートで実行する。静的解析と単体テストは各Flutterパッケージで、結合テストとE2Eテストは各アプリケーションで実行する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | アプリケーション内の全Dartソースコード。 | `dart format -o none --set-exit-if-changed .` |
| 型エラー、静的解析違反、lint違反を検出し、警告を残さない。 | アプリケーション内のDartソースコードと解析設定。 | `flutter analyze --fatal-infos --fatal-warnings` |
| ロジック、外部境界の実装、BLoC、Widgetの振る舞いの破壊を検出する。 | `test/`に配置した単体テストとWidgetテスト。 | `flutter test` |
| Feature、外部I/O、実行環境を結合した主要フローの破壊を検出する。 | `integration_test/`に配置した結合テストとE2Eテスト。 | `flutter test integration_test` |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべての`pubspec.lock`。 | `osv-scanner scan source -r .` |

---

## 4. 参考資料

| 本書の章 | 参考資料 | 説明 |
| --- | --- | --- |
| 2. フォルダ構成 | [Flutterアーキテクチャガイド](https://docs.flutter.dev/app-architecture/guide) | Flutterが示すUI層とデータ層の責務、ViewModelの配置を確認する。 |
| 2. フォルダ構成 | [Internationalizing Flutter apps](https://docs.flutter.dev/ui/internationalization) | 翻訳リソースと多言語対応コードの設定方法を確認する。 |
| 3. 検証 | [Testing Flutter apps](https://docs.flutter.dev/testing/overview) | 単体テスト、Widgetテスト、結合テストの役割を確認する。 |
| 3. 検証 | [Check app functionality with an integration test](https://docs.flutter.dev/testing/integration-tests) | `integration_test`による主要フローの検証方法を確認する。 |
