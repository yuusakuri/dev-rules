import fs from 'node:fs/promises';
import path from 'node:path';

import { marked } from 'marked';
import {
  BorderStyle, Document, ExternalHyperlink, HeadingLevel, ImageRun,
  Packer, Paragraph, Table, TableCell, TableLayoutType, TableOfContents, TableRow, TextRun, WidthType,
} from 'docx';
import sharp from 'sharp';

const [sourceArg, outputArg, ...options] = process.argv.slice(2);
if (!sourceArg || !outputArg || options.length > 2 || (options.length && (options[0] !== '--target' || !['docx', 'google-docs'].includes(options[1])))) {
  throw new Error('Usage: node convert.mjs INPUT.md OUTPUT.docx [--target docx|google-docs]');
}
const sourcePath = path.resolve(sourceArg);
const outputPath = path.resolve(outputArg);
if (path.extname(sourcePath).toLowerCase() !== '.md' || path.extname(outputPath).toLowerCase() !== '.docx' || sourcePath === outputPath) {
  throw new Error('Input must be .md and output must be a distinct .docx file');
}
const target = options[1] ?? 'docx';
const profiles = {
  docx: {
    normalFont: 'Aptos', headingFont: 'Aptos Display', codeFont: 'Consolas',
    normalSize: 24, titleSize: 56, subtitleSize: 28,
    heading1Size: 32, heading2Size: 28, heading3Size: 24,
  },
  'google-docs': {
    normalFont: 'Arial', headingFont: 'Arial', codeFont: 'Roboto Mono',
    normalSize: 22, titleSize: 52, subtitleSize: 30,
    heading1Size: 40, heading2Size: 32, heading3Size: 28,
  },
};
const {
  normalFont, headingFont, codeFont, normalSize, titleSize, subtitleSize,
  heading1Size, heading2Size, heading3Size,
} = profiles[target];
const textColor = '202124';
const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

const cleanText = (text) => String(text ?? '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
const slug = (value) => cleanText(value).toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');

const source = await fs.readFile(sourcePath, 'utf8');
const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
const subtitle = frontMatter?.[1].match(/^subtitle:\s*(.+)$/m)?.[1]?.trim();
const markdown = source.slice(frontMatter?.[0].length ?? 0).replace(/<!--[^]*?-->/g, '').replace(/<a\s+id="[^"]+"\s*><\/a>/g, '');
const tokens = marked.lexer(markdown, { gfm: true });
const anchors = new Set();
function addAnchor(key) {
  anchors.add(key);
}
for (const token of tokens) if (token.type === 'heading') addAnchor(slug(token.text));
for (const line of source.split(/\r?\n/)) {
  const match = /^<a id="([^"]+)"><\/a>([図表]\d+)[−-]/.exec(line);
  if (match) {
    addAnchor(match[1]);
  }
}
const missingAnchors = [...markdown.matchAll(/\]\(#([^)]+)\)/g)]
  .map((match) => match[1]).filter((key) => !anchors.has(key));
if (missingAnchors.length) throw new Error(`Unresolved internal links: ${[...new Set(missingAnchors)].join(', ')}`);

function inlineRuns(tokens, style = {}) {
  const runs = [];
  for (const token of tokens ?? []) {
    if (token.type === 'html') {
      if (/^<br/i.test(token.raw ?? '')) runs.push(new TextRun({ break: 1 }));
      continue;
    }
    if (token.type === 'link') {
      const text = cleanText(token.text);
      if (/^https?:\/\//.test(token.href ?? '')) {
        runs.push(new ExternalHyperlink({ link: token.href, children: [new TextRun({ text, style: 'Hyperlink', ...style })] }));
      } else if (token.href?.startsWith('#')) {
        runs.push(new TextRun({ text, ...style }));
      } else runs.push(new TextRun({ text, ...style }));
      continue;
    }
    if (token.type === 'image') continue;
    if (token.type === 'strong' || token.type === 'em' || token.type === 'del') {
      runs.push(...inlineRuns(token.tokens, { ...style, bold: style.bold || token.type === 'strong', italics: style.italics || token.type === 'em', strike: style.strike || token.type === 'del' }));
      continue;
    }
    if (token.type === 'codespan') {
      runs.push(new TextRun({ text: token.text, font: codeFont, size: 22, ...style }));
      continue;
    }
    if (token.type === 'br') { runs.push(new TextRun({ break: 1 })); continue; }
    if (token.tokens) runs.push(...inlineRuns(token.tokens, style));
    else if (token.text) runs.push(new TextRun({ text: cleanText(token.text), ...style }));
  }
  return runs.length ? runs : [new TextRun('')];
}

function paragraph(token, options = {}) {
  const tokens = token.tokens ?? marked.Lexer.lexInline(token.text ?? token.raw ?? '');
  return new Paragraph({
    children: inlineRuns(tokens, options.runStyle ?? {}),
    spacing: { after: options.after ?? 120, line: 285 },
    ...options.paragraph,
  });
}

async function imageParagraph(token) {
  const match = /^!\[[^\]]*\]\(([^)]+)\)/.exec(token.raw ?? '');
  const img = token.tokens?.find((t) => t.type === 'image');
  const rel = img?.href ?? match?.[1];
  if (!rel) return null;
  if (token.tokens?.some((part) => part.type !== 'image' && cleanText(part.text).trim())) {
    throw new Error('Images must be on their own Markdown paragraph');
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(rel)) throw new Error(`Image must be a local file: ${rel}`);
  const imagePath = path.resolve(path.dirname(sourcePath), rel);
  const data = await sharp(imagePath).png().toBuffer();
  const meta = await sharp(data).metadata();
  const scale = Math.min(1, 590 / meta.width, 650 / meta.height);
  const width = Math.round(meta.width * scale);
  const height = Math.round(meta.height * scale);
  return new Paragraph({ children: [new ImageRun({ data, type: 'png', transformation: { width, height }, altText: { title: img?.text ?? '', description: img?.text ?? '', name: path.basename(rel) } })], spacing: { before: 100, after: 100 }, keepNext: true });
}

function makeTable(token) {
  const allRows = [token.header, ...token.rows];
  const colCount = token.header.length;
  const rows = allRows.map((cells, rowIndex) => new TableRow({
    tableHeader: rowIndex === 0,
    cantSplit: true,
    children: cells.map((cell) => new TableCell({
      children: [paragraph(cell, { after: 0, runStyle: { bold: rowIndex === 0 }, paragraph: { spacing: { before: 50, after: 50, line: 250 } } })],
      shading: rowIndex === 0 ? { fill: 'E8EEF5' } : undefined,
      margins: { top: 70, bottom: 70, left: 75, right: 75 },
    })),
  }));
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: Array(colCount).fill(Math.floor(9800 / colCount)),
    layout: TableLayoutType.AUTOFIT,
    borders,
  });
}

const children = [];
let tocListPending = false;
for (const [index, token] of tokens.entries()) {
  if (token.type === 'space' || token.type === 'hr' || token.type === 'html') continue;
  if (token.type === 'heading') {
    tocListPending = token.text === '目次';
    const heading = tocListPending ? 'TOCHeading' : token.depth === 1 ? 'Title' : HeadingLevel['HEADING_' + Math.min(6, token.depth - 1)];
    children.push(paragraph(token, { after: token.depth === 1 ? 230 : 150, paragraph: { style: heading, keepNext: true } }));
    if (token.depth === 1 && subtitle) children.push(new Paragraph({ text: subtitle, style: 'Subtitle' }));
  } else if (token.type === 'paragraph') {
    const img = await imageParagraph(token);
    const next = tokens.slice(index + 1).find((candidate) => !['space', 'html'].includes(candidate.type));
    const followedByImage = next?.type === 'paragraph' && /^!\[/.test(next.raw?.trim() ?? '');
    children.push(img ?? paragraph(token, { paragraph: { keepNext: followedByImage, keepLines: followedByImage } }));
  } else if (token.type === 'table') {
    children.push(makeTable(token));
    children.push(new Paragraph({ spacing: { after: 75 } }));
  } else if (token.type === 'list') {
    if (tocListPending) {
      children.push(new TableOfContents('目次', {
        hyperlink: true,
        headingStyleRange: '1-1',
        cachedEntries: token.items.map((item) => ({ title: cleanText(marked.parseInline(item.text)), level: 1 })),
      }));
      tocListPending = false;
      continue;
    }
    for (const [index, item] of token.items.entries()) {
      const textToken = { text: item.text, tokens: marked.Lexer.lexInline(item.text) };
      children.push(paragraph(textToken, { after: 60, paragraph: token.ordered ? { numbering: { reference: 'ordered', level: 0 } } : { bullet: { level: 0 } } }));
    }
  } else if (token.type === 'code') {
    for (const line of token.text.split('\n')) children.push(new Paragraph({ children: [new TextRun({ text: line || ' ', font: codeFont, size: 18 })], spacing: { after: 0, line: 220 }, shading: { fill: 'F4F4F4' } }));
    children.push(new Paragraph({ spacing: { after: 80 } }));
  } else if (token.type === 'blockquote') {
    for (const line of token.text.split('\n')) children.push(new Paragraph({ children: [new TextRun(cleanText(line))], indent: { left: 400 }, spacing: { after: 80 } }));
  }
}

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: normalFont, size: normalSize, color: textColor }, paragraph: { spacing: { after: 120 } } },
      title: { run: { font: headingFont, size: titleSize, bold: true, color: textColor }, paragraph: { spacing: { after: 240 } } },
      heading1: { run: { font: headingFont, size: heading1Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading2: { run: { font: headingFont, size: heading2Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading3: { run: { font: headingFont, size: heading3Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
    },
    paragraphStyles: [
      { id: 'Subtitle', name: 'Subtitle', basedOn: 'Normal', next: 'Normal', run: { font: headingFont, size: subtitleSize, color: textColor }, paragraph: { spacing: { after: 180 } } },
      { id: 'TOCHeading', name: 'TOC Heading', basedOn: 'Normal', next: 'Normal', run: { font: headingFont, size: heading1Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
    ],
  },
  numbering: { config: [{ reference: 'ordered', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left' }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, right: 850, bottom: 850, left: 850 } } }, children }],
});
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, await Packer.toBuffer(doc));
console.log(JSON.stringify({ sourcePath, outputPath, target, blocks: tokens.length, tables: tokens.filter((t) => t.type === 'table').length, images: tokens.filter((t) => t.type === 'paragraph' && t.tokens?.some((x) => x.type === 'image')).length }));
