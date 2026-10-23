# PDFからの画像抽出ガイドライン

## 1 適用範囲

このガイドラインは，PDFに含まれる図を抽出し，Markdownに埋め込んでDOCXへ変換する場合に適用する。

抽出した図の形式及び解像度は，[MarkdownからDOCXへの変換ガイドライン](docx-export-guidelines.md)の3.3による。SVGをPNGに変換する方法は，[SVGからPNGへの変換ガイドライン](svg-to-png-guidelines.md)による。

## 2 抽出方針

### 2.1 図の種類

PDFの図には，線及び文字をPDFの描画命令で描いたベクター図と，写真又はスクリーンショットなどの画像をPDFに埋め込んだラスター画像とがある。図の種類ごとに，[表1](#table-1)の方法で抽出する。

<a id="table-1"></a>表1−図の種類と抽出方法

| 図の種類 | 抽出方法 | 抽出結果 |
| --- | --- | --- |
| ベクター図 | 図の範囲をPDFとして切り出し，SVGに変換する（[4.2](#42-ベクター図の抽出)参照）。 | ベクター形式を保持したSVG。 |
| ラスター画像 | PDFに埋め込まれた画像のデータを取り出す（[4.3](#43-ラスター画像の抽出)参照）。 | PDFに埋め込まれた画素数及び符号化形式のままの画像。 |

ページ全体を画像として描画してから図を切り抜く方法は，用いない。ベクター図はその解像度の画像になり，拡大すると線及び文字の縁がぼける。ラスター画像は描画時に画素が再標本化され，元の画素の値が失われる。

### 2.2 抽出する範囲

図の題名及び出典は，抽出する範囲に含めない。題名及び出典は，[技術文書作成ガイドライン](technical-document-guidelines.md)の16章によってMarkdownに記載する。

### 2.3 ツール

抽出には，PopplerのCLIを用いる。Popplerは，ページの情報の表示（`pdfinfo`），埋め込み画像の一覧表示及び抽出（`pdfimages`），文字の座標の出力（`pdftotext`），並びにページの範囲を指定したPDF，SVG及びPNGへの変換（`pdftocairo`）を，一つのパッケージで提供する。

## 3 抽出環境

### 3.1 Windows

wingetでPopplerをインストールする。

```powershell
winget install --id oschwartz10612.Poppler -e
```

インストール後に新しいターミナルを開き，次のコマンドで版が表示されることを確認する。

```powershell
pdftocairo -v
```

### 3.2 macOS

HomebrewでPopplerをインストールする。

```shell
brew install poppler
```

次のコマンドで版が表示されることを確認する。

```shell
pdftocairo -v
```

### 3.3 Ubuntu

APTでPopplerのCLIをインストールする。

```shell
sudo apt-get install -y poppler-utils
```

次のコマンドで版が表示されることを確認する。

```shell
pdftocairo -v
```

## 4 抽出手順

### 4.1 図の種類の判別

図があるページの番号を確認する。ページの番号は，PDFの先頭のページを1とする番号であり，文書に印刷されたページ番号とは異なる場合がある。

次のコマンドで，そのページに埋め込まれた画像を一覧表示する。

```shell
pdfimages -list -f <page> -l <page> <input.pdf>
```

図の位置に，図の大きさの画像が一覧にある場合はラスター画像として[4.3](#43-ラスター画像の抽出)によって抽出する。一覧にない場合はベクター図として[4.2](#42-ベクター図の抽出)によって抽出する。一覧の`type`が`smask`の行は，直前の画像の透過情報であり，図の本体ではない。

### 4.2 ベクター図の抽出

#### 4.2.1 範囲の特定

図の範囲を，ページの左上を原点とするポイント単位の座標で特定する。次のコマンドは，ページ内の各語の座標をポイント単位で出力する。図の中の文字及び図の題名の座標から，図の範囲の左上の座標，幅及び高さを決める。

```shell
pdftotext -f <page> -l <page> -bbox-layout <input.pdf> <page>.html
```

範囲を目視で確認する場合は，次のコマンドでページを72 dpiのPNGに描画する。72 dpiでは1ピクセルが1ポイントに相当するため，画像上のピクセル座標をそのまま範囲の座標に用いる。この画像は範囲の確認だけに用い，図としては用いない。

```shell
pdftocairo -png -singlefile -r 72 -f <page> -l <page> <input.pdf> <page>
```

#### 4.2.2 SVGへの変換

次のコマンドで，図の範囲だけを含むPDFを作成し，SVGに変換する。

```shell
pdftocairo -pdf -f <page> -l <page> -x <x> -y <y> -W <width> -H <height> -paperw <width> -paperh <height> <input.pdf> <figure>.pdf
pdftocairo -svg <figure>.pdf <figure>.svg
```

1行目のパラメーターを[表2](#table-2)に示す。

<a id="table-2"></a>表2−範囲を切り出すコマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `-f`，`-l` | `<page>`：図があるページの番号。 |
| `-x`，`-y` | `<x>`，`<y>`：図の範囲の左上の座標（単位 pt）。ページの左上を原点とする。 |
| `-W`，`-H` | `<width>`，`<height>`：図の範囲の幅及び高さ（単位 pt）。 |
| `-paperw`，`-paperh` | `<width>`，`<height>`：出力するページの幅及び高さ（単位 pt）。`-W` 及び `-H` と同じ値を指定する。 |

`-paperw` 及び `-paperh` を省略すると，切り出した範囲が元のページと同じ大きさのページの中央に配置され，図の周囲に余白が残る。

SVGでは，文字は字形の輪郭を表すパスとして出力される。図の見た目は元のPDFと一致するが，SVG内の文字は検索及び選択の対象にならない。

#### 4.2.3 PNGへの変換

SVGを扱えない変換ツール又は表示先へ図を渡す場合は，[SVGからPNGへの変換ガイドライン](svg-to-png-guidelines.md)によって，4.2.2で作成したSVGをPNGに変換する。PDFから直接PNGを描画しない。

### 4.3 ラスター画像の抽出

次のコマンドで，ページに埋め込まれた画像を抽出する。

```shell
pdfimages -all -f <page> -l <page> <input.pdf> <prefix>
```

`-all` を指定すると，JPEGで埋め込まれた画像はJPEGのまま，その他の多くの画像はPNGとして，再圧縮せずに出力される。出力されるファイルの名前は，`<prefix>-000.jpg` のように，`<prefix>` に画像の番号を付けたものになる。4.1の一覧の`num`の列が，画像の番号に対応する。

抽出した画像の画素数を変えず，非可逆圧縮の形式に変換しない。

## 5 確認

抽出後に，[表3](#table-3)の項目を確認する。

<a id="table-3"></a>表3−確認項目

| 項目 | 確認方法 |
| --- | --- |
| 範囲 | 図の端が切れておらず，図の題名，本文及び余分な余白を含まない。 |
| 形式 | ベクター図はSVGであり，ラスター画像は4.1の一覧の画素数と同じ画素数である。 |
| 文字 | SVGをPNGに変換して等倍で表示し，文字が元のPDFと同じ字形で描画されている。 |
| 出典 | Markdownの図の題名に，出典の文書，版，図番号及びページの番号を記載している。 |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2章 | [Poppler](https://poppler.freedesktop.org/) | PDFを描画するライブラリー及びCLIを提供するPopplerの公式サイト。 |
| 3章 | [GitHub - oschwartz10612/poppler-windows: Download Poppler binaries packaged for Windows with dependencies · GitHub](https://github.com/oschwartz10612/poppler-windows) | wingetでインストールするWindows向けのPopplerを配布するリポジトリ。 |
| 3章 | [Homebrew Formulae: poppler](https://formulae.brew.sh/formula/poppler) | macOS向けのPopplerのHomebrewのパッケージ。 |
| 3章 | ['install' コマンド \| Microsoft Learn](https://learn.microsoft.com/ja-jp/windows/package-manager/winget/install) | wingetでパッケージをインストールするコマンドを説明する文書。 |
| 4章 | [pdftocairo(1) — poppler-utils — Debian trixie — Debian Manpages](https://manpages.debian.org/trixie/poppler-utils/pdftocairo.1.en.html) | ページの範囲を切り出してPDF，SVG及びPNGに変換するコマンドの説明。ベクター出力での範囲の単位及び配置を説明する。 |
| 4章 | [pdfimages(1) — poppler-utils — Debian trixie — Debian Manpages](https://manpages.debian.org/trixie/poppler-utils/pdfimages.1.en.html) | PDFに埋め込まれた画像を一覧表示及び抽出するコマンドの説明。 |
| 4章 | [pdftotext(1) — poppler-utils — Debian trixie — Debian Manpages](https://manpages.debian.org/trixie/poppler-utils/pdftotext.1.en.html) | ページ内の語の座標を出力するコマンドの説明。 |
