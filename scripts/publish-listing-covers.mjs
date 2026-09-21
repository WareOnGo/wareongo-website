import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Publish only assets referenced by this build, never every cached old photo. */
export async function publishListingCovers(dist = 'dist', cacheDir = path.resolve('node_modules/.cache/wareongo-listing-covers-v1')) {
  const manifest = JSON.parse(await fs.readFile(path.join(dist, 'static-loader-data-manifest-stable.json'), 'utf8'));
  const names = new Set();
  for (const [route, payload] of Object.entries(manifest)) {
    if (route !== '/listings' && !route.startsWith('/listings/')) continue;
    if (typeof payload !== 'string' || !payload.startsWith('static-loader-data/') || payload.includes('..')) throw new Error(`Invalid listing payload: ${route}`);
    const data = JSON.parse(await fs.readFile(path.join(dist, payload), 'utf8'));
    for (const value of Object.values(data)) {
      if (!value?.coverImage) continue;
      const match = /^\/listing-covers\/([a-f0-9]{24}\.webp)$/.exec(value.coverImage.src);
      if (!match) throw new Error(`Invalid listing cover: ${route}`);
      names.add(match[1]);
    }
  }
  if (names.size) await fs.mkdir(path.join(dist, 'listing-covers'), { recursive: true });
  // Fail if a promised asset is missing; publishing broken preloads is unsafe.
  for (const name of names) await fs.copyFile(path.join(cacheDir, name), path.join(dist, 'listing-covers', name));
  console.log(`[listing-covers] ${names.size} optimized first-card photos published`);
  return names.size;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  publishListingCovers().catch(error => { console.error('[listing-covers]', error.message); process.exitCode = 1; });
}
