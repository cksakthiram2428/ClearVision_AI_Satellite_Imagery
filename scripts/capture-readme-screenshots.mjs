import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../docs/images');
const baseUrl = 'http://127.0.0.1:5173';

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

await page.screenshot({
  path: path.join(outDir, 'hero-section.png'),
  fullPage: false,
});

await page.getByRole('button', { name: 'New Process' }).first().click();
await page.waitForTimeout(600);
await page.screenshot({
  path: path.join(outDir, 'upload-panel.png'),
  fullPage: false,
});
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
await page.waitForTimeout(800);
await page.screenshot({
  path: path.join(outDir, 'cloud-removal-demo.png'),
  fullPage: false,
});

await page.getByRole('button', { name: 'Process History' }).first().click();
await page.waitForTimeout(800);
await page.screenshot({
  path: path.join(outDir, 'history-panel.png'),
  fullPage: false,
});

await browser.close();
console.log('Screenshots saved to', outDir);
