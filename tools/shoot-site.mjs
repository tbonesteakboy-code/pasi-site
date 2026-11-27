// Full-page screenshots of the LOCAL pasi.llc build (eleventy --serve on :8099) at desktop and phone widths, for review.
// Usage: OUT=<dir> PAGES=/,/security/ node shoot-site.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const { BASE = 'http://localhost:8099', OUT = '.', PAGES = '/' } = process.env;
if (!BASE.startsWith('http://localhost')) throw new Error('Local build only.');

const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--hide-scrollbars', '--no-default-browser-check'],
  userDataDir: process.env.PROFILE,
});
const problems = [];
for (const [label, width, scale] of [['1440', 1440, 1], ['375', 375, 2]]) {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`${label} ${m.type()}: ${m.text().slice(0, 200)}`); });
  await page.setViewport({ width, height: 900, deviceScaleFactor: scale, isMobile: width < 768, hasTouch: width < 768 });
  for (const p of PAGES.split(',')) {
    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
    // Anything wider than the viewport means a sideways scroll on phones.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`${label} ${p}: page is ${overflow}px wider than the viewport`);
    const name = `${(p.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home')}-${label}.png`;
    // Size the viewport to the whole page instead of stitching (stitching repeated the hero on phones).
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewport({ width, height, deviceScaleFactor: scale, isMobile: width < 768, hasTouch: width < 768 });
    await page.screenshot({ path: path.join(OUT, name) });
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale, isMobile: width < 768, hasTouch: width < 768 });
    console.log('saved', name);
  }
  await page.close();
}
await browser.close();
console.log(problems.length ? problems.join('\n') : 'no console problems, no sideways scroll');
