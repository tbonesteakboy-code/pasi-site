// Builds the 1200x630 link-preview image (og:image) in direction A: white, the PASI wordmark, the headline in Instrument
// Sans, and a drawn 60-month coverage strip (fictional, as on the Home page). All text is set in code. Run: npm run og
// Output: ../src/assets/img/og.png (PNG from code, so it carries no camera or editing metadata).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const font = (file) => readFileSync(path.join('node_modules', '@fontsource', 'instrument-sans', 'files', file));
const wordmark = readFileSync(path.resolve('..', 'src', 'assets', 'brand', 'pasi-wordmark-light.svg'));
const months = 'ooooooooooooooooooommmoooooooooooommmoooooooooooooorrooooooo';
const colour = { o: '#CDC9F6', m: '#DC3B42', r: '#E3A008' };

const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, children } });
const tree = h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', padding: '64px 72px', fontFamily: 'Instrument Sans', color: '#18191D' }, [
  { type: 'img', props: { src: `data:image/svg+xml;base64,${wordmark.toString('base64')}`, width: 300, height: 60 } },
  h('div', { marginTop: 56, fontSize: 68, fontWeight: 600, lineHeight: 1.04, letterSpacing: -2.6, maxWidth: 980 }, 'From boxes of paper to a Medicaid-ready file.'),
  h('div', { marginTop: 22, fontSize: 28, color: '#3B3C43' }, 'DossierIQ, for elder law and estate firms'),
  h('div', { marginTop: 'auto', display: 'flex', flexDirection: 'column' }, [
    h('div', { display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#6A6B73', marginBottom: 10 }, [h('div', {}, 'Statement coverage, 60 months'), h('div', {}, 'pasi.llc')]),
    h('div', { display: 'flex', height: 26 }, [...months].map((c) => h('div', { flex: 1, marginRight: 2, borderRadius: 3, backgroundColor: colour[c] }, []))),
  ]),
]);

const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Instrument Sans', data: font('instrument-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Instrument Sans', data: font('instrument-sans-latin-600-normal.woff'), weight: 600, style: 'normal' },
  ],
});
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
const out = await sharp(png).png({ compressionLevel: 9, palette: true }).toBuffer();
writeFileSync(path.resolve('..', 'src', 'assets', 'img', 'og.png'), out);
console.log(`og.png ${(out.length / 1024).toFixed(0)} KB`);
