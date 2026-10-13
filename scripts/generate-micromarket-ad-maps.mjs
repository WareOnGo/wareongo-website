import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Run with MAPBOX_ACCESS_TOKEN in the process environment (never a VITE_* key).
// Cameras are shared with the page so images and interactive labels stay aligned.
const root = fileURLToPath(new URL('../', import.meta.url));
const slug = process.argv[2];
const token = process.env.MAPBOX_ACCESS_TOKEN;
const fail = message => { console.error(message); process.exit(1); };
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail('Usage: npm run maps:ad-pages -- <micromarket-slug>');
if (!token) fail('Set MAPBOX_ACCESS_TOKEN in the environment before rendering maps.');

const page = JSON.parse(await readFile(path.join(root, 'src/data/micromarket-ad-pages', `${slug}.json`), 'utf8'));
const validPoint = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite)
  && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 85;
if (!page.map || page.mapMarkets.some(market => !validPoint(page.map.coordinates[market]))) {
  fail('The page needs map cameras and coordinates for every selected market.');
}
const formats = { desktop: [1260, 540], tablet: [810, 540], mobile: [360, 360] };
for (const [view, [width, height]] of Object.entries(formats)) {
  const camera = page.map.views[view];
  if (!camera || camera.width !== width || camera.height !== height || !validPoint(camera.center)
    || !Number.isFinite(camera.zoom) || camera.zoom < 0 || camera.zoom > 22
    || !camera.src.startsWith(`/bangalore/${slug}/`) || camera.src.includes('..') || !camera.src.endsWith('.webp')) {
    fail(`Invalid ${view} map camera. Preserve the shared map dimensions and use /bangalore/${slug}/*.webp.`);
  }
}

for (const view of Object.keys(formats)) {
  const camera = page.map.views[view];
  const url = new URL(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${camera.center.join(',')},${camera.zoom},0,0/${camera.width}x${camera.height}@2x`);
  url.searchParams.set('access_token', token);
  // Keep Mapbox/OpenStreetMap attribution and the complete image in all views.
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
    if (!response.ok) fail(`Mapbox returned HTTP ${response.status} for the ${view} map.`);
    const source = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(source).metadata();
    if (metadata.width !== camera.width * 2 || metadata.height !== camera.height * 2) fail(`Unexpected ${view} image dimensions.`);
    const image = await sharp(source).webp({ quality: 88, effort: 6 }).toBuffer();
    const target = path.join(root, 'public', camera.src);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, image);
    console.log(`${slug} ${view}: ${metadata.width} × ${metadata.height}, ${Math.round(image.length / 1024)} KB → ${camera.src}`);
  } catch {
    // Do not log a request URL or an exception that may contain the access token.
    fail(`Could not render the ${view} map. Check network access and the configured Mapbox credential.`);
  }
}
