# PlantUML図の画像変換ガイドライン

## 1 適用範囲

このガイドラインは，PlantUMLで記述した図をSVG又はPNGに変換し，Markdownに埋め込んでDOCXへ変換する場合に適用する。

MarkdownからDOCXへの変換方法は，[MarkdownからDOCXへの変換ガイドライン](docx-export-guidelines.md)による。

## 2 変換方針

図の定義ファイルを正本として扱う。図を変更する場合は，定義ファイルを修正して画像を再生成する。生成した画像は直接編集しない。

画像の形式はSVGを標準とする。MarkdownからDOCXへの変換ツールは，SVGを保持し，SVGに対応しない表示環境のためのPNGを併せて格納する。PNGは，SVGを扱えない変換ツール又は表示先へ画像を渡す場合に限って生成する。

構文に誤りがある図からは画像を生成しない。PlantUMLは，構文に誤りがある図についてもエラーの内容を描いた画像を出力するため，[6.3](#63-構文の検査)の方法で検査してから変換する。

## 3 変換環境

### 3.1 Java CLI

Java CLIで変換する場合に必要な環境を[表1](#table-1)に示す。

<a id="table-1"></a>表1−Java CLIの変換環境

| 項目 | 要件 |
| --- | --- |
| Java実行環境 | Eclipse TemurinなどのOpenJDKのディストリビューション。Oracle JDKは使用しない（[フリーソフト使用規則](../development/free-software-usage-rules.md)参照）。 |
| PlantUML | `plantuml-1.2026.9.jar`。GitHubのリリースから版を指定して取得し，`tools/plantuml.jar`として置く。 |
| Graphviz | クラス図，コンポーネント図などのレイアウトに使用する。`java -jar tools/plantuml.jar --check-graphviz`で導入を確認する。 |
| 日本語フォント | 日本語を描画できるフォント。変換環境に導入されていない場合，日本語の文字が正しく描画されない。 |

### 3.2 Docker

Dockerで変換する場合は，公式のDockerイメージ`plantuml/plantuml`を版を指定して使用する。イメージにはGraphvizが含まれるが，日本語フォントは含まれない。日本語を含む図を変換する場合は，次のDockerfileで日本語フォントを追加したイメージを作成する。

```dockerfile
FROM plantuml/plantuml:1.2026.9

USER root
RUN apt-get update \
  && apt-get install --no-install-recommends -y fonts-noto-cjk \
  && rm -rf /var/lib/apt/lists/*
USER appuser
```

Docker Desktopは使用しない。Docker Engineを使用する（[フリーソフト使用規則](../development/free-software-usage-rules.md)参照）。

## 4 ファイルの配置

ファイルの配置を[表2](#table-2)に示す。

<a id="table-2"></a>表2−ファイルの配置

| パス | 内容 |
| --- | --- |
| `docs/diagrams/<name>.puml` | 図の定義ファイル。1ファイルに1図を記述する。 |
| `docs/images/<name>.svg` | 定義ファイルから生成したSVG。定義ファイルと同じ名前にする。 |
| `docs/images/<name>.png` | 定義ファイルから生成したPNG。必要な場合に限って生成する。 |

DOCX変換ツールはMarkdownから参照されたローカルの画像ファイルを読み込むため，生成した画像は定義ファイルと同じコミットに含める。

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

次のコマンドで，`docs/diagrams`の全ての定義ファイルをSVGに変換し，`docs/images`へ出力する。

```shell
java -jar tools/plantuml.jar --check-before-run --charset UTF-8 --svg --output-dir ../images "docs/diagrams/*.puml"
```

変換コマンドのパラメーターを[表3](#table-3)に示す。

<a id="table-3"></a>表3−変換コマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `--check-before-run` | 全ての定義ファイルの構文を先に検査し，誤りがあれば画像を生成せずに終了する。 |
| `--charset` | `UTF-8`：定義ファイルの文字コード。 |
| `--svg`<br>`--png` | 出力形式。 |
| `--output-dir` | 画像を出力するディレクトリ。相対パスは，現在のディレクトリではなく定義ファイルのディレクトリを基準に解決される。 |
| `-Sdpi` | PNGの解像度。 |
| 最後の引数 | 定義ファイル。ワイルドカードは，シェルに展開させないよう引用符で囲む。 |

### 6.2 PNGへの変換

PNGは，長辺3840ピクセル以上で生成する。[6.1](#61-svgへの変換)で生成したSVGを，[SVGからPNGへの変換ガイドライン](svg-to-png-guidelines.md)の方法でPNGに変換する。

PlantUMLのPNG出力は，Javaの描画処理で描かれ，SVGとは別の描画結果になる。SVGから変換すると，DOCXに埋め込むSVGと同じ見た目のPNGになる。

Chromiumを用意できない場合は，PlantUMLでPNGを直接生成する。PlantUMLは96 dpiを基準の解像度として画像を描画するため，`-Sdpi`で解像度を上げる。`-Sdpi`の値は，SVGの`width`及び`height`の長い方を基準の長辺として，次の式で求める。式の4000は，計算の誤差で3840ピクセルを下回らないようにするための値である。

```text
dpi = 96 × 4000 ÷ 基準の長辺（小数点以下切上げ）
```

例えば，SVGの大きさが301 px×317 pxの場合，dpiは1212になる。

```shell
PLANTUML_LIMIT_SIZE=8192 java -jar tools/plantuml.jar --check-before-run --charset UTF-8 --png -Sdpi=1212 --output-dir ../images docs/diagrams/order-sequence.puml
```

PlantUMLは，環境変数`PLANTUML_LIMIT_SIZE`の値（既定値は4096）を超える部分を切り捨てて画像を出力し，エラーにしない。`PLANTUML_LIMIT_SIZE`には，生成する画像の長辺より大きい値を指定する。

### 6.3 構文の検査

`--check-before-run`を指定した場合，PlantUMLは，構文に誤りがある定義ファイルが一つでもあれば，全ての画像を生成せずに0以外で終了する。

画像を生成せずに構文だけを検査する場合は，`--check-syntax`を用いる。

```shell
java -jar tools/plantuml.jar --check-syntax --charset UTF-8 "docs/diagrams/*.puml"
```

### 6.4 Dockerでの変換

[3.2](#32-docker)で作成したイメージを`plantuml-ja`とした場合，次のコマンドで変換する。イメージは，`/data`を作業ディレクトリとしてPlantUMLを実行する。

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/data" \
  plantuml-ja \
  --check-before-run --charset UTF-8 --svg --output-dir ../images "docs/diagrams/*.puml"
```

PNGを生成する場合は，`-e PLANTUML_LIMIT_SIZE=8192`で環境変数を渡す。

## 7 DOCXへの埋込み

Markdownには，画像を単独の段落として記載し，Markdownファイルからの相対パスで参照する。代替テキストには，`title`と同じ図の題名を記載する。

```markdown
![注文の受付](images/order-sequence.svg)
```

画像を埋め込んだMarkdownは，[MarkdownからDOCXへの変換ガイドライン](docx-export-guidelines.md)の手順でDOCXに変換する。

## 8 確認

変換後に，[表4](#table-4)の項目を確認する。

<a id="table-4"></a>表4−確認項目

| 項目 | 確認方法 |
| --- | --- |
| 変換の成否 | 変換コマンドの終了ステータスが0である。 |
| PNGの解像度 | PNGの長辺が3840ピクセル以上であり，図の右端及び下端が切れていない。 |
| 文字 | 生成した画像及びDOCX内の図で，日本語が正しく表示される。 |
| 代替テキスト | Markdownの画像及びDOCX内の図に，図の題名が代替テキストとして設定されている。 |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 3章<br>6章 | [call it from your script using command line](https://plantuml.com/command-line) | PlantUMLのコマンドラインのパラメーター，ワイルドカード，出力ディレクトリ及び構文に誤りがある場合の動作を説明する文書。 |
| 3.1 | [Test your GraphViz installation](https://plantuml.com/graphviz-dot) | PlantUMLが使用するGraphvizの導入及び確認方法を説明する文書。 |
| 3.2<br>6.4 | [plantuml/Dockerfile at v1.2026.9 · plantuml/plantuml · GitHub](https://github.com/plantuml/plantuml/blob/v1.2026.9/Dockerfile) | 公式Dockerイメージの作業ディレクトリ，実行ユーザー，起動コマンド及び導入するフォントを定義するファイル。 |
| 6.2 | [Frequently Asked Questions](https://plantuml.com/faq) | 画像の大きさの上限`PLANTUML_LIMIT_SIZE`を説明する文書。 |
