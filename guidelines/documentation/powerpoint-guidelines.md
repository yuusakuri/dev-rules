# PowerPoint作成ガイドライン

## 目次

1. [概要](#1-概要)
2. [作成ツール](#2-作成ツール)
3. [スライドの構成](#3-スライドの構成)
4. [文字](#4-文字)
5. [図表](#5-図表)
6. [保存](#6-保存)
7. [確認](#7-確認)
8. [参考文献](#8-参考文献)

---

## 1. 概要

本書は、PowerPointのプレゼンテーションの作成方法を定義する。本書は、[TypeScript実装ガイドライン](../implementation/typescript-guidelines.md)を前提とする。

文章の書き方は、[技術文書作成ガイドライン](technical-document-guidelines.md)に従う。

---

## 2. 作成ツール

PowerPointのファイル（`.pptx`）は、[PptxGenJS](https://gitbrent.github.io/PptxGenJS/)を用いたスクリプトで生成する。

PptxGenJSは、`npm install pptxgenjs`で導入する。

スクリプトは、TypeScriptで記述する。

内容を変更する場合は、スクリプトを変更してファイルを再生成する。生成したファイルをPowerPointで直接編集しない。

スクリプトと生成したファイルは、同じリポジトリに置く。

---

## 3. スライドの構成

### レイアウト

スライドの大きさは、`layout`に`LAYOUT_16x9`を指定して、16:9とする。

### スライドマスター

全てのスライドに共通する背景、ロゴ及びスライド番号は、`defineSlideMaster()`でスライドマスターに定義する。

各スライドは、`addSlide({ masterName })`でスライドマスターを指定して追加する。

### プレゼンテーションの情報

プレゼンテーションには、`title`及び`author`を設定する。

### スピーカーノート

発表時に話す内容は、スライドの本文ではなく、`addNotes()`でスピーカーノートに記載する。

### スライドの内容

1枚のスライドには、1つの観点だけを載せる。文字を小さくしなければ収まらない場合は、スライドを分ける。

聞き手が理解するのに必要な内容だけを載せる。次の内容は載せない。

- 実装の細部及びファイル名
- どのプロジェクトにも当てはまる一般的な設計方針
- 内容を持たないスライド（まとめ、謝辞など）

関数名の呼出し順序など、実装の詳細を示すスライドは、本編とは別のファイルにまとめる。本編に非表示のスライドとして残さない。

### タイトル

タイトルは、スライドの内容を示す短い名詞句とする。括弧書きの補足を付けない。

---

## 4. 文字

文字の書体は、`fontFace`で指定する。

文字の大きさは、`fontSize`で次のとおり指定する。

| 対象 | 文字の大きさ |
| --- | --- |
| タイトル | 32 pt〜40 pt |
| 本文 | 20 pt〜24 pt |

日本語の文字を含むテキストには、`lang`に`ja-JP`を指定する。

テキストの位置及び大きさは、`x`、`y`、`w`及び`h`にインチ単位の数値で指定する。

### 本文の配置

本文は、スライドの背景に直接置かず、見出しを付けた枠（カード）に入れる。1つのカードには、箇条書き、番号付きの手順及び説明文のうち1種類だけを入れる。

項目ごとに同じ属性を並べる内容は、箇条書きではなく表にする。

縦に並べるカードは、1つの表として作成する。カードの高さをPowerPointに決めさせ、カードの間隔を一定に保つ。

### 用語

専門用語は、初めて使うスライドでその意味を示す。

同じ対象は、全てのスライドで同じ語で書く。

規格又は技術で定められた用語は、その規格又は技術での表記で書く。

---

## 5. 図表

表は、`addTable()`で作成する。

グラフは、`addChart()`で作成する。

画像は、`addImage()`で挿入する。画像は、画面の写しなど、図形で描けないものに限る。

### 図

図は、`addShape()`及び`addText()`で描き、図形及び文字をPowerPointで編集できる状態に保つ。他のツールで描いた図を画像として挿入しない。

図の文字の大きさは、本文に近づける。

線に重なる位置に文字を置かない。文字の背景は透明にし、線を文字で隠さない。

### シーケンス図

参加者の名前は、全てのシーケンス図で同じ表記にする。

参加者の箱と、そこから下に伸びる線をつなげる。線は、図の下端まで途切れさせない。

図の右側に、図の流れを番号付きの手順で説明する。説明は、図を読めることを前提にしない。

### コード

コードは、説明に必要な最小限の部分だけを載せる。

コードを載せる場合は、そのコードの各部分の説明を同じスライドに置く。説明が指す部分は、枠で囲んで示す。

コードは、枠からはみ出さない長さで改行する。

### 色

表の見出し、カードの見出し、枠線及び背景の色は、全てのスライドで統一する。特定の図形だけに別の色を付けない。

---

## 6. 保存

Node.jsで生成したファイルは、`writeFile({ fileName })`で保存する。

---

## 7. 確認

ファイルを生成した後、PowerPointで全てのスライドを開き、次の項目を確認する。

- 文字が枠又はスライドからはみ出していないこと。
- 図形、表及びカードが互いに重なっていないこと。
- シーケンス図の線が途切れていないこと。

---

## 8. 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2. 作成ツール | [Installation \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/installation/) | PptxGenJSの導入方法を示す。 |
| 2. 作成ツール | [Quick Start Guide \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/quick-start/) | PptxGenJSでプレゼンテーションを生成する手順を示す。 |
| 3. スライドの構成 | [Presentation Options \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/usage-pres-options/) | レイアウト及びプレゼンテーションの情報の設定方法を示す。 |
| 3. スライドの構成 | [Masters and Placeholders \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/masters/) | スライドマスターの定義方法を示す。 |
| 3. スライドの構成 | [Speaker Notes \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/speaker-notes/) | スピーカーノートの追加方法を示す。 |
| 4. 文字 | [Text \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/api-text/) | テキストの書式の指定方法を示す。 |
| 5. 図表 | [Tables \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/api-tables/) | 表の作成方法を示す。 |
| 5. 図表 | [Charts \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/api-charts/) | グラフの作成方法を示す。 |
| 5. 図表 | [Images \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/api-images/) | 画像の挿入方法を示す。 |
| 5. 図表 | [Shapes \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/api-shapes/) | 図形の描画方法を示す。 |
| 6. 保存 | [Saving Presentations \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/usage-saving/) | プレゼンテーションの保存方法を示す。 |
