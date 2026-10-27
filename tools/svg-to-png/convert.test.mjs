import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const converter = fileURLToPath(new URL('./convert.mjs', import.meta.url));
let browser;
before(async () => { browser = await puppeteer.launch({ headless: 'shell' }); });
after(async () => { await browser?.close(); });

async function convert(svg, extraArgs = []) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'svg-to-png-'));
  const source = path.join(directory, 'input.svg');
  const output = path.join(directory, 'output.png');
  await fs.writeFile(source, svg);
  try {
    execFileSync(process.execPath, [converter, '--input-file', source, '--output-file', output, ...extraArgs], { stdio: 'pipe' });
  } catch (error) {
    await fs.rm(directory, { recursive: true, force: true });
    throw error;
  }
  return { directory, png: await fs.readFile(output) };
}

// Decode the PNG in the browser and return RGBA pixels.
async function pixels(png) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(async (dataUrl) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return { width: image.width, height: image.height, data: Array.from(context.getImageData(0, 0, image.width, image.height).data) };
    }, `data:image/png;base64,${png.toString('base64')}`);
  } finally {
    await page.close();
  }
}

const size = (png) => [png.readUInt32BE(16), png.readUInt32BE(20)];

test('scales the longer side of a landscape SVG to 3840 pixels', async () => {
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="#ccc"/></svg>');
  try {
    assert.deepEqual(size(png), [3840, 1920]);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('uses the viewBox when the width is a percentage', async () => {
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="4 -50 100 200" style="max-width: 100px;"><rect x="4" y="-50" width="100" height="200" fill="#ccc"/></svg>');
  try {
    assert.deepEqual(size(png), [1920, 3840]);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('reaches the long side for an SVG measured in points', async () => {
  // pdftocairo writes SVGs measured in points, which become fractional CSS pixels.
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="132pt" height="244pt" viewBox="0 0 132 244"><rect width="132" height="244" fill="#ccc"/></svg>');
  try {
    assert.equal(Math.max(png.readUInt32BE(16), png.readUInt32BE(20)), 3840);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('honors --long-side', async () => {
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"/>', ['--long-side', '600']);
  try {
    assert.deepEqual(size(png), [600, 300]);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('renders a transparent background as opaque white', async () => {
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="30" cy="30" r="5"/></svg>', ['--long-side', '400']);
  try {
    const { data } = await pixels(png);
    assert.deepEqual(data.slice(0, 4), [255, 255, 255, 255]);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('anti-aliases diagonal edges at the output resolution', async () => {
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><line x1="0" y1="100" x2="100" y2="30" stroke="#000"/></svg>', ['--long-side', '800']);
  try {
    const { data } = await pixels(png);
    let partial = 0;
    for (let index = 0; index < data.length; index += 4) if (data[index] > 0 && data[index] < 255) partial += 1;
    assert.ok(partial > 800, `expected anti-aliased edge pixels, got ${partial}`);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('draws text with grayscale anti-aliasing', async () => {
  const { directory, png } = await convert('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40"><text x="10" y="30" font-family="sans-serif" font-size="20">Ag 注文</text></svg>', ['--long-side', '400']);
  try {
    const { data } = await pixels(png);
    let gray = 0;
    for (let index = 0; index < data.length; index += 4) {
      assert.ok(data[index] === data[index + 1] && data[index + 1] === data[index + 2], `colored edge pixel at ${index / 4}`);
      if (data[index] > 0 && data[index] < 255) gray += 1;
    }
    assert.ok(gray > 0, 'expected anti-aliased text edges');
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('keeps a leading space in a tspan', async () => {
  const text = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40"><text x="10" y="30" font-family="sans-serif" font-size="20">${body}</text></svg>`;
  const inkRight = async (body) => {
    const { directory, png } = await convert(text(body), ['--long-side', '400']);
    try {
      const { width, data } = await pixels(png);
      let right = 0;
      for (let index = 0; index < data.length; index += 4) if (data[index] < 128) right = Math.max(right, (index / 4) % width);
      return right;
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  };
  const spaced = await inkRight('<tspan>A</tspan><tspan> B</tspan>');
  assert.equal(spaced, await inkRight('A B'));
  assert.ok(spaced > await inkRight('AB'));
});

test('rejects unsupported options and file types', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'svg-to-png-'));
  try {
    const source = path.join(directory, 'input.svg');
    await fs.writeFile(source, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
    const run = (args) => execFileSync(process.execPath, [converter, ...args], { stdio: 'pipe' });
    assert.throws(() => run(['--input-file', source]));
    assert.throws(() => run(['--input-file', source, '--output-file', path.join(directory, 'out.jpg')]));
    assert.throws(() => run(['--input-file', source, '--output-file', path.join(directory, 'out.png'), '--long-side', '0']));
    assert.throws(() => run(['--input-file', source, '--output-file', path.join(directory, 'out.png'), '--scale', '2']));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('rejects an SVG without a size', async () => {
  await assert.rejects(convert('<svg xmlns="http://www.w3.org/2000/svg"/>'));
});
