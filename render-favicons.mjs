import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, 'Assets', 'favicon.svg');
const outDir = path.join(__dirname, 'Assets');

const svg = fs.readFileSync(svgPath, 'utf8');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600, deviceScaleFactor: 2 });

  for (const { name, size } of sizes) {
    const html = `<!doctype html><html><head><style>
      html,body{margin:0;padding:0;background:transparent;}
      body{display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;}
      svg{width:${size}px;height:${size}px;display:block;}
    </style></head><body>${svg}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const el = await page.$('svg');
    const buffer = await el.screenshot({ omitBackground: true, type: 'png' });
    fs.writeFileSync(path.join(outDir, name), buffer);
    console.log(`wrote ${name} (${size}x${size})`);
  }

  await browser.close();
})();
