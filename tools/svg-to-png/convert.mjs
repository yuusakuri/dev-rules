import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import puppeteer from 'puppeteer';

const args = process.argv.slice(2);
const usage = 'Usage: node convert.mjs --input-file INPUT.svg --output-file OUTPUT.png [--long-side PIXELS]';
const validOptions = new Set(['--input-file', '--output-file', '--long-side']);
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
const longSide = Number(options.get('--long-side') ?? 3840);
if (!sourceArg || !outputArg || !Number.isInteger(longSide) || longSide < 1) throw new Error(usage);
const sourcePath = path.resolve(sourceArg);
const outputPath = path.resolve(outputArg);
if (path.extname(sourcePath).toLowerCase() !== '.svg' || path.extname(outputPath).toLowerCase() !== '.png') {
  throw new Error('Input must be .svg and output must be .png');
}
await fs.access(sourcePath);

const browser = await puppeteer.launch({ headless: 'shell' });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(sourcePath).href, { waitUntil: 'load' });
  // Fix the root element to its intrinsic size so percentage widths do not follow the viewport.
  const size = await page.evaluate(async () => {
    await document.fonts.ready;
    const svg = document.documentElement;
    if (!(svg instanceof SVGSVGElement)) return null;
    const length = (name) => (svg.hasAttribute(name) && svg[name].baseVal.unitType !== SVGLength.SVG_LENGTHTYPE_PERCENTAGE
      ? svg[name].baseVal.value : null);
    let width = length('width');
    let height = length('height');
    const box = svg.hasAttribute('viewBox') ? svg.viewBox.baseVal : null;
    if (box && box.width > 0 && box.height > 0) {
      if (width === null && height === null) ({ width, height } = box);
      else if (width === null) width = height * box.width / box.height;
      else if (height === null) height = width * box.height / box.width;
    }
    if (!(width > 0 && height > 0)) return null;
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.style.maxWidth = 'none';
    return { width, height };
  });
  if (!size) throw new Error('SVG must have an absolute width and height or a viewBox');
  // Render the vector at the final pixel count so anti-aliasing works on output pixels.
  const scale = longSide / Math.max(size.width, size.height);
  await page.setViewport({ width: Math.ceil(size.width), height: Math.ceil(size.height), deviceScaleFactor: scale });
  const png = Buffer.from(await page.screenshot({ clip: { x: 0, y: 0, width: size.width, height: size.height } }));
  await fs.writeFile(outputPath, png);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (Math.max(width, height) < longSide) throw new Error(`Rendered PNG is smaller than ${longSide} pixels: ${width}x${height}`);
  console.log(JSON.stringify({ sourcePath, outputPath, width, height }));
} finally {
  await browser.close();
}
