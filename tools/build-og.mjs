// Builds the 1200×630 link-preview image (og:image): the Midjourney background with the DossierIQ shield, name and
// headline set in code (never generated text). Run: npm run og
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SRC = process.env.SRC ?? 'C:/ClaudeCode_Files/marketing/site-images';
const font = (pkg, file) => readFileSync(path.join('node_modules', '@fontsource', pkg, 'files', file));

const bg = await sharp(path.join(SRC, 'og-background.png')).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer();
const shield =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' +
  '<path d="m9 12 2 2 4-4"/></svg>';

const h = (type, style, children) => ({ type, props: { style, children } });
const tree = h(
  'div',
  { width: 1200, height: 630, display: 'flex', position: 'relative', fontFamily: 'Inter' },
  [
    { type: 'img', props: { src: `data:image/jpeg;base64,${bg.toString('base64')}`, width: 1200, height: 630, style: { position: 'absolute', top: 0, left: 0 } } },
    h('div', { position: 'absolute', top: 0, left: 0, width: 760, height: 630, display: 'flex', backgroundImage: 'linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.75) 65%, rgba(15,23,42,0) 100%)' }, []),
    h('div', { position: 'absolute', top: 0, left: 0, width: 720, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px' }, [
      h('div', { display: 'flex', alignItems: 'center', marginBottom: 28 }, [
        h('div', { width: 64, height: 64, borderRadius: 14, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 18 }, [
          { type: 'img', props: { src: `data:image/svg+xml;base64,${Buffer.from(shield).toString('base64')}`, width: 40, height: 40 } },
        ]),
        h('div', { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 48, color: '#ffffff' }, 'DossierIQ™'),
      ]),
      h('div', { fontFamily: 'Playfair Display', fontWeight: 600, fontSize: 54, lineHeight: 1.15, color: '#ffffff' }, 'From boxes of paper to a Medicaid-ready file.'),
      h('div', { marginTop: 26, fontSize: 26, color: '#a7f3d0' }, 'Built for elder law and estate firms'),
      h('div', { marginTop: 34, fontSize: 22, color: '#cbd5e1', letterSpacing: 1 }, 'pasi.llc'),
    ]),
  ],
);

const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Playfair Display', data: font('playfair-display', 'playfair-display-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Playfair Display', data: font('playfair-display', 'playfair-display-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Inter', data: font('inter', 'inter-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ],
});
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
const out = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
writeFileSync(path.resolve('..', 'assets', 'img', 'og.jpg'), out);
console.log(`og.jpg ${(out.length / 1024).toFixed(0)} KB`);
