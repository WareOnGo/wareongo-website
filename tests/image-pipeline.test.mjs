import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
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
