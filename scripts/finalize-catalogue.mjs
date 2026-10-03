import fs from 'node:fs/promises';
import path from 'node:path';

// Run after sitemap validation has inspected the ordinary SSG files. Files at
// public paths would take precedence over Vercel's query-dependent rewrites.
const dist = path.resolve('dist');
const report = JSON.parse(await fs.readFile(path.join(dist, 'catalogue-build-report.json'), 'utf8'));
for (const entry of report.pages) {
  const original = path.join(dist, entry.path, 'index.html');
  const destination = path.join(dist, '__catalogue', entry.path, '1', 'index.html');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.rename(original, destination);
}
console.log(`[catalogue] published ${report.pages.length} categories and ${report.pages.reduce((sum, p) => sum + p.totalPages - 1, 0)} additional static pages`);
