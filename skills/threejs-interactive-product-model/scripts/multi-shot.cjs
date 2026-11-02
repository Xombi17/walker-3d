// Scripted screenshots: one browser session, many states.
// Usage: node multi-shot.cjs '<json steps>' [width] [height] [url]
//   steps: [["name", "code evaluated in the page", waitMs], ...]  ->  name.png in the current directory
// Requires Playwright (preinstalled in Claude Code on the web). Waits for window.appDebug (rename below if needed).
const { chromium } = require('playwright');

const steps = JSON.parse(process.argv[2] || '[]');
const width = +(process.argv[3] || 1300);
const height = +(process.argv[4] || 850);
const url = process.argv[5] || 'http://localhost:5173/';
const debugName = process.env.DEBUG_GLOBAL || 'appDebug';

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const logs = [];
  page.on('console', (message) => {
    if (message.type() !== 'debug') logs.push(`[${message.type()}] ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`[pageerror] ${error.message}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction((name) => window[name], debugName, { timeout: 30000 });
  for (const [name, code, wait] of steps) {
    if (code) await page.evaluate(code);
    await page.waitForTimeout(wait ?? 2500); // software GL is slow: give it a few frames
    await page.screenshot({ path: `${name}.png` });
  }
  console.log(logs.join('\n'));
  await browser.close();
})();
