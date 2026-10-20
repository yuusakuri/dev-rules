import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const converter = fileURLToPath(new URL('./convert.mjs', import.meta.url));
const markdown = `# 空白の確認

説明。 <!-- 根拠: TEST-01 -->

**強調。** <!-- 一つ目 --> <!-- 二つ目 -->

[リンク](https://example.com) <!-- 根拠 -->

Alpha <!-- 内部のコメント --> Beta.

Alpha **bold** [link](https://example.com) omega.

- 項目。 <!-- 根拠 -->

| 項目 | 説明 |
| --- | --- |
| 値 | セル。 <!-- 根拠 --> |
| 改行 | 前半<br>後半。 <!-- 根拠 --> |

前半。  
後半。 <!-- 根拠 -->

Inline \`code \` <!-- 根拠 -->

\`\`\`text
  code  
\`\`\`
`;

const decodeXml = (text) => text.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[entity]);

for (const style of ['docx', 'google-docs']) {
  test(`${style}: heading levels match Markdown and the chapter TOC`, async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-headings-'));
    try {
      const source = path.join(directory, 'input.md');
      const output = path.join(directory, 'output.docx');
      await fs.writeFile(source, `---
subtitle: 副題
---
# 文書名

## 目次

- [章](#章)

## 章

### 節

#### 小節

##### 項

###### 詳細

# 別の最上位見出し
`);
      execFileSync(process.execPath, [converter, '--input-file', source, '--output-file', output, '--style', style]);
      const archive = await JSZip.loadAsync(await fs.readFile(output));
      const xml = await archive.file('word/document.xml').async('string');
      const paragraphs = [...xml.matchAll(/<w:p(?:\s[^>]*)?>(.*?)<\/w:p>/gs)].map((match) => ({
        text: [...match[1].matchAll(/<w:t(?:\s[^>]*)?>(.*?)<\/w:t>/gs)].map((part) => decodeXml(part[1])).join(''),
        style: match[1].match(/<w:pStyle w:val="([^"]+)"/)?.[1],
      }));
      for (const [text, expected] of [
        ['文書名', 'Title'], ['副題', 'Subtitle'], ['目次', 'TOCHeading'],
        ['章', 'Heading2'], ['節', 'Heading3'], ['小節', 'Heading4'],
        ['項', 'Heading5'], ['詳細', 'Heading6'], ['別の最上位見出し', 'Heading1'],
      ]) {
        assert.ok(paragraphs.some((p) => p.text === text && p.style === expected), `${text}: expected ${expected}`);
      }
      assert.equal(paragraphs.filter((p) => p.style === 'Subtitle').length, 1);
      assert.match(xml, /TOC[^<]*\\o &quot;2-2&quot;/);
      assert.ok(paragraphs.some((p) => p.text.startsWith('章') && p.style === 'TOC2'));
      const styles = await archive.file('word/styles.xml').async('string');
      assert.match(styles, /w:styleId="Heading6"[^]*?<w:rFonts[^>]*w:eastAsia="Yu Gothic"/);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test(`${style}: comment separators do not become trailing spaces`, async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-whitespace-'));
    try {
      const source = path.join(directory, 'input.md');
      const output = path.join(directory, 'output.docx');
      await fs.writeFile(source, markdown);
      execFileSync(process.execPath, [converter, '--input-file', source, '--output-file', output, '--style', style]);
      const archive = await JSZip.loadAsync(await fs.readFile(output));
      const xml = await archive.file('word/document.xml').async('string');
      const paragraphs = [...xml.matchAll(/<w:p(?:\s[^>]*)?>(.*?)<\/w:p>/gs)].map((match) => ({
        text: [...match[1].matchAll(/<w:t(?:\s[^>]*)?>(.*?)<\/w:t>/gs)].map((part) => decodeXml(part[1])).join(''),
        breaks: [...match[1].matchAll(/<w:br\b/g)].length,
      }));
      for (const expected of ['説明。', '強調。', 'リンク', '項目。', 'セル。', '前半後半。']) {
        assert.ok(paragraphs.some(({ text }) => text === expected), `Missing exact paragraph: ${JSON.stringify(expected)}`);
      }
      assert.ok(paragraphs.some(({ text }) => text === 'Alpha  Beta.'));
      assert.ok(paragraphs.some(({ text }) => text === 'Alpha bold link omega.'));
      assert.ok(paragraphs.some(({ text, breaks }) => text === '前半後半。' && breaks === 1));
      assert.ok(paragraphs.some(({ text, breaks }) => text === '前半。後半。' && breaks === 1));
      assert.ok(paragraphs.some(({ text }) => text === 'Inline code '));
      assert.ok(paragraphs.some(({ text }) => text === '  code  '));
      assert.ok(!xml.includes('TEST-01'));
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
}

function bodyBlocks(xml) {
  const body = xml.match(/<w:body>([^]*?)<\/w:body>/)[1];
  const blocks = [];
  let depth = 0;
  let start = 0;
  let tag;
  for (const match of body.matchAll(/<(\/?)([\w:]+)\b[^>]*>/g)) {
    if (match[1]) {
      depth -= 1;
      if (!depth) blocks.push({ tag, xml: body.slice(start, match.index + match[0].length) });
    } else if (!match[0].endsWith('/>')) {
      if (!depth) { start = match.index; tag = match[2]; }
      depth += 1;
    } else if (!depth) {
      blocks.push({ tag: match[2], xml: match[0] });
    }
  }
  return blocks;
}

const textOf = (xml) => [...xml.matchAll(/<w:t(?:\s[^>]*)?>(.*?)<\/w:t>/gs)].map((part) => decodeXml(part[1])).join('');

for (const style of ['docx', 'google-docs']) {
  test(`${style}: invisible metadata does not add paragraphs or break anchor references`, async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-metadata-'));
    try {
      const source = path.join(directory, 'input.md');
      const output = path.join(directory, 'output.docx');
      await fs.writeFile(source, `# 文書名

[本文](#section-alias)と[表1](#table-1)を参照する。

<a id="section-alias"></a> <!-- 根拠: TEST-01 -->
<a id='another-alias'></a> <!-- 根拠: TEST-02 -->

<!-- コメントだけの行 -->

## 説明

前段。

<a id="table-1"></a>表1−項目 <!-- 根拠: TEST-03 -->

| 項目 | 値 |
| --- | --- |
| 空欄 | |

<a id="after-table"></a> <!-- 根拠: TEST-04 -->

後段。

> <a id="quote-alias"></a> <!-- 根拠: TEST-05 -->
>
> 引用文。

- <!-- リスト内のコメント -->

  項目。

[別名](#another-alias)と[引用](#quote-alias)を参照する。

![画像](image.svg)

| 終端 | 値 |
| --- | --- |
| 最後 | 本文 |
`);
      await fs.writeFile(path.join(directory, 'image.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="#000"/></svg>');
      execFileSync(process.execPath, [converter, '--input-file', source, '--output-file', output, '--style', style]);
      const archive = await JSZip.loadAsync(await fs.readFile(output));
      const xml = await archive.file('word/document.xml').async('string');
      const blocks = bodyBlocks(xml);
      const paragraphs = blocks.filter((block) => block.tag === 'w:p');
      assert.ok(paragraphs.every((block) => textOf(block.xml).trim() || /<w:drawing\b/.test(block.xml)), 'Metadata or table spacing must not introduce empty body paragraphs');
      assert.deepEqual(blocks.map((block) => block.tag), ['w:p', 'w:p', 'w:p', 'w:p', 'w:p', 'w:tbl', 'w:p', 'w:p', 'w:p', 'w:p', 'w:p', 'w:tbl', 'w:sectPr']);
      const following = blocks[blocks.findIndex((block) => block.tag === 'w:tbl') + 1];
      assert.equal(textOf(following.xml), '後段。');
      assert.match(following.xml, /<w:spacing[^>]*w:before="120"/);
      assert.ok(paragraphs.some((block) => textOf(block.xml) === '項目。' && /<w:numPr>/.test(block.xml)), 'A hidden list paragraph must not consume the bullet');
      for (const cell of xml.matchAll(/<w:tc>([^]*?)<\/w:tc>/g)) assert.match(cell[1], /<w:p[ >\/]/, 'Empty cells still need a Word paragraph');
      assert.equal((xml.match(/<w:drawing\b/g) ?? []).length, 1);
      assert.doesNotMatch(xml, /TEST-0|section-alias|bookmarkStart|w:anchor=/);
      await fs.writeFile(source, '# 文書名\n\n[不明](#does-not-exist)\n');
      assert.throws(() => execFileSync(process.execPath, [converter, '--input-file', source, '--output-file', output, '--style', style], { stdio: 'pipe' }), /Unresolved internal links/);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  test(`${style}: distinct adjacent tables retain only their required separator`, async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-tables-'));
    try {
      const source = path.join(directory, 'input.md');
      const output = path.join(directory, 'output.docx');
      await fs.writeFile(source, '# 文書名\n\n| 一つ目 |\n| --- |\n| 値 |\n\n<!-- 表の間のコメント -->\n\n| 二つ目 |\n| --- |\n| 値 |\n');
      execFileSync(process.execPath, [converter, '--input-file', source, '--output-file', output, '--style', style]);
      const archive = await JSZip.loadAsync(await fs.readFile(output));
      const blocks = bodyBlocks(await archive.file('word/document.xml').async('string'));
      assert.deepEqual(blocks.map((block) => block.tag), ['w:p', 'w:tbl', 'w:p', 'w:tbl', 'w:sectPr']);
      assert.equal(textOf(blocks[2].xml), '');
      assert.match(blocks[2].xml, /<w:spacing[^>]*w:line="20"[^>]*w:lineRule="exact"/);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
}
