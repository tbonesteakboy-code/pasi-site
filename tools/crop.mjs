// Cuts a tall screenshot into pieces of the given height (review helper, not deployed).
import sharp from 'sharp';
const [, , file, h = '1100'] = process.argv;
const img = sharp(file); const { width, height } = await img.metadata();
const step = Number(h); let i = 0;
for (let top = 0; top < height; top += step, i++) {
  const out = file.replace(/\.png$/, `-${i}.png`);
  await sharp(file).extract({ left: 0, top, width, height: Math.min(step, height - top) }).toFile(out);
}
console.log(file, width, height, i, 'pieces');
