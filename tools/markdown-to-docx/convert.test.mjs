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
