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
