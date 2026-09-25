import assert from 'node:assert/strict';
import { test } from 'node:test';
import { warehousePhotos } from '../scripts/generate-sitemap.mjs';

const original = (id) => `https://fixture.test/images/${id}.jpg`;
const webp = (id) => `https://fixture.test/webp/hash-${id}.webp`;

test('sitemap retains approved originals when every WebP slot is null', () => {
  const images = [1, 2, 3].map((id) => ({ originalUrl: original(id), webpUrl: null }));
  assert.deepEqual(warehousePhotos({ images, photos: images.map((row) => row.originalUrl), photosWebp: [null, null, null] }),
    [original(1), original(2), original(3)]);
});

test('sitemap uses each approved pair in gallery order, including mixed missing variants', () => {
  const images = [
    { originalUrl: original(2), webpUrl: webp(2) },
    { originalUrl: original(1), webpUrl: null },
    { originalUrl: original(3), webpUrl: webp(3) },
  ];
  assert.deepEqual(warehousePhotos({ images, photos: [original('blocked')], photosWebp: [webp('blocked')] }),
    [webp(2), original(1), webp(3)]);
});

test('an empty approved gallery never revives legacy photos or variants', () => {
  assert.deepEqual(warehousePhotos({ images: [], photos: [original('blocked')], photosWebp: [webp('blocked')] }), []);
});

test('older responses retain original photos without guessing variant membership', () => {
  assert.deepEqual(warehousePhotos({ photos: [`${original(1)}, ${original(2)}`, original(1), null], photosWebp: [null, webp('orphan')] }),
    [original(1), original(2)]);
});

test('invalid variants fall back to their original; malformed rows cannot add images', () => {
  assert.deepEqual(warehousePhotos({ images: [null, {}, { originalUrl: 'invalid', webpUrl: webp(1) },
    { originalUrl: original(2), webpUrl: 'javascript:alert(1)' },
    { originalUrl: original(3), webpUrl: 'https://' }] }), [original(2), original(3)]);
});

test('sitemap preserves URL commas, deduplicates images and caps the gallery at eight', () => {
  const withComma = 'https://fixture.test/images/crop,resize.jpg';
  const row = { originalUrl: withComma, webpUrl: null };
  const images = [row, row, ...Array.from({ length: 10 }, (_, id) => ({ originalUrl: original(id), webpUrl: webp(id) }))];
  assert.deepEqual(warehousePhotos({ images }), [withComma, ...Array.from({ length: 7 }, (_, id) => webp(id))]);
});
