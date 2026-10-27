# PlantUML図の画像変換ガイドライン

## 1 適用範囲

このガイドラインは，PlantUMLで記述した図をSVG又はPNGに変換する場合に適用する。

## 2 変換方針

図の定義ファイルを正本として扱う。図を変更する場合は，定義ファイルを修正して画像を再生成する。生成した画像は直接編集しない。

PlantUMLは，構文に誤りがある図についてもエラーの内容を描いた画像を出力するため，[6.3](#63-構文の検査)の方法で検査してから変換する。

PNGは，PlantUMLで直接生成せず，PlantUMLで生成したSVGから変換する。PlantUMLのPNG出力は，Javaの描画処理で描かれ，SVGとは別の描画結果になる。

## 3 変換環境

変換には，dev-rulesの[`docker/Dockerfile`](../../docker/Dockerfile)で作成するDockerイメージを用いる。イメージには，PlantUML 1.2026.9，PlantUMLがレイアウトに用いるGraphviz，Java実行環境のOpenJDK及び日本語フォントが含まれる。dev-rulesのルートで次のコマンドを実行し，イメージを作成する。

```shell
docker build -t dev-rules-tools -f docker/Dockerfile .
```

## 4 ファイルの配置

ファイルの配置を[表1](#table-1)に示す。

<a id="table-1"></a>表1−ファイルの配置

| パス | 内容 |
| --- | --- |
| `docs/diagrams/<name>.puml` | 図の定義ファイル。1ファイルに1図を記述する。 |
| `docs/images/<name>.svg` | 定義ファイルから生成したSVG。定義ファイルと同じ名前にする。 |
| `docs/images/<name>.png` | SVGから変換したPNG。必要な場合に限って生成する。 |

生成した画像は，定義ファイルと同じコミットに含める。

## 5 図の定義

定義ファイルは，UTF-8で保存する。図の題名は`title`で記述する。

次の例は，注文の受付を示すシーケンス図の定義である。

```text
@startuml
title 注文の受付
actor 利用者
participant API
database 注文DB
利用者 -> API : 注文を送信する
API -> 注文DB : 注文を保存する
API --> 利用者 : 受付番号を返す
@enduml
```

## 6 変換手順

### 6.1 SVGへの変換

プロジェクトのルートで次のコマンドを実行し，`docs/diagrams`の全ての定義ファイルをSVGに変換して`docs/images`へ出力する。コンテナは，現在のディレクトリを`/data`として読み書きする。ファイルは，現在のディレクトリからの相対パスで指定する。

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/data" dev-rules-tools plantuml --check-before-run --charset UTF-8 --svg --output-dir ../images "docs/diagrams/*.puml"
```

`plantuml`のパラメーターを[表2](#table-2)に示す。

<a id="table-2"></a>表2−変換コマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `--check-before-run` | 全ての定義ファイルの構文を先に検査し，誤りがあれば画像を生成せずに終了する。 |
| `--charset` | `UTF-8`：定義ファイルの文字コード。 |
| `--svg` | SVGで出力する。 |
| `--output-dir` | 画像を出力するディレクトリ。相対パスは，現在のディレクトリではなく定義ファイルのディレクトリを基準に解決される。 |
| 最後の引数 | 定義ファイル。ワイルドカードは，シェルに展開させないよう引用符で囲む。 |

### 6.2 PNGへの変換

[6.1](#61-svgへの変換)で生成したSVGを，[SVGからPNGへの変換ガイドライン](svg-to-png-guidelines.md)の方法でPNGに変換する。

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/data" dev-rules-tools svg-to-png --input-file docs/images/order-sequence.svg --output-file docs/images/order-sequence.png
```

### 6.3 構文の検査

`--check-before-run`を指定した場合，PlantUMLは，構文に誤りがある定義ファイルが一つでもあれば，全ての画像を生成せずに0以外で終了する。

画像を生成せずに構文だけを検査する場合は，`--check-syntax`を用いる。

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/data" dev-rules-tools plantuml --check-syntax --charset UTF-8 "docs/diagrams/*.puml"
```

## 7 確認

変換後に，[表3](#table-3)の項目を確認する。

<a id="table-3"></a>表3−確認項目

| 項目 | 確認方法 |
| --- | --- |
| 変換の成否 | 変換コマンドの終了ステータスが0である。 |
| 文字 | 生成した画像で，日本語が正しく表示される。 |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章 | [Release v1.2026.9 · plantuml/plantuml · GitHub](https://github.com/plantuml/plantuml/releases/tag/v1.2026.9) | Dockerイメージに導入するPlantUMLの版を配布するページ。 |
| 6章 | [call it from your script using command line](https://plantuml.com/command-line) | PlantUMLのコマンドラインのパラメーター，ワイルドカード，出力ディレクトリ及び構文に誤りがある場合の動作を説明する文書。 |
