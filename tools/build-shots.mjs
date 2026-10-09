// Crops and converts the DossierIQ demo screenshots (fictional firm, local instance) for the flagship band.
// SHOTS = the folder shoot.mjs wrote to. Run: SHOTS=<dir> node build-shots.mjs
import sharp from 'sharp';
import path from 'node:path';

const SHOTS = process.env.SHOTS;
if (!SHOTS) throw new Error('Set SHOTS to the screenshot folder.');
const OUT = path.resolve('..', 'assets', 'img');

const jobs = [
  { name: 'dossieriq-key-documents', crop: { left: 0, top: 0, width: 1648, height: 1170 } },
  { name: 'dossieriq-coverage', crop: { left: 0, top: 250, width: 1648, height: 750 } },
  { name: 'dossieriq-clean-room', crop: { left: 0, top: 0, width: 1536, height: 960 } },
];
for (const job of jobs) {
  const src = sharp(path.join(SHOTS, `${job.name}.png`));
  const meta = await src.metadata();
  const crop = { ...job.crop, height: Math.min(job.crop.height, meta.height - job.crop.top), width: Math.min(job.crop.width, meta.width) };
  const buffer = await src.extract(crop).png().toBuffer();
  for (const w of [800, 1400]) {
    const r = sharp(buffer).resize({ width: w, withoutEnlargement: true });
    const webp = await r.clone().webp({ quality: 82 }).toFile(path.join(OUT, `${job.name}-${w}.webp`));
    await r.clone().avif({ quality: 60 }).toFile(path.join(OUT, `${job.name}-${w}.avif`));
    console.log(`${job.name}-${w}: ${webp.width}x${webp.height} ${(webp.size / 1024).toFixed(0)} KB`);
  }
}
