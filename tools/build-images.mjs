// Converts the Midjourney PNGs into responsive WebP/AVIF for the site, and copies the self-hosted fonts.
// Output carries no metadata: sharp drops EXIF/XMP/comments unless asked to keep them (the sources embed prompts and
// job ids). Source images are not committed. Run: npm run images  (SRC defaults to the marketing folder.)
import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = process.env.SRC ?? 'C:/ClaudeCode_Files/marketing/site-images';
const OUT = path.resolve('..', 'assets', 'img');
mkdirSync(OUT, { recursive: true });

/** name → crop (in source pixels) / fix-up and the widths to emit. */
const jobs = [
  { name: 'hero-desktop', widths: [800, 1400, 2400], quality: { webp: 72, avif: 50 } },
  { name: 'hero-mobile', widths: [600, 1080], quality: { webp: 72, avif: 50 } },
  { name: 'problem-boxes', widths: [700, 1344] },
  // The scanner lid carries a made-up brand mark: blur that patch.
  { name: 'paper-to-proof', widths: [700, 1344], blur: { left: 850, top: 335, width: 140, height: 50 } },
  // Faces are in the upper part: keep only hands, papers and tea.
  { name: 'family-table', widths: [700, 1084], crop: { left: 260, top: 360, width: 1084, height: 536 } },
  { name: 'security-seal', widths: [600, 1024] },
];

for (const job of jobs) {
  let base = sharp(path.join(SRC, `${job.name}.png`));
  if (job.crop) base = sharp(await base.extract(job.crop).png().toBuffer());
  if (job.blur) {
    // A blurred patch with feathered edges, so the fix-up has no visible border.
    const { left, top, width, height } = job.blur;
    const pad = 24;
    const area = { left: left - pad, top: top - pad, width: width + 2 * pad, height: height + 2 * pad };
    const mask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${area.width}" height="${area.height}"><filter id="f"><feGaussianBlur stdDeviation="${pad / 2.5}"/></filter>` +
        `<rect x="${pad}" y="${pad}" width="${width}" height="${height}" rx="12" fill="#fff" filter="url(#f)"/></svg>`,
    );
    const patch = await sharp(path.join(SRC, `${job.name}.png`))
      .extract(area)
      .blur(10)
      .ensureAlpha()
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    base = sharp(await base.composite([{ input: patch, left: area.left, top: area.top }]).png().toBuffer());
  }
  const buffer = await base.png().toBuffer();
  for (const w of job.widths) {
    const resized = sharp(buffer).resize({ width: w, withoutEnlargement: true });
    const webp = await resized.clone().webp({ quality: job.quality?.webp ?? 76 }).toFile(path.join(OUT, `${job.name}-${w}.webp`));
    const avif = await resized.clone().avif({ quality: job.quality?.avif ?? 52 }).toFile(path.join(OUT, `${job.name}-${w}.avif`));
    console.log(`${job.name}-${w}: ${webp.width}x${webp.height} webp ${(webp.size / 1024).toFixed(0)} KB, avif ${(avif.size / 1024).toFixed(0)} KB`);
  }
}

// Self-hosted fonts (no third-party requests from the page).
const FONTS = path.resolve('..', 'assets', 'fonts');
mkdirSync(FONTS, { recursive: true });
for (const [pkg, file] of [
  ['playfair-display', 'playfair-display-latin-600-normal.woff2'],
  ['playfair-display', 'playfair-display-latin-700-normal.woff2'],
  ['inter', 'inter-latin-400-normal.woff2'],
  ['inter', 'inter-latin-600-normal.woff2'],
]) {
  copyFileSync(path.join('node_modules', '@fontsource', pkg, 'files', file), path.join(FONTS, file));
}
console.log('fonts copied');
