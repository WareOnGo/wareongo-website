import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Only publish files promised by the current build's overview loader data. */
export async function publishOverviewImages(dist = 'dist', cacheRoot = path.resolve('node_modules/.cache')) {
  const manifest = JSON.parse(await fs.readFile(path.join(dist, 'static-loader-data-manifest-stable.json'), 'utf8'));
  const files = new Map();
  for (const [route, payload] of Object.entries(manifest)) {
    if (!route.startsWith('/overview/')) continue;
    if (typeof payload !== 'string' || !payload.startsWith('static-loader-data/') || payload.includes('..')) throw new Error(`Invalid overview payload: ${route}`);
    const data = JSON.parse(await fs.readFile(path.join(dist, payload), 'utf8'));
    for (const value of Object.values(data)) {
      for (const src of Object.values(value?.coverImages ?? {})) {
        if (!/^\/listing-covers\/[a-f0-9]{24}\.webp$/.test(src)) throw new Error(`Invalid overview cover: ${route}`);
        files.set(src, 'wareongo-listing-covers-v1');
      }
      for (const variants of Object.values(value?.imageVariants ?? {})) for (const { src } of variants) {
        if (!/^\/overview-images\/[a-f0-9]{24}-\d+\.webp$/.test(src)) throw new Error(`Invalid editorial image: ${route}`);
        files.set(src, 'wareongo-overview-images-v1');
      }
    }
  }
  for (const [src, cache] of files) {
    const destination = path.join(dist, src);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(path.join(cacheRoot, cache, path.basename(src)), destination);
  }
  console.log(`[overview-images] ${files.size} optimized photos published`);
  return files.size;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  publishOverviewImages().catch(error => { console.error('[overview-images]', error.message); process.exitCode = 1; });
}
