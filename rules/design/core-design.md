# DS-100 コアデザイン規則

本書の適用条件を明確にするため、管理情報を次のとおり定める。

| 文書属性 | 設定値 |
| -------- | ------ |
| 文書ID | DS-100 |
| 適用範囲 | UIを持つすべてのWebプロジェクト |

## 1. 目的

この文書は、特定のUIライブラリやフレームワークに依存しない、UIの視覚表現、レイアウト、状態、動きの共通規則を定める。

## 2. トークン体系

UIで共有するデザイン値はトークンとして定義する。基礎的な尺度や固定値はトークン、用途・状態・テーマに応じて値が決まるものはセマンティックトークンとして扱う。

| 種類 | 用途 | 例 |
| --- | --- | --- |
| トークン | UI全体で共有する尺度や固定値 | `spacing.4` |
| セマンティックトークン | 用途、状態、テーマに応じて参照する値 | `color.fg.default` |

### 2.1 本書でのトークン表記

本書ではトークンを識別するため、`color.fg.default`のように`.`で階層を区切って表記する。この表記は仕様書上の識別形式であり、実装上のAPI名、CSSカスタムプロパティ名、設定ファイル上のキー名を指定するものではない。

可変部分や省略部分は次のように表記する。

| 表記 | 意味 | 例 |
| --- | --- | --- |
| `<...>` | 実際の名前に置き換える部分 | `color.<palette>.9` |
| `*` | 同じ階層以下にある複数の値 | `color.<palette>.solid.*` |

小数を含む尺度名は、本書では階層の区切りと区別するため`spacing.0-5`のようにハイフンで表す。実装では使用する技術の命名規則に対応付ける。

### 2.2 単位と換算表記

実装間で単位の扱いを揃えるため、値種別ごとの正規単位と仕様書表記を次のとおりとする。

remのpx換算は`1rem = 16px`として併記する。`html`要素の`font-size`は固定しない。

| 値種別 | 正規単位 | 仕様書表記 | 使用箇所 |
| ------ | -------- | ---------- | -------- |
| 拡大へ追従する寸法 | rem | `2.5rem（40px）` | 間隔、幅と高さ、文字サイズ、絶対値の行高、`radius.xs`から`radius.4xl`までの角丸 |
| 画素精度を保つ寸法 | px | `1px` | 境界線、区切り線、フォーカス線、微細な位置補正 |
| 影とぼかし | px | `0 4px 8px`、`12px` | box-shadow、text-shadow、filter、backdrop-filter |
| ブレークポイント | px | `768px` | media queryの最小幅 |
| 相対寸法 | `%`、`em`、`ch` | `100%`、`0em`、`65ch` | 親基準寸法、字間、文章幅 |
| ビューポート寸法 | `dvh`など | `100dvh` | 画面高へ追従する面 |
| 時間 | ms | `150ms` | transition、animation |
| 比率と順序 | 単位なし | `1.5`、`1400` | 相対行高、opacity、z-index、aspect-ratio |

## 3. 色

### 3.1 色の定義

色相パレットの値と12段階の用途はRadix Colorsに合わせる。通常色、ダーク色、アルファ色を一つのテーマ対応パレットとして扱うため、色相パレットはセマンティックトークンとして定義する。

すべての色を同じ形式で識別できるよう、本書では色トークンを`color.*`として表記する。`<palette>`には`blue`、`indigo`、`slate`などの実際のパレット名を指定する。例えばBlueでは`color.blue.9`、`color.blue.a3`、`color.blue.solid.bg`を定義する。

| 種類 | 定義種別 | 本書での表記 | 内容 |
| ---- | -------- | ------------ | ---- |
| 単色 | トークン | `color.black`、`color.white` | テーマによらない黒と白 |
| Black / White Alpha | トークン | `color.black.a1`〜`color.black.a12`、`color.white.a1`〜`color.white.a12` | 黒・白のアルファ色 |
| 色相パレット | セマンティックトークン | `color.<palette>.1`〜`color.<palette>.12`、`color.<palette>.a1`〜`color.<palette>.a12` | Radix ColorsのLight / Dark / Alphaをテーマに応じて切り替える色段階 |
| カラーバリアント | セマンティックトークン | `color.<palette>.solid.*`、`subtle.*`、`surface.*`、`outline.*`、`plain.*` | 各パレットの用途別の色 |
| グレー共通参照 | セマンティックトークン | `color.gray.*` | プロジェクトで選択したグレーパレットを共通名で参照するためのトークン |

### 3.2 パレット

背景・文字と主要な操作色の調和を保つため、プロジェクトではグレーパレットと主要アクセントパレットを1つずつ選ぶ。状態表示など、意味に応じて使用する色は主要アクセントパレットとは別に扱う。グレーパレットではRadix Colorsの`gray`を`neutral`として扱う。

選択対象は次のとおりとする。

| パレット種別 | 選択肢 |
| ------------ | ------ |
| グレーパレット | `neutral`、`mauve`、`olive`、`sage`、`sand`、`slate` |
| アクセントパレット | `neutral`、`tomato`、`red`、`ruby`、`crimson`、`pink`、`plum`、`purple`、`violet`、`iris`、`indigo`、`blue`、`cyan`、`teal`、`jade`、`green`、`grass`、`bronze`、`gold`、`brown`、`orange`、`amber`、`yellow`、`lime`、`mint`、`sky` |

選択したグレーパレットは`color.gray.*`に対応付け、アクセントパレットは実際のパレット名で参照する。

色相の調和を保つため、`neutral`以外のグレーパレットを使用する場合はRadix Colorsの自然な組み合わせを次のとおり使用する。

| グレーパレット | アクセントパレット |
| -------------- | ------------------ |
| `mauve` | `tomato`、`red`、`ruby`、`crimson`、`pink`、`plum`、`purple`、`violet` |
| `olive` | `grass`、`lime` |
| `sage` | `mint`、`teal`、`jade`、`green` |
| `sand` | `yellow`、`amber`、`orange`、`brown` |
| `slate` | `iris`、`indigo`、`blue`、`sky`、`cyan` |

`neutral`は任意のアクセントパレットと組み合わせられる。

### 3.3 色段階

色相パレットにはLightとDarkの12段階があり、それぞれにAlphaがある。各段階はテーマが変わっても同じ用途を保ち、値はRadix Colorsに合わせる。

各色段階はRadix Colorsが想定する代表的な用途を次のとおり示す。共有セマンティック色とカラーバリアントでは、3.4および3.5で定める対応を使用する。

| 通常段階 | アルファ段階 | 使用箇所 |
| -------- | ------------ | -------- |
| `1` | `a1` | アプリケーション背景 |
| `2` | `a2` | 控えめな背景 |
| `3` | `a3` | UI部品の通常背景 |
| `4` | `a4` | UI部品のホバー背景 |
| `5` | `a5` | UI部品の押下・選択背景 |
| `6` | `a6` | 非操作部品の境界線・区切り線 |
| `7` | `a7` | UI部品の境界線・フォーカス線 |
| `8` | `a8` | UI部品のホバー時の境界線 |
| `9` | `a9` | 塗りつぶし背景 |
| `10` | `a10` | 塗りつぶし背景のホバー |
| `11` | `a11` | 補助文字 |
| `12` | `a12` | 主要文字 |

Black AlphaとWhite Alphaは次の不透明度尺度とする。

| 段階 | 不透明度 |
| ---- | -------: |
| `a1` | `5%` |
| `a2` | `10%` |
| `a3` | `15%` |
| `a4` | `20%` |
| `a5` | `30%` |
| `a6` | `40%` |
| `a7` | `50%` |
| `a8` | `60%` |
| `a9` | `70%` |
| `a10` | `80%` |
| `a11` | `90%` |
| `a12` | `95%` |

### 3.4 セマンティック色

文字、ページ背景、境界線、エラーなど、複数のUIで同じ意味を持つ色だけを共有セマンティックトークンとして定義する。

共有セマンティック色として次のトークンを使用する。

| セマンティックトークン | 参照先 | 使用箇所 |
| -------------------------- | ------ | -------- |
| `color.canvas` | `color.gray.1` | ページ背景 |
| `color.fg.default` | `color.gray.12` | 主要文字 |
| `color.fg.muted` | `color.gray.11` | 補助文字 |
| `color.fg.subtle` | `color.gray.10` | プレースホルダーなど、さらに弱い文字 |
| `color.border` | `color.gray.4` | 一般の境界線・区切り線 |
| `color.error` | `color.red.9` | 不正・エラー状態 |

### 3.5 カラーバリアント

色を選択可能なコンポーネントで状態ごとの見た目を揃えるため、`solid`、`subtle`、`surface`、`outline`、`plain`を各パレットのセマンティックトークンとして定義する。

`neutral`をアクセントパレットとして使用する場合は、後述するグレーパレットと同じバリアント構造を使用する。`neutral`以外のアクセントパレットでは`<palette>`を実際のパレット名に置き換え、次の対応を使用する。

| バリアント | トークン | 参照先 |
| ---------- | -------- | ------ |
| `solid` | `color.<palette>.solid.bg` | `color.<palette>.9` |
| | `color.<palette>.solid.bg.hover` | `color.<palette>.10` |
| | `color.<palette>.solid.fg` | 原則`color.white`。`sky`、`mint`、`lime`、`yellow`、`amber`はLightで`color.gray.12`、Darkで`color.gray.1` |
| `subtle` | `color.<palette>.subtle.bg` | `color.<palette>.a3` |
| | `color.<palette>.subtle.bg.hover` | `color.<palette>.a4` |
| | `color.<palette>.subtle.bg.active` | `color.<palette>.a5` |
| | `color.<palette>.subtle.fg` | `color.<palette>.a11` |
| `surface` | `color.<palette>.surface.bg` | `color.<palette>.a2` |
| | `color.<palette>.surface.bg.active` | `color.<palette>.a3` |
| | `color.<palette>.surface.border` | `color.<palette>.a6` |
| | `color.<palette>.surface.border.hover` | `color.<palette>.a7` |
| | `color.<palette>.surface.fg` | `color.<palette>.a11` |
| `outline` | `color.<palette>.outline.bg.hover` | `color.<palette>.a2` |
| | `color.<palette>.outline.bg.active` | `color.<palette>.a3` |
| | `color.<palette>.outline.border` | `color.<palette>.a7` |
| | `color.<palette>.outline.fg` | `color.<palette>.a11` |
| `plain` | `color.<palette>.plain.bg.hover` | `color.<palette>.a3` |
| | `color.<palette>.plain.bg.active` | `color.<palette>.a4` |
| | `color.<palette>.plain.fg` | `color.<palette>.a11` |

グレーパレットでは、選択したグレーパレットを`color.gray.*`として次のように参照する。

| バリアント | トークン | Light | Dark |
| ---------- | -------- | ----- | ---- |
| `solid` | `color.gray.solid.bg` | `color.black` | `color.white` |
| | `color.gray.solid.bg.hover` | `color.gray.12` | `color.gray.12` |
| | `color.gray.solid.fg` | `color.white` | `color.black` |
| `subtle` | `color.gray.subtle.bg` | `color.gray.a3` | `color.gray.a3` |
| | `color.gray.subtle.bg.hover` | `color.gray.a4` | `color.gray.a4` |
| | `color.gray.subtle.bg.active` | `color.gray.a5` | `color.gray.a5` |
| | `color.gray.subtle.fg` | `color.gray.a12` | `color.gray.a12` |
| `surface` | `color.gray.surface.bg` | `color.white` | `color.gray.1` |
| | `color.gray.surface.bg.hover` | `color.gray.2` | `color.gray.2` |
| | `color.gray.surface.bg.active` | `color.gray.3` | `color.gray.3` |
| | `color.gray.surface.border` | `color.gray.6` | `color.gray.6` |
| | `color.gray.surface.border.hover` | `color.gray.7` | `color.gray.7` |
| | `color.gray.surface.fg` | `color.gray.12` | `color.gray.12` |
| `outline` | `color.gray.outline.bg.hover` | `color.gray.a2` | `color.gray.a2` |
| | `color.gray.outline.bg.active` | `color.gray.a3` | `color.gray.a3` |
| | `color.gray.outline.border` | `color.gray.6` | `color.gray.6` |
| | `color.gray.outline.fg` | `color.gray.12` | `color.gray.12` |
| `plain` | `color.gray.plain.bg.hover` | `color.gray.a3` | `color.gray.a3` |
| | `color.gray.plain.bg.active` | `color.gray.a4` | `color.gray.a4` |
| | `color.gray.plain.fg` | `color.gray.12` | `color.gray.12` |

### 3.6 コントラスト

文字や操作要素を判別しやすくするため、[Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)のコントラスト要件を設計上の参考基準として念頭に置く。

文字については[Understanding Success Criterion 1.4.3: Contrast (Minimum) \| WAI \| W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)、非テキスト情報については[Understanding Success Criterion 1.4.11: Non-text Contrast \| WAI \| W3C](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)を参考にし、次の値を設計目標とする。

| 表示要素 | 設計目標のコントラスト比 |
| -------- | -----------------------: |
| 通常の文字 | 4.5:1 |
| `24px`以上の文字 | 3:1 |
| `18.5px`以上かつ`font-weight: 700`以上の文字 | 3:1 |
| UI部品または状態を識別するために必要な非テキスト情報（無効状態を除く） | 3:1 |
| 内容の理解に必要な図形 | 3:1 |

## 4. レイアウト

### 4.1 共通尺度

間隔と寸法には同じ数値尺度を使用する。間隔には`spacing.*`、幅、高さ、アイコンなどの寸法には`size.*`を使用する。

| 間隔トークン | 寸法トークン | 値 |
| --- | --- | ---: |
| `spacing.0` | `size.0` | `0` |
| `spacing.0-5` | `size.0-5` | `0.125rem（2px）` |
| `spacing.1` | `size.1` | `0.25rem（4px）` |
| `spacing.1-5` | `size.1-5` | `0.375rem（6px）` |
| `spacing.2` | `size.2` | `0.5rem（8px）` |
| `spacing.2-5` | `size.2-5` | `0.625rem（10px）` |
| `spacing.3` | `size.3` | `0.75rem（12px）` |
| `spacing.3-5` | `size.3-5` | `0.875rem（14px）` |
| `spacing.4` | `size.4` | `1rem（16px）` |
| `spacing.4-5` | `size.4-5` | `1.125rem（18px）` |
| `spacing.5` | `size.5` | `1.25rem（20px）` |
| `spacing.5-5` | `size.5-5` | `1.375rem（22px）` |
| `spacing.6` | `size.6` | `1.5rem（24px）` |
| `spacing.7` | `size.7` | `1.75rem（28px）` |
| `spacing.8` | `size.8` | `2rem（32px）` |
| `spacing.9` | `size.9` | `2.25rem（36px）` |
| `spacing.10` | `size.10` | `2.5rem（40px）` |
| `spacing.11` | `size.11` | `2.75rem（44px）` |
| `spacing.12` | `size.12` | `3rem（48px）` |
| `spacing.14` | `size.14` | `3.5rem（56px）` |
| `spacing.16` | `size.16` | `4rem（64px）` |
| `spacing.20` | `size.20` | `5rem（80px）` |
| `spacing.24` | `size.24` | `6rem（96px）` |
| `spacing.28` | `size.28` | `7rem（112px）` |
| `spacing.32` | `size.32` | `8rem（128px）` |
| `spacing.36` | `size.36` | `9rem（144px）` |
| `spacing.40` | `size.40` | `10rem（160px）` |
| `spacing.44` | `size.44` | `11rem（176px）` |
| `spacing.48` | `size.48` | `12rem（192px）` |
| `spacing.52` | `size.52` | `13rem（208px）` |
| `spacing.56` | `size.56` | `14rem（224px）` |
| `spacing.60` | `size.60` | `15rem（240px）` |
| `spacing.64` | `size.64` | `16rem（256px）` |
| `spacing.72` | `size.72` | `18rem（288px）` |
| `spacing.80` | `size.80` | `20rem（320px）` |
| `spacing.96` | `size.96` | `24rem（384px）` |

### 4.2 間隔

コンポーネント間の間隔はそれらを配置する親レイアウトが管理する。間隔には間隔トークンを使用する。

### 4.3 寸法

数値尺度では表せない共通の幅や相対寸法には、次の寸法トークンを使用する。

| トークン | 寸法 |
| --- | ---: |
| `size.xs` | `20rem（320px）` |
| `size.sm` | `24rem（384px）` |
| `size.md` | `28rem（448px）` |
| `size.lg` | `32rem（512px）` |
| `size.xl` | `36rem（576px）` |
| `size.2xl` | `42rem（672px）` |
| `size.3xl` | `48rem（768px）` |
| `size.4xl` | `56rem（896px）` |
| `size.5xl` | `64rem（1024px）` |
| `size.6xl` | `72rem（1152px）` |
| `size.7xl` | `80rem（1280px）` |
| `size.8xl` | `90rem（1440px）` |
| `size.prose` | `65ch` |
| `size.full` | `100%` |
| `size.min` | `min-content` |
| `size.max` | `max-content` |
| `size.fit` | `fit-content` |

### 4.4 アスペクト比

画像や面の縦横比を共通値で指定できるよう、次のトークンを使用する。

| トークン | アスペクト比 |
| -------- | ------------ |
| `aspect-ratio.square` | `1 / 1` |
| `aspect-ratio.landscape` | `4 / 3` |
| `aspect-ratio.portrait` | `3 / 4` |
| `aspect-ratio.wide` | `16 / 9` |
| `aspect-ratio.ultrawide` | `18 / 5` |
| `aspect-ratio.golden` | `1.618 / 1` |

### 4.5 レスポンシブ

レイアウトは利用可能な幅に追従できる構造を優先する。幅による明示的な切り替えが必要な場合は、対象に応じて次のとおり使い分ける。

| 対象 | 規則 |
| --- | --- |
| コンポーネント自身の表示幅で変わる | コンテナクエリーを使用する。 |
| 画面全体の構成が変わる | ビューポートのメディアクエリーを使用する。 |

ビューポートのメディアクエリーで共通の切り替え位置が必要な場合は、次のブレークポイントを使用する。

| トークン | 最小幅 |
| --- | ---: |
| `breakpoint.sm` | `640px` |
| `breakpoint.md` | `768px` |
| `breakpoint.lg` | `1024px` |
| `breakpoint.xl` | `1280px` |
| `breakpoint.2xl` | `1536px` |

## 5. 文字

### 5.1 フォント

本文とコードなど用途に応じた書体を一貫させるため、フォントファミリーを次のとおり定義する。

| トークン | `font-family` |
| -------- | ------------- |
| `font-family.sans` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` |
| `font-family.serif` | `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` |
| `font-family.mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |

### 5.2 文字サイズ

文字サイズを共通尺度で指定できるよう、次のトークンを使用する。

| トークン | 文字サイズ |
| -------- | ---------- |
| `font-size.2xs` | `0.5rem（8px）` |
| `font-size.xs` | `0.75rem（12px）` |
| `font-size.sm` | `0.875rem（14px）` |
| `font-size.md` | `1rem（16px）` |
| `font-size.lg` | `1.125rem（18px）` |
| `font-size.xl` | `1.25rem（20px）` |
| `font-size.2xl` | `1.5rem（24px）` |
| `font-size.3xl` | `1.875rem（30px）` |
| `font-size.4xl` | `2.25rem（36px）` |
| `font-size.5xl` | `3rem（48px）` |
| `font-size.6xl` | `3.75rem（60px）` |
| `font-size.7xl` | `4.5rem（72px）` |
| `font-size.8xl` | `6rem（96px）` |
| `font-size.9xl` | `8rem（128px）` |

### 5.3 テキストスタイル

文字サイズ、行高、字間の組み合わせを繰り返し定義しないよう、本文や見出しには次のテキストスタイルを使用する。

| テキストスタイル | 文字サイズ | 行の高さ | 文字間隔 | 太さ | 使用箇所 |
| --- | --- | ---: | --- | --- | --- |
| `text-style.xs` | `font-size.xs` | `1.125rem（18px）` | — | — | 注釈 |
| `text-style.sm` | `font-size.sm` | `1.25rem（20px）` | — | — | 補助本文 |
| `text-style.md` | `font-size.md` | `1.5rem（24px）` | — | — | 本文 |
| `text-style.lg` | `font-size.lg` | `1.75rem（28px）` | — | — | 大きな本文 |
| `text-style.xl` | `font-size.xl` | `1.875rem（30px）` | — | — | 小見出し |
| `text-style.2xl` | `font-size.2xl` | `2rem（32px）` | — | — | 中見出し |
| `text-style.3xl` | `font-size.3xl` | `2.375rem（38px）` | — | — | 大見出し |
| `text-style.4xl` | `font-size.4xl` | `2.75rem（44px）` | `-0.02em` | — | — |
| `text-style.5xl` | `font-size.5xl` | `3.75rem（60px）` | `-0.02em` | — | — |
| `text-style.6xl` | `font-size.6xl` | `4.5rem（72px）` | `-0.02em` | — | — |
| `text-style.7xl` | `font-size.7xl` | `5.75rem（92px）` | `-0.02em` | — | — |
| `text-style.label` | `font-size.sm` | `1.25rem（20px）` | — | `font-weight.medium` | 入力・選択部品のラベル |

### 5.4 フォントの太さ

文字の強弱を共通尺度で指定できるよう、フォントの太さには次のトークンを使用する。

| トークン | 太さ |
| --- | ---: |
| `font-weight.thin` | `100` |
| `font-weight.extralight` | `200` |
| `font-weight.light` | `300` |
| `font-weight.normal` | `400` |
| `font-weight.medium` | `500` |
| `font-weight.semibold` | `600` |
| `font-weight.bold` | `700` |
| `font-weight.extrabold` | `800` |
| `font-weight.black` | `900` |

### 5.5 相対行高

テキストスタイル以外で行高を相対指定する場合は、次のトークンを使用する。

| トークン | 行高 |
| --- | ---: |
| `line-height.none` | `1` |
| `line-height.tight` | `1.25` |
| `line-height.snug` | `1.375` |
| `line-height.normal` | `1.5` |
| `line-height.relaxed` | `1.625` |
| `line-height.loose` | `2` |

### 5.6 文字間隔

テキストスタイル以外で文字間隔を指定する場合は、次のトークンを使用する。

| トークン | 文字間隔 |
| --- | ---: |
| `letter-spacing.tighter` | `-0.05em` |
| `letter-spacing.tight` | `-0.025em` |
| `letter-spacing.normal` | `0` |
| `letter-spacing.wide` | `0.025em` |
| `letter-spacing.wider` | `0.05em` |
| `letter-spacing.widest` | `0.1em` |

## 6. 角丸

### 6.1 角丸尺度

角丸の大きさを共通尺度で指定できるよう、次のトークンを使用する。

| トークン | 角丸 |
| --- | ---: |
| `radius.none` | `0` |
| `radius.xs` | `0.125rem（2px）` |
| `radius.sm` | `0.25rem（4px）` |
| `radius.md` | `0.375rem（6px）` |
| `radius.lg` | `0.5rem（8px）` |
| `radius.xl` | `0.75rem（12px）` |
| `radius.2xl` | `1rem（16px）` |
| `radius.3xl` | `1.5rem（24px）` |
| `radius.4xl` | `2rem（32px）` |
| `radius.full` | `9999px` |

### 6.2 セマンティック角丸

部品の内外関係に応じて角丸を選べるよう、共有する角丸の階層を次のセマンティックトークンとして定義する。

| セマンティックトークン | トークン | 使用箇所 |
| --- | --- | --- |
| `radius.l1` | `radius.xs` | コンポーネント内部の小さな部品 |
| `radius.l2` | `radius.sm` | 操作部品 |
| `radius.l3` | `radius.md` | カード、オーバーレイなどの外側の面 |

## 7. 影

コンポーネントがテーマ別の実値を意識せず影を参照できるよう、影はライトとダークで値が切り替わるセマンティックトークンとして定義する。

| セマンティックトークン | テーマ | `box-shadow` |
| -------------------------- | ------ | ------------ |
| `shadow.xs` | `light` | `0 1px 2px color.gray.a6, 0 0 1px color.gray.a7` |
| `shadow.xs` | `dark` | `0 1px 1px color.black.a8, 0 0 1px inset color.gray.a8` |
| `shadow.sm` | `light` | `0 2px 4px color.gray.a4, 0 0 1px color.gray.a4` |
| `shadow.sm` | `dark` | `0 2px 4px color.black.a8, 0 0 1px inset color.gray.a8` |
| `shadow.md` | `light` | `0 4px 8px color.gray.a4, 0 0 1px color.gray.a4` |
| `shadow.md` | `dark` | `0 4px 8px color.black.a8, 0 0 1px inset color.gray.a8` |
| `shadow.lg` | `light` | `0 8px 16px color.gray.a4, 0 0 1px color.gray.a4` |
| `shadow.lg` | `dark` | `0 8px 16px color.black.a8, 0 0 1px inset color.gray.a8` |
| `shadow.xl` | `light` | `0 16px 24px color.gray.a4, 0 0 1px color.gray.a4` |
| `shadow.xl` | `dark` | `0 16px 24px color.black.a8, 0 0 1px inset color.gray.a8` |
| `shadow.2xl` | `light` | `0 24px 40px color.gray.a4, 0 0 1px color.gray.a4` |
| `shadow.2xl` | `dark` | `0 24px 40px color.black.a8, 0 0 1px inset color.gray.a8` |
| `shadow.inset` | `light` | `inset 8px 0 12px -8px color.gray.a4` |
| `shadow.inset` | `dark` | `inset 8px 0 12px -8px color.black.a6` |

## 8. 重なり

浮動面や固定要素の前後関係を一貫させるため、重なり順は次のトークンで管理する。

| トークン | `z-index`値 | 使用箇所 |
| -------- | -----------: | -------- |
| `z-index.hide` | `-1` | 背面へ移す要素 |
| `z-index.base` | `0` | 通常配置 |
| `z-index.docked` | `10` | 画面端へ固定する部品 |
| `z-index.dropdown` | `1000` | ドロップダウン |
| `z-index.sticky` | `1100` | 固定ヘッダー |
| `z-index.banner` | `1200` | ページバナー |
| `z-index.overlay` | `1300` | オーバーレイ背景 |
| `z-index.modal` | `1400` | モーダル |
| `z-index.popover` | `1500` | ポップオーバー |
| `z-index.skip-link` | `1600` | スキップリンク |
| `z-index.toast` | `1700` | トースト |
| `z-index.tooltip` | `1800` | ツールチップ |

## 9. ぼかし

ぼかし量を共通尺度で指定できるよう、次のトークンを使用する。

| トークン | ぼかし値 |
| -------- | --: |
| `blur.xs` | `4px` |
| `blur.sm` | `8px` |
| `blur.md` | `12px` |
| `blur.lg` | `16px` |
| `blur.xl` | `24px` |
| `blur.2xl` | `40px` |
| `blur.3xl` | `64px` |

## 10. 状態表現

複数のコンポーネントで共有する状態表現を定義する。

### 10.1 無効状態

操作できない状態を一貫して示すため、次の値を適用する。

| CSSプロパティ | CSS値 |
| ------------- | ----- |
| `cursor` | `not-allowed` |
| `opacity` | `0.67` |
| `filter` | `grayscale(100%)` |

## 11. 動き

### 11.1 時間

一般的な状態変化の速度をコンポーネント間で揃えるため、共通の状態変化には次のトークンを使用する。この尺度に対応しない個別のアニメーションでは、個別の時間を使用できる。

| トークン | 時間 |
| -------- | ---: |
| `duration.fastest` | `50ms` |
| `duration.faster` | `100ms` |
| `duration.fast` | `150ms` |
| `duration.normal` | `200ms` |
| `duration.slow` | `250ms` |
| `duration.slower` | `300ms` |
| `duration.slowest` | `400ms` |

利用者の動き低減設定を反映できるよう、動き設定ごとの時間と繰り返しアニメーションの扱いを次のとおり定める。

| 動き設定 | 適用条件 | 移動・拡大縮小・高さ変化の時間 | フェード時間 | 繰り返しアニメーション |
| -------- | -------- | ------------------------------ | ------------ | ---------------------- |
| `normal` | `prefers-reduced-motion: reduce`以外 | 各アニメーションで定める時間 | 各アニメーションで定める時間 | 許可 |
| `reduced` | `prefers-reduced-motion: reduce` | `0ms` | `50ms` | 禁止 |
| `none` | アプリケーションで動きを無効にする場合 | `0ms` | `0ms` | 禁止 |

### 11.2 イージング

進入、退出、通常の状態変化で速度曲線を揃えるため、イージングは次のトークンから選ぶ。

| トークン | イージング値 | 使用箇所 |
| --- | --- | --- |
| `easing.default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 通常の状態変化 |
| `easing.linear` | `linear` | 一定速度の繰り返し動作 |
| `easing.in` | `cubic-bezier(0.4, 0, 1, 1)` | 退出 |
| `easing.out` | `cubic-bezier(0, 0, 0.2, 1)` | 進入 |
| `easing.in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 双方向の状態変化 |

### 11.3 アニメーション定義

同じ種類の動きをコンポーネントごとに再定義しないよう、再利用するキーフレームを次のとおり定義する。

| キーフレーム | 開始状態 | 終了状態 |
| --- | --- | --- |
| `expand-height` | `height: 0` | `height: 内容の実寸` |
| `collapse-height` | `height: 内容の実寸` | `height: 0` |
| `expand-width` | `width: 0` | `width: 内容の実寸` |
| `collapse-width` | `width: 内容の実寸` | `width: 0` |
| `fade-in` | `opacity: 0` | `opacity: 1` |
| `fade-out` | `opacity: 1` | `opacity: 0` |
| `scale-in` | `scale: 0.95` | `scale: 1` |
| `scale-out` | `scale: 1` | `scale: 0.95` |
| `slide-from-top` | `translate: 0 -0.5rem（-8px）` | `translate: 0` |
| `slide-from-bottom` | `translate: 0 0.5rem（8px）` | `translate: 0` |
| `slide-from-left` | `translate: -0.5rem 0（-8px）` | `translate: 0` |
| `slide-from-right` | `translate: 0.5rem 0（8px）` | `translate: 0` |
| `slide-to-top` | `translate: 0` | `translate: 0 -0.5rem（-8px）` |
| `slide-to-bottom` | `translate: 0` | `translate: 0 0.5rem（8px）` |
| `slide-to-left` | `translate: 0` | `translate: -0.5rem 0（-8px）` |
| `slide-to-right` | `translate: 0` | `translate: 0.5rem 0（8px）` |
| `slide-from-top-full` | `translate: 0 -100%` | `translate: 0` |
| `slide-from-bottom-full` | `translate: 0 100%` | `translate: 0` |
| `slide-from-left-full` | `translate: -100% 0` | `translate: 0` |
| `slide-from-right-full` | `translate: 100% 0` | `translate: 0` |
| `slide-to-top-full` | `translate: 0` | `translate: 0 -100%` |
| `slide-to-bottom-full` | `translate: 0` | `translate: 0 100%` |
| `slide-to-left-full` | `translate: 0` | `translate: -100% 0` |
| `slide-to-right-full` | `translate: 0` | `translate: 100% 0` |
| `bg-position` | `background-position: 開始位置 0` | `background-position: 終了位置 0` |
| `position` | `inset-inline-start / inset-block-start: 開始位置` | `inset-inline-start / inset-block-start: 終了位置` |
| `spin` | `rotate: 0deg` | `rotate: 360deg` |
| `pulse` | — | `50%: opacity: 0.5` |

### 11.4 アニメーションスタイル

浮動面の配置方向に応じた出入り方を共通化するため、キーフレームの組み合わせを次のアニメーションスタイルとして定義する。

| アニメーションスタイル | 配置・状態 | 使用するキーフレーム |
| --- | --- | --- |
| `slide-fade-in` | 上側から表示する面 | `slide-from-bottom` + `fade-in` |
| `slide-fade-in` | 下側から表示する面 | `slide-from-top` + `fade-in` |
| `slide-fade-in` | 左側から表示する面 | `slide-from-right` + `fade-in` |
| `slide-fade-in` | 右側から表示する面 | `slide-from-left` + `fade-in` |
| `slide-fade-out` | 上側にある面 | `slide-to-bottom` + `fade-out` |
| `slide-fade-out` | 下側にある面 | `slide-to-top` + `fade-out` |
| `slide-fade-out` | 左側にある面 | `slide-to-right` + `fade-out` |
| `slide-fade-out` | 右側にある面 | `slide-to-left` + `fade-out` |
| `scale-fade-in` | 表示 | `scale-in` + `fade-in` |
| `scale-fade-out` | 非表示 | `scale-out` + `fade-out` |

## 12. 参考資料

本書で外部資料または公開実装を基準とした箇所について、出所を追跡できるよう対応関係を次のとおり示す。各資料は、各章に明記した範囲で値、構造、用途の基準として参照する。

| 本書の章 | 参考資料 |
| --- | --- |
| 2. トークン体系<br>11. 動き | [Tokens \| Panda CSS - Panda CSS](https://panda-css.com/docs/theming/tokens) |
| 2. トークン体系 | [Theming \| Park UI](https://park-ui.com/docs/theming) |
| 3. 色 | [Theming \| Park UI](https://park-ui.com/docs/theming) |
| 3. 色 | [Scales – Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/scales) |
| 3. 色 | [Composing a color palette – Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) |
| 3. 色 | [Use cases – Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) |
| 3. 色 | [park-ui/packages/preset/src/theme/tokens/colors.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/tokens/colors.ts) |
| 3. 色 | [park-ui/packages/preset/src/index.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/index.ts) |
| 3. 色 | [park-ui/packages/preset/generate-colors.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/generate-colors.ts) |
| 3. 色 | [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) |
| 3. 色 | [Understanding Success Criterion 1.4.3: Contrast (Minimum) \| WAI \| W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) |
| 3. 色 | [Understanding Success Criterion 1.4.11: Non-text Contrast \| WAI \| W3C](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast) |
| 4. レイアウト<br>5. 文字<br>6. 角丸<br>11. 動き | [Theme \| Panda CSS - Panda CSS](https://panda-css.com/docs/customization/theme) |
| 4. レイアウト | [panda/packages/preset-panda/src/aspect-ratios.ts at main · chakra-ui/panda · GitHub](https://github.com/chakra-ui/panda/blob/main/packages/preset-panda/src/aspect-ratios.ts) |
| 5. 文字 | [park-ui/packages/preset/src/theme/text-styles.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/text-styles.ts) |
| 7. 影 | [park-ui/packages/preset/src/theme/tokens/shadows.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/tokens/shadows.ts) |
| 8. 重なり | [park-ui/packages/preset/src/theme/tokens/z-index.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/tokens/z-index.ts) |
| 9. ぼかし | [panda/packages/preset-panda/src/tokens.ts at main · chakra-ui/panda · GitHub](https://github.com/chakra-ui/panda/blob/main/packages/preset-panda/src/tokens.ts) |
| 10. 状態表現 | [park-ui/packages/preset/src/theme/layer-styles.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/layer-styles.ts) |
| 11. 動き | [park-ui/packages/preset/src/theme/tokens/durations.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/tokens/durations.ts) |
| 11. 動き | [park-ui/packages/preset/src/theme/keyframes.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/keyframes.ts) |
| 11. 動き | [park-ui/packages/preset/src/theme/animation-styles.ts at main · chakra-ui/park-ui · GitHub](https://github.com/chakra-ui/park-ui/blob/main/packages/preset/src/theme/animation-styles.ts) |
