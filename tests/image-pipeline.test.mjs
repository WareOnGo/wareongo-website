import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import fs from 'node:fs';
const compiled = await build({ stdin: { contents: `export * from './src/lib/warehouseImages.ts';`, resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs' });
const m = { exports: {} };
new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(createRequire(import.meta.url), m, m.exports);
const { preferredWarehouseImages, warehouseImages } = m.exports;
const a = 'https://fixture.test/a.jpg', b = 'https://fixture.test/b.jpg', webp = 'https://fixture.test/webp/images/hash/encoded.webp';
test('explicit WebP/original pairs retain order without filename matching', () => {
  const result = preferredWarehouseImages({ images: [{ originalUrl: b, webpUrl: null }, { originalUrl: a, webpUrl: webp }], photos: [a,b], photosWebp: [] });
  assert.deepEqual(result, { images: [b,webp], fallbacks: [null,a] });
  assert.deepEqual(warehouseImages(result.images, result.fallbacks), [{ primary: b, fallback: null }, { primary: webp, fallback: a }]);
});
test('pending metadata and an explicit empty array do not revive legacy images', () => {
  assert.deepEqual(preferredWarehouseImages({ images: [], photos: [a] }).images, []);
  assert.deepEqual(preferredWarehouseImages({ images: [{ originalUrl: a, webpUrl: null }] }).images, [a]);
});
test('older APIs retain legacy pairing and exclude orphaned WebPs', () => {
  assert.deepEqual(preferredWarehouseImages({ photos: [a,b], photosWebp: ['https://fixture.test/webp/b.webp','https://fixture.test/webp/orphan.webp'] }),
    { images: [a,'https://fixture.test/webp/b.webp'], fallbacks: [null,b] });
});
test('all curated Bangalore listing photos remain valid gallery frames', () => {
  const page = JSON.parse(fs.readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url), 'utf8'));
  const photos = Object.entries(page.images).filter(([slot]) => slot.startsWith('warehouse-')).map(([, image]) => image.url);
  assert.equal(photos.length, 18);
  for (const photo of photos) {
    assert.ok(fs.existsSync(new URL(`../public${photo}`, import.meta.url)), `Missing bundled photo: ${photo}`);
    assert.deepEqual(warehouseImages([photo], [a]), [{ primary: photo, fallback: a }]);
  }
});
test('gallery paths preserve CMS query strings and local fallbacks without admitting non-images', () => {
  const local = '/bangalore/available-1398.webp?revision=2';
  assert.deepEqual(warehouseImages([local, local, a], [b, null, local]), [{ primary: local, fallback: b }, { primary: a, fallback: local }]);
  assert.deepEqual(warehouseImages(['/brochure.pdf', '/tour.mp4', 'bangalore/photo.webp', '//other.test/photo.webp', '/\\other.test/photo.webp', 'javascript:alert(1)', 'data:image/png;base64,abc']), []);
  assert.deepEqual(preferredWarehouseImages({ photos: [local, a] }).images, [a], 'API inputs still require absolute image URLs');
});
