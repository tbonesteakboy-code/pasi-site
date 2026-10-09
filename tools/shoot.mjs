// Captures DossierIQ screenshots from a LOCAL demo instance with a fictional firm (never production).
// Usage: BASE=http://localhost:3100 MATTER=<id> TOKEN=<session token> OUT=<dir> node shoot.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const { BASE = 'http://localhost:3100', MATTER, TOKEN, OUT = '.' } = process.env;
if (!BASE.startsWith('http://localhost')) throw new Error('Screenshots are taken from the local demo instance only.');

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-first-run', '--hide-scrollbars', '--no-default-browser-check'],
  userDataDir: process.env.PROFILE,
});
const page = await browser.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message.slice(0, 300)}`));
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await browser.setCookie({ name: 'authjs.session-token', value: TOKEN, domain: 'localhost', path: '/', httpOnly: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = async (selector, text) => {
  const ok = await page.evaluate(
    (sel, t) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().includes(t));
      if (el) el.click();
      return Boolean(el);
    },
    selector,
    text,
  );
  if (!ok) throw new Error(`Not found: ${selector} "${text}"`);
};
const shot = async (name, clip) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), clip });
  console.log('saved', name);
};
const boxOf = (sel, text) =>
  page.evaluate(
    (s, t) => {
      const el = [...document.querySelectorAll(s)].find((e) => !t || e.textContent.includes(t));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
    },
    sel,
    text,
  );

await page.goto(`${BASE}/matters/${MATTER}`, { waitUntil: 'networkidle0' });
process.on('unhandledRejection', async (e) => { await page.screenshot({ path: path.join(OUT, 'debug.png') }); console.error('FAILED at', page.url(), e.message); await browser.close(); process.exit(1); });
await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
await page.waitForFunction(() => document.body.textContent.includes('Key documents') && document.body.textContent.includes('Bank statements'), { timeout: 60000 });
await wait(800);

// 1. Key Documents: expand the bank statements item (confirmed + possible) and the POA (confirmed).
const expand = (label) =>
  page.evaluate((l) => {
    const li = [...document.querySelectorAll('li')].find((e) => e.querySelector('span')?.textContent.trim() === l);
    const b = li && [...li.querySelectorAll('button')].find((x) => /document/.test(x.textContent));
    if (b) b.click();
    return Boolean(b);
  }, label);
for (const l of ['Health insurance premiums', 'Social Security benefit letter']) if (!(await expand(l))) console.log('no expander for', l);
await wait(400);
const section = await boxOf('section', 'Key documents');
await shot('dossieriq-key-documents', { x: section.x, y: section.y, width: section.width, height: Math.min(section.height, 980) });

// 2. Statement coverage: the PA Medicaid packet summary.
await clickText('button', 'PA Medicaid packet');
await page.waitForFunction(() => document.body.textContent.includes('months of statements on file'), { timeout: 30000 });
await wait(500);
const notice = await boxOf('section', 'PA Medicaid packet selected');
await shot('dossieriq-coverage', { x: notice.x, y: notice.y, width: notice.width, height: 900 });

// 3. Clean Room: Send securely with the drafted cover note.
await clickText('button', 'Send securely');
await page.waitForFunction(() => document.body.textContent.includes('New secure share'), { timeout: 30000 });
await page.waitForFunction(() => [...document.querySelectorAll('textarea')].some((t) => t.value.includes('Please find enclosed')), { timeout: 30000 });
await page.type('input[type="email"]', 'caseworker@example.org');
await wait(600);
const modal = await boxOf('[role="dialog"]');
await shot('dossieriq-clean-room', modal ?? undefined);

console.log('browser problems:', JSON.stringify(problems, null, 1));
await browser.close();
