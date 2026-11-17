// Builds public/og.png (1200 × 630), the image shown when the site link is shared:
// the logo mark + "We 3D print things that help." on the cream background.
// Re-run after replacing src/assets/logo/mark.svg: npm run og
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const markSvg = await readFile(new URL('src/assets/logo/mark.svg', root));
const mark = await sharp(markSvg, { density: 600 }).resize(160, 160, { fit: 'contain', background: '#00000000' }).png().toBuffer();

const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="100%" height="100%" fill="#F1E8DA"/>
  <text x="96" y="400" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="800" fill="#303536">We 3D print things</text>
  <text x="96" y="490" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="800" fill="#303536">that help.</text>
</svg>`);

await sharp(text)
  .composite([{ input: mark, left: 96, top: 120 }])
  .png()
  .toFile(new URL('public/og.png', root).pathname);
console.log('public/og.png written');
