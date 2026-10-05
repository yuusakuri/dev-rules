# PowerPoint作成ガイドライン

## 目次

1. [概要](#1-概要)
2. [作成ツール](#2-作成ツール)
3. [スライドの構成](#3-スライドの構成)
4. [文字](#4-文字)
5. [図表](#5-図表)
6. [保存](#6-保存)
7. [参考文献](#7-参考文献)

---

## 1. 概要

本書は、PowerPointのプレゼンテーションの作成方法を定義する。本書は、[TypeScript実装ガイドライン](../implementation/typescript-guidelines.md)を前提とする。

---

## 2. 作成ツール

PowerPointのファイル（`.pptx`）は、[PptxGenJS](https://gitbrent.github.io/PptxGenJS/)を用いたスクリプトで生成する。

PptxGenJSは、`npm install pptxgenjs`で導入する。

スクリプトは、TypeScriptで記述する。

内容を変更する場合は、スクリプトを変更してファイルを再生成する。

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

---

## 4. 文字

文字の書体は、`fontFace`で指定する。

日本語の文字を含むテキストには、`lang`に`ja-JP`を指定する。

テキストの位置及び大きさは、`x`、`y`、`w`及び`h`にインチ単位の数値で指定する。

---

## 5. 図表

表は、`addTable()`で作成する。

グラフは、`addChart()`で作成する。

画像は、`addImage()`で挿入する。

---

## 6. 保存

Node.jsで生成したファイルは、`writeFile({ fileName })`で保存する。

---

## 7. 参考文献

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
| 6. 保存 | [Saving Presentations \| PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/usage-saving/) | プレゼンテーションの保存方法を示す。 |
