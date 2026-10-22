# SVGからPNGへの変換ガイドライン

## 1 適用範囲

このガイドラインは，SVGの図をPNGに変換する場合に適用する。SVGを扱えない変換ツール又は表示先へ図を渡す場合に用いる。

PNGの解像度は，[MarkdownからDOCXへの変換ガイドライン](docx-export-guidelines.md)の3.3による。

## 2 変換方針

### 2.1 アンチエイリアス

SVGを描画する処理は，図形及び文字の縁にかかる画素を，縁が画素を覆う割合に応じた中間色で塗る。これをアンチエイリアスという。アンチエイリアスは描画した解像度の画素に対して働くため，PNGの画質は次の条件で決まる。

a) SVGから直接，最終的なピクセル数で描画する。小さく描画したPNGを拡大すると，縁の中間色も拡大され，縁がぼけるか階段状になる。同じ描画エンジンで比べると，1倍で描画して4倍に拡大したPNGは，4倍で直接描画したPNGに比べ，理想的な描画との差が約30倍になった。

b) アンチエイリアスを無効にしない。SVGに`shape-rendering="crispEdges"`，`shape-rendering="optimizeSpeed"`又は`text-rendering="optimizeSpeed"`を指定しない。`crispEdges`を指定した場合，理想的な描画との差が約7倍になった。

c) 背景を白で塗りつぶして描画する。背景を透過にすると，縁の中間色が半透明の画素になり，表示先の背景色や透過の扱いによって縁の色が変わる。

d) 変換後に縮小，拡大及び非可逆圧縮をしない。PNGをJPEGなどの非可逆圧縮の形式に変換すると，縁の周囲にノイズが生じる。

### 2.2 描画エンジン

SVGの描画には，Chromiumを用いる。アンチエイリアスの精度は，Chromium，resvg及びlibrsvgのいずれも同等であるが，SVGをどこまで忠実に描画できるかが異なる。

SVGには，CSSによる書式，`@font-face`で埋め込んだフォント，複数の`tspan`要素に分けた文字列などを含むものがある。また，ブラウザーで文字の幅を測って図形を配置したSVGは，同じブラウザーの描画エンジンで描画したときに配置どおりになる。Chromium以外の描画エンジンでは，次の差異が生じる場合がある。

- librsvgは，`tspan`要素の先頭の空白を描画せず，単語の間の空白が消える。
- resvgは，`@font-face`で埋め込んだフォントを用いず，別のフォントで描画する。文字の幅が変わるため，文字が枠からはみ出すおそれがある。

Chromiumのスクリーンショットは，文字をグレースケールのアンチエイリアスで描画し，文字の縁に色が付くサブピクセルレンダリングを用いない。

## 3 変換環境

変換に必要な環境を[表1](#table-1)に示す。

<a id="table-1"></a>表1−変換環境

| 項目 | 要件 |
| --- | --- |
| Node.js | `@puppeteer/browsers`を実行するために用いる。 |
| chrome-headless-shell | 156.0.8078.47。画面を表示せずにChromiumで描画する実行ファイル。版を固定して導入する。 |
| 日本語フォント | 日本語を描画できるフォント。変換環境に導入されていない場合，日本語の文字が正しく描画されない。 |

次のコマンドで，chrome-headless-shellを`.cache/browsers`に導入する。コマンドは，導入した実行ファイルのパスを出力する。

```shell
npx @puppeteer/browsers@3.2.6 install chrome-headless-shell@156.0.8078.47 --path .cache/browsers
```

## 4 変換手順

### 4.1 描画の倍率の算出

SVGのルート要素の`viewBox`属性の幅及び高さから，描画の倍率を次の式で求める。

```text
倍率 = 3840 ÷ 幅と高さの長い方（小数第5位以下切上げ）
```

例えば，`viewBox`の幅及び高さが301及び317の場合，倍率は12.1136になる。

### 4.2 PNGへの描画

次のコマンドで，SVGをPNGに描画する。`<chrome-headless-shell>`には，[3章](#3-変換環境)で出力された実行ファイルのパスを指定する。

```shell
<chrome-headless-shell> --screenshot="$PWD/docs/images/diagram.png" \
  --window-size=301,317 --force-device-scale-factor=12.1136 \
  --hide-scrollbars --default-background-color=ffffffff \
  "file://$PWD/docs/images/diagram.svg"
```

コマンドのパラメーターを[表2](#table-2)に示す。

<a id="table-2"></a>表2−変換コマンドのパラメーター

| パラメーター | 指定値と説明 |
| --- | --- |
| `--screenshot` | 出力するPNGの絶対パス。 |
| `--window-size` | `viewBox`の幅及び高さ。小数の場合は整数に切り上げる。 |
| `--force-device-scale-factor` | [4.1](#41-描画の倍率の算出)で求めた倍率。 |
| `--hide-scrollbars` | スクロールバーを描画しない。 |
| `--default-background-color` | `ffffffff`：背景を不透明な白にする。 |
| 最後の引数 | 変換するSVGの`file://`形式のURL。 |

## 5 確認

変換後に，[表3](#table-3)の項目を確認する。

<a id="table-3"></a>表3−確認項目

| 項目 | 確認方法 |
| --- | --- |
| 解像度 | PNGの長辺が3840ピクセル以上であり，縦横比がSVGと一致する。 |
| 図の範囲 | 図の右端及び下端が切れておらず，余分な余白がない。 |
| 縁 | PNGを等倍で表示し，線及び文字の縁が滑らかである。 |
| 文字 | 空白，フォント及び日本語がSVGと同じに描画されている。 |
| 背景 | 背景が不透明な白である。 |

## 参考文献

| 本書の章 | 参考文献 | 概要 |
| --- | --- | --- |
| 2.1 | [shape-rendering - SVG \| MDN](https://developer.mozilla.org/ja/docs/Web/SVG/Reference/Attribute/shape-rendering) | 図形のアンチエイリアスを制御する`shape-rendering`属性を説明する文書。 |
| 2.1 | [text-rendering - SVG \| MDN](https://developer.mozilla.org/ja/docs/Web/SVG/Reference/Attribute/text-rendering) | 文字の描画の優先事項を指定する`text-rendering`属性を説明する文書。 |
| 3章 | [@puppeteer/browsers \| Puppeteer](https://pptr.dev/browsers-api) | chrome-headless-shellなどのブラウザーを版を指定して導入するCLIを説明する文書。 |
| 4章 | [Headless Chrome shell  \|  Automation and testing  \|  Chrome for Developers](https://developer.chrome.com/blog/chrome-headless-shell) | chrome-headless-shellの用途と，`--screenshot`及び`--window-size`によるスクリーンショットの取得方法を説明する文書。 |
