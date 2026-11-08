# Python実装ガイドライン

## 1 はじめに

### 1.1 目的

本書は、Pythonを使用した開発の作業効率の向上及び品質の安定化を目的とする。

### 1.2 適用範囲

本書は、Pythonによる実装について規定する。本書は、[ソフトウェア設計ガイドライン](../software/software-design-guidelines.md)、[PEP 8](https://peps.python.org/pep-0008/)を前提とする。

---

## 2. フォルダ構成

ソースルートは`src/`とし、「アプリケーション設計ガイドライン」のフォルダ構成を`src/<package>/`の下へ置く。テストは、インストールしたパッケージを検証するため、ソースルートの外へ配置する。`tests/`以下の各フォルダには`__init__.py`を置き、単体テストと結合テストで同じファイル名を使用できるようにする。Python固有の配置を次に示す。

| パス | 例 | 説明 |
| --- | --- | --- |
| `apps/<app-name>/pyproject.toml` | [Flaskの`pyproject.toml`](https://github.com/pallets/flask/blob/main/pyproject.toml) | パッケージの定義、依存関係、検証ツールの設定を記述する。 |
| `apps/<app-name>/src/<package>/__init__.py` | [Flaskの`src/flask/__init__.py`](https://github.com/pallets/flask/blob/main/src/flask/__init__.py) | パッケージの公開境界。パッケージ外へ公開する名前を、`from .app import Flask as Flask`の形式または`__all__`で明示する。 |
| `apps/<app-name>/src/<package>/__main__.py` | [Flaskの`src/flask/__main__.py`](https://github.com/pallets/flask/blob/main/src/flask/__main__.py) | `python -m <package>`で実行するエントリーポイント。 |
| `apps/<app-name>/src/<package>/<feature>/__init__.py` | [Home Assistantの`components/light/__init__.py`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/light/__init__.py) | Featureの公開境界。Feature外へ公開する型、関数、クラス、各実装の生成関数だけを公開する。 |
| `apps/<app-name>/tests/conftest.py` | [Flaskの`tests/conftest.py`](https://github.com/pallets/flask/blob/main/tests/conftest.py) | 複数のテストで共有するfixtureを配置する。 |
| `apps/<app-name>/tests/unit/<feature>/test_<module>.py` | [Airflowの`airflow-core/tests/unit`](https://github.com/apache/airflow/tree/main/airflow-core/tests/unit) | 単体テスト。 |
| `apps/<app-name>/tests/integration/<feature>/test_<module>.py` | [Airflowの`airflow-core/tests/integration`](https://github.com/apache/airflow/tree/main/airflow-core/tests/integration) | Feature間またはFeatureと外部I/Oとの結合を検証するテストを配置する。 |
| `apps/<app-name>/tests/e2e/<flow>/test_<flow>.py` | [Saleorの`saleor/tests/e2e/checkout`](https://github.com/saleor/saleor/tree/main/saleor/tests/e2e/checkout) | E2Eテスト。 |

---

## 3. 型

公開する関数、クラス、メソッドの引数と戻り値の型を明示する。

---

## 4. 検証

Ruffは、`pyproject.toml`の`[tool.ruff.lint]`の`select`に`ANN`、`B`、`C90`、`F`、`SIM`を指定して実行する。

Pylintは`pylint --disable=all --enable=too-many-nested-blocks,cyclic-import --max-nested-blocks=3 src/<package>`で実行し、表の2つのルールだけを検証する。

モノレポでは、ルートに`verify`コマンドを定義し、表の検証を対象となるすべてのパッケージで実行する。

| 目的 | 検証対象 | ツール |
| --- | --- | --- |
| コードの書式を統一し、機械的な差分を防ぐ。 | Pythonのソースコードとテストコード。 | `ruff format --check .` |
| 型チェッカーが検出する型エラーを防ぐ。 | Pythonのソースコード、テストコード、型スタブ。 | Mypy（`mypy --strict src tests`） |
| 制御構造を単純に保ち、変更時の不具合を防ぐ。 | コードブロックが3段を超えてネストしている箇所。 | Pylintの`too-many-nested-blocks`ルール |
| 型注釈の漏れを防ぎ、ロジックの可読性を維持する。 | 型注釈のない定義、誤りを招きやすい記述、複雑な条件式、追跡しにくいロジック。 | `ruff check .` |
| モジュール間の循環依存を防ぐ。 | Pythonのimport。 | Pylintの`cyclic-import`ルール |
| 不要なコードと依存関係の残存を防ぐ。 | 未使用の関数、クラス、変数、未使用依存パッケージ。 | `vulture src tests`、`deptry src` |
| 変更による振る舞いの破壊と未検証箇所を検出する。 | 単体テスト、結合テストと、行、分岐のカバレッジ。 | `pytest --cov=<package> --cov-branch tests/unit tests/integration` |
| 利用者の主要な操作と、停止時の影響が大きい処理経路の破壊を検出する。 | `tests/e2e/`に配置したE2Eテスト。 | `pytest tests/e2e` |
| 依存関係に含まれる既知の脆弱性を検出する。 | リポジトリ内のすべてのPython向けロックファイル。 | `osv-scanner scan source -r .` |

---

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 1 はじめに | [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/) | Pythonの記述方法を確認する。 |
| 2. フォルダ構成 | [Good Integration Practices](https://docs.pytest.org/en/stable/explanation/goodpractices.html) | `src/`配置と、テストをソースルートの外へ置く構成を確認する。 |
| 3. 型、4. 検証 | [The mypy command line](https://mypy.readthedocs.io/en/stable/command_line.html) | `--strict`が有効にする型検査を確認する。 |
| 4. 検証 | [Ruff Rules](https://docs.astral.sh/ruff/rules/) | Ruffのルールと、ルールが属するグループを確認する。 |
| 4. 検証 | [Pylint Messages](https://pylint.readthedocs.io/en/stable/user_guide/messages/messages_overview.html) | `too-many-nested-blocks`と`cyclic-import`の検出内容を確認する。 |
| 4. 検証 | [Supported Languages and Lockfiles](https://google.github.io/osv-scanner/supported-languages-and-lockfiles/) | OSV-Scannerが対応するPythonのロックファイルを確認する。 |
