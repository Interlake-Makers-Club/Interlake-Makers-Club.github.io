// Lists every placeholder still waiting on real club content (npm run todo).
// Each line names the file, the line, and the PRD open-question number.
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const scan = ['src', 'public'];
const hits = [];

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/^placeholder-/.test(e.name)) hits.push(`${relative(root, p)}  (placeholder file)`);
    else if (/\.(ya?ml|astro|ts|css|svg)$/.test(e.name)) {
      const lines = (await readFile(p, 'utf8')).split('\n');
      lines.forEach((l, i) => {
        if (/TODO\(Q\d+\)/.test(l)) hits.push(`${relative(root, p)}:${i + 1}  ${l.trim().slice(0, 110)}`);
      });
    }
  }
}

for (const d of scan) await walk(join(root, d));
if (hits.length === 0) console.log('No placeholders left. Ready for launch checks.');
else {
  console.log(`${hits.length} placeholder(s) left:\n`);
  hits.forEach((h) => console.log('  ' + h));
  process.exitCode = 0;
}
