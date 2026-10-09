import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
const compiled = await build({ stdin: { contents: `export * from './src/lib/stateCities.ts'; export * from './src/lib/warehouseImages.ts';`, resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs' });
const m = { exports: {} };
new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(createRequire(import.meta.url), m, m.exports);
const { resolveStateCities, bestTierOnePhoto, reportsQualityTiers } = m.exports;

const city = (slug, listings, hasPage = true) => ({ name: slug[0].toUpperCase() + slug.slice(1), slug, listings, hasPage });
const candidates = [city('kolar', 16), city('bengaluru', 635), city('hubli', 16), city('tumakuru', 1, false), city('mangaluru', 30), city('dharwad', 30), city('mysore', 8)];
const names = list => list.map(entry => entry.name);

test('without an edited list a state lists its four busiest cities, ties by name, and the rest with pages as others', () => {
  for (const entries of [null, undefined, []]) {
    const { list, others } = resolveStateCities(entries, candidates);
    assert.deepEqual(names(list), ['Bengaluru', 'Dharwad', 'Mangaluru', 'Hubli']);
    assert.ok(list.every(entry => entry.city && entry.image === null));
    assert.deepEqual(names(others), ['Kolar', 'Mysore']);
  }
  assert.deepEqual(names(resolveStateCities(null, candidates.slice(0, 2)).list), ['Bengaluru', 'Kolar']);
  assert.deepEqual(resolveStateCities(null, []), { list: [], others: [] });
});

test('an edited list keeps its order and names, and only slugs of this state resolve to our cities', () => {
  const image = { url: 'https://fixture.test/upload.jpg', alt: 'Upload', width: 1600, height: 900 };
  const { list, others } = resolveStateCities([
    { name: ' Kolar Gold Fields ', slug: 'kolar', image },
    { name: 'Sriperumbudur', slug: null, image: null },
    { name: 'Gone', slug: 'not-ours', image: null },
    { name: 'Tumakuru', slug: 'tumakuru', image: null },
    { name: '  ', slug: 'bengaluru', image: null },
  ], candidates);
  assert.deepEqual(names(list), ['Kolar Gold Fields', 'Sriperumbudur', 'Gone', 'Tumakuru']);
  assert.equal(list[0].city.slug, 'kolar');
  assert.equal(list[0].image, image);
  assert.equal(list[1].city, undefined);
  assert.equal(list[2].city, undefined);
  assert.equal(list[3].city.slug, 'tumakuru');
  assert.deepEqual(names(others), ['Bengaluru', 'Dharwad', 'Mangaluru', 'Hubli', 'Mysore']);
  const long = Array.from({ length: 10 }, (_, i) => ({ name: `City ${i}`, slug: null, image: null }));
  assert.equal(resolveStateCities(long, candidates).list.length, 8);
});

const photo = (n, extra = {}) => ({ id: n, originalUrl: `https://fixture.test/${n}.jpg`, webpUrl: `https://fixture.test/webp/${n}.webp`,
  displayUrl: `https://fixture.test/webp/${n}.webp`, classification: null, documentKind: null, caption: null,
  qualityTier: 'T1', coverSuitable: false, width: 1600, height: 1200, ...extra });
// The API sends the shared image contract in `images` and quality beside it, aligned.
const QUALITY = ['qualityTier', 'coverSuitable', 'width', 'height'];
const listing = (id, size, photos) => photos === undefined ? { id, size, images: undefined } : ({ id, size,
  images: photos.map(p => Object.fromEntries(Object.entries(p).filter(([k]) => !QUALITY.includes(k)))),
  imageQuality: photos.map(p => Object.fromEntries(QUALITY.map(k => [k, p[k] ?? null]))) });

test('the best T1 photo prefers cover-suitable, landscape, the larger listing, the lower ID, then gallery order', () => {
  const none = new Set();
  const pick = listings => bestTierOnePhoto(listings, none, 'Warehouse in Place')?.fallback;
  assert.equal(pick([listing(1, 90000, [photo(1)]), listing(2, 100, [photo(2, { coverSuitable: true })])]), photo(2).originalUrl);
  assert.equal(pick([listing(1, 90000, [photo(1, { width: 900, height: 1600 })]), listing(2, 100, [photo(2)])]), photo(2).originalUrl);
  assert.equal(pick([listing(1, 100, [photo(1)]), listing(2, 90000, [photo(2)])]), photo(2).originalUrl);
  assert.equal(pick([listing(9, 500, [photo(9)]), listing(3, 500, [photo(3)])]), photo(3).originalUrl);
  assert.equal(pick([listing(1, 500, [photo(4), photo(5)])]), photo(4).originalUrl);
});

test('the T1 photo skips used, lower-tier and invalid photos and carries its fallback, alt and size', () => {
  const listings = [listing(1, 500, [
    photo(1, { coverSuitable: true }), photo(2, { qualityTier: 'T2', coverSuitable: true }),
    photo(3, { webpUrl: null, caption: ' Loading bay ', width: 0 }), photo(4, { originalUrl: 'https://fixture.test/clip.mp4', webpUrl: null }),
  ])];
  assert.deepEqual(bestTierOnePhoto(listings, new Set(), 'Warehouse in Place'),
    { url: photo(1).webpUrl, alt: 'Warehouse in Place', width: 1600, height: 1200, fallback: photo(1).originalUrl });
  assert.deepEqual(bestTierOnePhoto(listings, new Set([photo(1).originalUrl]), 'Warehouse in Place'),
    { url: photo(3).originalUrl, alt: 'Loading bay' });
  assert.equal(bestTierOnePhoto(listings, new Set([photo(1).originalUrl, photo(3).originalUrl]), 'x'), null);
  assert.equal(bestTierOnePhoto([listing(1, 1, undefined)], new Set(), 'x'), null);
});

test('quality tiers are reported only when some gallery photo carries one', () => {
  const older = { images: listing(1, 1, [photo(1)]).images };
  assert.equal(reportsQualityTiers([older, { images: undefined }]), false);
  assert.equal(reportsQualityTiers([older, listing(2, 1, [photo(2, { qualityTier: 'T3' })])]), true);
});
