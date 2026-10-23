import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { decode } from 'html-entities';
import { marked } from 'marked';
import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, HeadingLevel, ImageRun,
  Packer, Paragraph, Table, TableCell, TableLayoutType, TableOfContents, TableRow, TextRun, WidthType,
} from 'docx';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';

const args = process.argv.slice(2);
const usage = 'Usage: node convert.mjs --input-file INPUT.md --output-file OUTPUT.docx [--style docx|google-docs]';
const validOptions = new Set(['--input-file', '--output-file', '--style']);
if (args.length % 2 !== 0) throw new Error(usage);
const options = new Map();
for (let index = 0; index < args.length; index += 2) {
  const option = args[index];
  const value = args[index + 1];
  if (!validOptions.has(option) || options.has(option) || !value || value.startsWith('--')) throw new Error(usage);
  options.set(option, value);
}
const sourceArg = options.get('--input-file');
const outputArg = options.get('--output-file');
const style = options.get('--style') ?? 'docx';
if (!sourceArg || !outputArg || !['docx', 'google-docs'].includes(style)) throw new Error(usage);
const sourcePath = path.resolve(sourceArg);
const outputPath = path.resolve(outputArg);
if (path.extname(sourcePath).toLowerCase() !== '.md' || path.extname(outputPath).toLowerCase() !== '.docx' || sourcePath === outputPath) {
  throw new Error('Input must be .md and output must be a distinct .docx file');
}
const sourceStat = await fs.stat(sourcePath);
const outputStat = await fs.stat(outputPath).catch((error) => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
if (outputStat && sourceStat.dev === outputStat.dev && sourceStat.ino === outputStat.ino) {
  throw new Error('Output file must not refer to the Markdown source');
}
const profiles = {
  docx: {
    normalFont: 'Aptos', headingFont: 'Aptos Display', codeFont: 'Consolas',
    normalSize: 24, titleSize: 56, subtitleSize: 28,
    heading1Size: 32, heading2Size: 28, heading3Size: 24, heading4Size: 24, heading5Size: 22, heading6Size: 22,
  },
  'google-docs': {
    normalFont: 'Arial', headingFont: 'Arial', codeFont: 'Roboto Mono',
    normalSize: 22, titleSize: 52, subtitleSize: 30,
    heading1Size: 40, heading2Size: 32, heading3Size: 28, heading4Size: 24, heading5Size: 22, heading6Size: 22,
  },
};
const {
  normalFont, headingFont, codeFont, normalSize, titleSize, subtitleSize,
  heading1Size, heading2Size, heading3Size, heading4Size, heading5Size, heading6Size,
} = profiles[style];
const fontFor = (name) => ({ ascii: name, hAnsi: name, eastAsia: 'Yu Gothic' });
const textColor = '202124';
const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

const decodeText = (text) => decode(String(text ?? '')).replace(/\u00a0/g, ' ');
const cleanText = (text) => decodeText(String(text ?? '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, ''));
// Inline HTML is already a separate token, so `<...>` left in text tokens is literal text.
const plainText = (tokens) => (tokens ?? []).map((token) => {
  if (token.type === 'html') return '';
  return token.tokens ? plainText(token.tokens) : decodeText(token.text);
}).join('');
const slug = (tokens) => plainText(tokens).toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');
const decodeHref = (href) => {
  try {
    return decodeURIComponent(href);
  } catch {
    return href;
  }
};

const source = await fs.readFile(sourcePath, 'utf8');
const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
const subtitle = frontMatter ? parseYaml(frontMatter[1])?.subtitle : undefined;
if (subtitle !== undefined && typeof subtitle !== 'string') throw new Error('Front matter subtitle must be a string');
const markdown = source.slice(frontMatter?.[0].length ?? 0);
const tokens = marked.lexer(markdown, { gfm: true });
const anchors = new Set();
function addAnchor(key) {
  anchors.add(key);
}
// Repeated headings get -1, -2, ... suffixes, as on GitHub.
const slugOccurrences = new Map();
for (const token of tokens) {
  if (token.type !== 'heading') continue;
  const base = slug(token.tokens);
  let key = base;
  while (slugOccurrences.has(key)) {
    slugOccurrences.set(base, slugOccurrences.get(base) + 1);
    key = `${base}-${slugOccurrences.get(base)}`;
  }
  slugOccurrences.set(key, 0);
  addAnchor(key);
}
const internalLinks = [];
function collectInternalLinks(value) {
  if (Array.isArray(value)) {
    for (const entry of value) collectInternalLinks(entry);
  } else if (value && typeof value === 'object') {
    if (value.type === 'html') {
      const html = value.raw.replace(/<!--[\s\S]*?-->/g, '');
      for (const match of html.matchAll(/<a\b[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/gi)) addAnchor(match[1]);
    }
    if (value.type === 'link' && value.href?.startsWith('#')) internalLinks.push(decodeHref(value.href.slice(1)));
    collectInternalLinks(value.tokens);
    collectInternalLinks(value.items);
    collectInternalLinks(value.header);
    collectInternalLinks(value.rows);
  }
}
collectInternalLinks(tokens);
const missingAnchors = internalLinks.filter((key) => !anchors.has(key));
if (missingAnchors.length) throw new Error(`Unresolved internal links: ${[...new Set(missingAnchors)].join(', ')}`);

function inlineRuns(tokens, style = {}) {
  const runs = [];
  for (const token of tokens ?? []) {
    if (token.type === 'html') {
      if (/^<br/i.test(token.raw ?? '')) runs.push(new TextRun({ break: 1 }));
      continue;
    }
    if (token.type === 'link') {
      if (token.href?.startsWith('#')) {
        runs.push(...inlineRuns(token.tokens, style));
      } else {
        const resolved = /^[a-z][a-z0-9+.-]*:/i.test(token.href) ? token.href : new URL(token.href, pathToFileURL(sourcePath)).href;
        runs.push(new ExternalHyperlink({ link: resolved, children: inlineRuns(token.tokens, { font: fontFor(normalFont), ...style, style: 'Hyperlink' }) }));
      }
      continue;
    }
    if (token.type === 'image') continue;
    if (token.type === 'strong' || token.type === 'em' || token.type === 'del') {
      runs.push(...inlineRuns(token.tokens, { ...style, bold: style.bold || token.type === 'strong', italics: style.italics || token.type === 'em', strike: style.strike || token.type === 'del' }));
      continue;
    }
    if (token.type === 'codespan') {
      runs.push(new TextRun({ ...style, text: token.text, font: fontFor(codeFont), size: 22 }));
      continue;
    }
    if (token.type === 'br') { runs.push(new TextRun({ break: 1 })); continue; }
    if (token.tokens) runs.push(...inlineRuns(token.tokens, style));
    else if (token.text) runs.push(new TextRun({ text: decodeText(token.text), ...style }));
  }
  return runs.length ? runs : [new TextRun('')];
}

function hasVisibleInlineContent(tokens) {
  return (tokens ?? []).some((token) => {
    if (token.type === 'br' || token.type === 'image') return true;
    if (token.type === 'html') return /^<br\b/i.test(token.raw ?? '');
    if (token.type === 'codespan') return Boolean(token.text.length);
    if (token.tokens) return hasVisibleInlineContent(token.tokens);
    return Boolean(decodeText(token.text).trim());
  });
}

function paragraph(token, options = {}) {
  const tokens = (token.tokens ?? marked.Lexer.lexInline(token.text ?? token.raw ?? ''))
    .filter((part) => part.type !== 'html' || /^<br/i.test(part.raw ?? ''));
  while (tokens.at(-1)?.type === 'text') {
    const last = tokens.pop();
    const text = last.text.replace(/[ \t]+$/, '');
    if (text) {
      tokens.push({ ...last, text });
      break;
    }
  }
  if (!options.allowEmpty && !hasVisibleInlineContent(tokens)) return null;
  return new Paragraph({
    children: inlineRuns(tokens, options.runStyle ?? {}),
    spacing: { before: options.before, after: options.after ?? 120, line: 285 },
    ...options.paragraph,
  });
}

async function imageParagraph(token) {
  const images = token.tokens?.filter((part) => part.type === 'image') ?? [];
  if (!images.length) return null;
  if (token.tokens?.some((part) => part.type !== 'image' && cleanText(part.text).trim())) {
    throw new Error('Images must be on their own Markdown paragraph');
  }
  const imageRuns = [];
  for (const [index, img] of images.entries()) {
    const rel = img.href;
    if (/^[a-z][a-z0-9+.-]*:/i.test(rel)) throw new Error(`Image must be a local file: ${rel}`);
    const imagePath = path.resolve(path.dirname(sourcePath), decodeHref(rel));
    const sourceData = await fs.readFile(imagePath);
    const sourceMeta = await sharp(sourceData).metadata();
    let imageOptions;
    let meta;
    if (sourceMeta.format === 'svg') {
      const longestSide = Math.max(sourceMeta.width, sourceMeta.height);
      const rasterScale = Math.max(1, 3840 / longestSide);
      // librsvg scales absolute units such as pt by the density twice, so the
      // size grows with the square of the density. Measure how the size responds
      // before choosing the density, or the render exceeds the pixel limit.
      const probe = await sharp(sourceData, { density: 144 }).metadata();
      const exponent = Math.log2(probe.width / sourceMeta.width) || 1;
      const density = Math.min(100000, Math.ceil(72 * rasterScale ** (1 / exponent)));
      const fallback = await sharp(sourceData, { density })
        .resize({ width: Math.round(sourceMeta.width * rasterScale), height: Math.round(sourceMeta.height * rasterScale) })
        .png().toBuffer();
      imageOptions = { data: sourceData, type: 'svg', fallback: { data: fallback, type: 'png' } };
      meta = sourceMeta;
    } else {
      const data = await sharp(sourceData).autoOrient().png().toBuffer();
      imageOptions = { data, type: 'png' };
      meta = await sharp(data).metadata();
    }
    const scale = Math.min(1, 590 / meta.width, 650 / meta.height);
    if (index) imageRuns.push(new TextRun({ break: 1 }));
    imageRuns.push(new ImageRun({ ...imageOptions, transformation: { width: Math.round(meta.width * scale), height: Math.round(meta.height * scale) }, altText: { title: img.text ?? '', description: img.text ?? '', name: path.basename(rel) } }));
  }
  return new Paragraph({ children: imageRuns, spacing: { before: 100, after: 100 }, keepNext: true });
}

function makeTable(token) {
  const allRows = [token.header, ...token.rows];
  const colCount = token.header.length;
  const rows = allRows.map((cells, rowIndex) => new TableRow({
    tableHeader: rowIndex === 0,
    cantSplit: true,
    children: cells.map((cell, columnIndex) => new TableCell({
      children: [paragraph(cell, { allowEmpty: true, after: 0, runStyle: { bold: rowIndex === 0 }, paragraph: { alignment: token.align?.[columnIndex] ? AlignmentType[token.align[columnIndex].toUpperCase()] : undefined, spacing: { before: 50, after: 50, line: 250 } } })],
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
const numberingConfigs = [];
function appendParagraph(token, options = {}) {
  let before;
  if (children.at(-1) instanceof Table) {
    before = /^(Heading|TOCHeading)/.test(options.paragraph?.style ?? '') ? 220 : 120;
  }
  const output = paragraph(token, { ...options, before });
  if (!output) return false;
  children.push(output);
  return true;
}

function renderCode(token, indent) {
  const lines = token.text.split('\n');
  for (const [lineIndex, line] of lines.entries()) children.push(new Paragraph({
    children: [new TextRun({ text: line || ' ', font: fontFor(codeFont), size: 18 })],
    spacing: { before: children.at(-1) instanceof Table ? 120 : undefined, after: lineIndex === lines.length - 1 ? 80 : 0, line: 220 },
    indent: indent ? { left: indent } : undefined,
    shading: { fill: 'F4F4F4' },
  }));
}

// Blocks without visible content; anything else nested must be rendered or rejected, never dropped.
const invisibleNestedBlocks = new Set(['space', 'html', 'hr', 'def', 'checkbox']);
function rejectNestedBlock(part, container) {
  if (!invisibleNestedBlocks.has(part.type)) throw new Error(`Unsupported Markdown ${part.type} inside a ${container}`);
}

function renderList(token, depth = 0) {
  const reference = token.ordered ? `ordered-${numberingConfigs.length + 1}` : null;
  if (reference) numberingConfigs.push({ reference, levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left', start: Number(token.start) || 1 }] });
  for (const item of token.items) {
    let firstParagraph = true;
    for (const part of item.tokens ?? []) {
      if (part.type === 'list') {
        renderList(part, depth + 1);
      } else if (part.type === 'text' || part.type === 'paragraph') {
        const listStyle = firstParagraph
          ? reference ? { numbering: { reference, level: 0 }, indent: depth ? { left: 400 * depth } : undefined } : { bullet: { level: depth } }
          : { indent: { left: 400 * (depth + 1) } };
        if (appendParagraph(part, { after: 60, paragraph: listStyle })) firstParagraph = false;
      } else if (part.type === 'code') {
        renderCode(part, 400 * (depth + 1));
      } else {
        rejectNestedBlock(part, 'list');
      }
    }
  }
}

function renderBlockquote(token, depth = 1) {
  for (const part of token.tokens ?? marked.lexer(token.text ?? '')) {
    if (part.type === 'paragraph' || part.type === 'text') appendParagraph(part, { after: 80, paragraph: { indent: { left: 400 * depth } } });
    else if (part.type === 'list') renderList(part, depth);
    else if (part.type === 'code') renderCode(part, 400 * depth);
    else if (part.type === 'blockquote') renderBlockquote(part, depth + 1);
    else rejectNestedBlock(part, 'blockquote');
  }
}
let tocListPending = false;
const titleToken = tokens.find((token) => token.type === 'heading' && token.depth === 1);
for (const [index, token] of tokens.entries()) {
  if (token.type === 'space' || token.type === 'hr' || token.type === 'html') continue;
  if (token.type === 'heading') {
    tocListPending = token.text === '目次';
    const heading = tocListPending ? 'TOCHeading' : token === titleToken ? 'Title' : HeadingLevel['HEADING_' + token.depth];
    appendParagraph(token, { after: token === titleToken ? 230 : 150, paragraph: { style: heading, keepNext: true } });
    if (token === titleToken && subtitle) children.push(new Paragraph({ text: subtitle, style: 'Subtitle' }));
  } else if (token.type === 'paragraph') {
    const img = await imageParagraph(token);
    const next = tokens.slice(index + 1).find((candidate) => !['space', 'html'].includes(candidate.type)
      && (candidate.type !== 'paragraph' || hasVisibleInlineContent(candidate.tokens)));
    const followedByImage = next?.type === 'paragraph' && /^!\[/.test(next.raw?.trim() ?? '');
    const tableCaption = next?.type === 'table' && /^表\d+[−-]/.test(cleanText(token.text).trim());
    if (img) children.push(img);
    else appendParagraph(token, { paragraph: { keepNext: followedByImage || tableCaption, keepLines: followedByImage || tableCaption } });
  } else if (token.type === 'table') {
    // Word may merge adjacent tables unless a paragraph separates them.
    if (children.at(-1) instanceof Table) children.push(new Paragraph({
      spacing: { before: 0, after: 0, line: 20, lineRule: 'exact' },
      run: { size: 2 },
      keepNext: true,
    }));
    children.push(makeTable(token));
  } else if (token.type === 'list') {
    if (tocListPending) {
      children.push(new TableOfContents('目次', {
        hyperlink: true,
        headingStyleRange: '2-2',
        cachedEntries: token.items.map((item) => ({ title: cleanText(marked.parseInline(item.text)), level: 2 })),
      }));
      tocListPending = false;
      continue;
    }
    renderList(token);
  } else if (token.type === 'code') {
    renderCode(token);
  } else if (token.type === 'blockquote') {
    renderBlockquote(token);
  }
}

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: fontFor(normalFont), size: normalSize, color: textColor }, paragraph: { spacing: { after: 120 } } },
      title: { run: { font: fontFor(headingFont), size: titleSize, bold: true, color: textColor }, paragraph: { spacing: { after: 240 } } },
      heading1: { run: { font: fontFor(headingFont), size: heading1Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading2: { run: { font: fontFor(headingFont), size: heading2Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading3: { run: { font: fontFor(headingFont), size: heading3Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading4: { run: { font: fontFor(headingFont), size: heading4Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading5: { run: { font: fontFor(headingFont), size: heading5Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
      heading6: { run: { font: fontFor(headingFont), size: heading6Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
    },
    paragraphStyles: [
      { id: 'Subtitle', name: 'Subtitle', basedOn: 'Normal', next: 'Normal', run: { font: fontFor(headingFont), size: subtitleSize, color: textColor }, paragraph: { spacing: { after: 180 } } },
      { id: 'TOCHeading', name: 'TOC Heading', basedOn: 'Normal', next: 'Normal', run: { font: fontFor(headingFont), size: heading2Size, bold: true, color: textColor }, paragraph: { spacing: { before: 220, after: 120 }, keepNext: true } },
    ],
  },
  numbering: { config: numberingConfigs },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, right: 850, bottom: 850, left: 850 } } }, children }],
});
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, await Packer.toBuffer(doc));
console.log(JSON.stringify({ sourcePath, outputPath, style, blocks: tokens.length, tables: tokens.filter((t) => t.type === 'table').length, images: tokens.reduce((count, token) => count + (token.type === 'paragraph' ? token.tokens?.filter((part) => part.type === 'image').length ?? 0 : 0), 0) }));
