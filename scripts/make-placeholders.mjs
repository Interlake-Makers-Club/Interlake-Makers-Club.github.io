// Generates the placeholder images and 3D models the site ships with until the
// club's real assets arrive. Re-running it only overwrites files named
// placeholder-*, so real assets are never touched.
// Usage: node scripts/make-placeholders.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { Document, NodeIO } from '@gltf-transform/core';

const root = new URL('../', import.meta.url);
const out = (p) => new URL(p, root);

const BG = '#E7DAC4';
const INK = '#303536';

function placeholderSvg(w, h, line1, line2) {
  const s = Math.round(Math.min(w, h) / 14);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${BG}"/>
  <rect x="${s}" y="${s}" width="${w - 2 * s}" height="${h - 2 * s}" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="24 16"/>
  <text x="50%" y="${h / 2 - s * 0.2}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${s * 1.2}" font-weight="700" fill="${INK}">${line1}</text>
  <text x="50%" y="${h / 2 + s * 1.4}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${s * 0.8}" fill="${INK}">${line2}</text>
</svg>`);
}

async function png(path, w, h, line1, line2) {
  await mkdir(out(path.replace(/[^/]+$/, '')), { recursive: true });
  await sharp(placeholderSvg(w, h, line1, line2)).png().toFile(out(path).pathname);
}

// ---------- images ----------
for (let i = 1; i <= 3; i++) {
  await png(`src/assets/projects/placeholder-project-${i}.png`, 1600, 1200, 'PLACEHOLDER', `Project ${i} photo (Q15)`);
}
for (let i = 1; i <= 4; i++) {
  await png(`src/assets/officers/placeholder-officer-${i}.png`, 600, 600, 'PLACEHOLDER', `Officer ${i} photo (Q18)`);
}
for (let i = 1; i <= 3; i++) {
  await png(`src/assets/posters/placeholder-model-${i}.png`, 1200, 1200, 'PLACEHOLDER', `Model ${i} photo (Q16)`);
}

// ---------- logo (Q1) ----------
const mark = `<!-- TODO(Q1) placeholder logo mark: replace this file with the club logo mark (square SVG) --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${INK}"/><text x="32" y="41" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700" fill="#F1E8DA">MC</text></svg>\n`;
await mkdir(out('src/assets/logo/'), { recursive: true });
await mkdir(out('public/'), { recursive: true });
// Only written if missing, so a real logo is never overwritten.
import { existsSync } from 'node:fs';
if (!existsSync(out('src/assets/logo/mark.svg'))) await writeFile(out('src/assets/logo/mark.svg'), mark);
if (!existsSync(out('public/favicon.svg'))) await writeFile(out('public/favicon.svg'), mark);

// ---------- 3D models (Q16) ----------
function box() {
  const p = [], n = [], idx = [];
  const faces = [
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
    [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [0, 0, -1], [1, 0, 0]],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
  ];
  for (const [nn, u, v] of faces) {
    const base = p.length / 3;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      p.push(nn[0] * 0.5 + (u[0] * a + v[0] * b) * 0.5, nn[1] * 0.5 + (u[1] * a + v[1] * b) * 0.5, nn[2] * 0.5 + (u[2] * a + v[2] * b) * 0.5);
      n.push(...nn);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { p, n, idx };
}

function torus(R = 0.5, r = 0.2, seg = 64, side = 32) {
  const p = [], n = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = (i / seg) * Math.PI * 2;
    for (let j = 0; j <= side; j++) {
      const v = (j / side) * Math.PI * 2;
      const cx = Math.cos(u), cz = Math.sin(u);
      p.push((R + r * Math.cos(v)) * cx, r * Math.sin(v), (R + r * Math.cos(v)) * cz);
      n.push(Math.cos(v) * cx, Math.sin(v), Math.cos(v) * cz);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < side; j++) {
    const a = i * (side + 1) + j, b = a + side + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  return { p, n, idx };
}

function cylinder(r = 0.4, h = 1, seg = 64) {
  const p = [], n = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2, x = Math.cos(t), z = Math.sin(t);
    p.push(x * r, -h / 2, z * r, x * r, h / 2, z * r);
    n.push(x, 0, z, x, 0, z);
  }
  for (let i = 0; i < seg; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
  for (const [y, ny] of [[h / 2, 1], [-h / 2, -1]]) {
    const c = p.length / 3; p.push(0, y, 0); n.push(0, ny, 0);
    for (let i = 0; i <= seg; i++) { const t = (i / seg) * Math.PI * 2; p.push(Math.cos(t) * r, y, Math.sin(t) * r); n.push(0, ny, 0); }
    for (let i = 1; i <= seg; i++) ny > 0 ? idx.push(c, c + i + 1, c + i) : idx.push(c, c + i, c + i + 1);
  }
  return { p, n, idx };
}

async function glb(path, { p, n, idx }) {
  const doc = new Document();
  const buf = doc.createBuffer();
  const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(p)).setBuffer(buf);
  const nor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(n)).setBuffer(buf);
  const ind = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buf);
  const mat = doc.createMaterial('filament').setBaseColorFactor([0.8, 0.8, 0.8, 1]).setRoughnessFactor(0.6).setMetallicFactor(0);
  const prim = doc.createPrimitive().setAttribute('POSITION', pos).setAttribute('NORMAL', nor).setIndices(ind).setMaterial(mat);
  const mesh = doc.createMesh('placeholder').addPrimitive(prim);
  const node = doc.createNode('placeholder').setMesh(mesh);
  doc.createScene('scene').addChild(node);
  await mkdir(out('public/models/'), { recursive: true });
  await new NodeIO().write(out(path).pathname, doc);
}

await glb('public/models/placeholder-model-1.glb', torus());
await glb('public/models/placeholder-model-2.glb', box());
await glb('public/models/placeholder-model-3.glb', cylinder());

console.log('Placeholders written.');
