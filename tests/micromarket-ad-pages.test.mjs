import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const { outputFiles } = await build({
  stdin: { contents: `export * from './src/loaders/micromarketLandingLoader';
    export * from './src/data/micromarketAdPages';
    export { warehouseAPI } from './src/services/warehouseAPI';`,
  resolveDir: fileURLToPath(new URL('../', import.meta.url)), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs',
  define: { 'import.meta.env': '{"SSR":false}', __DEV_SERVER__: 'false' },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);
const { marketRentRange, marketListings, featuredMarketListings, readMarketInventory,
  micromarketLandingLoader, warehouseAPI, getMicromarketAdPage, micromarketAdContent, marketText } = compiled.exports;

const warehouse = (id, size, rate, type = 'Shed') => ({ id, totalSpaceSqft: [size], ratePerSqft: rate,
  warehouseType: type, city: 'Bangalore', state: 'Karnataka', address: 'Peenya', micromarket: ['Peenya'],
  photos: [`https://images.example.test/warehouse-${id}.webp`], clearHeightFt: '20', fireNocAvailable: false });

test('rent uses every measured asking rate, excludes BTS, respects the floor and requires ten rates', () => {
  const stock = Array.from({ length: 10 }, (_, index) => warehouse(index, 6000, index === 9 ? '70' : '15'));
  stock.push(warehouse(11, 30000, '400', 'BTS'), warehouse(12, 7000, 'Not disclosed'));
  assert.deepEqual(marketRentRange(stock, 25), { min: 25, max: 80, label: '₹25 to ₹80' });
  assert.equal(marketRentRange(stock.slice(1), 25), null);
});

test('featured spaces use local photos, prefer sheds and cover size boundaries above the rent floor', () => {
  const stock = [warehouse(1, 4999, '25'), warehouse(2, 5000, '30', 'PEB'), warehouse(3, 20000, '28', 'RCC'),
    warehouse(4, 8000, '20'), warehouse(5, 7000, '27'), warehouse(6, 40000, '26', 'BTS')];
  const listings = marketListings(stock, 'Peenya');
  assert.equal(listings.length, 5);
  const featured = featuredMarketListings(listings, 25);
  assert.deepEqual(featured.map(item => item.id), [1, 5, 3]);
  assert.ok(featured.every(item => item.locality === 'Peenya' && item.image.includes(`warehouse-${item.id}`)));
  assert.deepEqual(featuredMarketListings(listings.filter(item => item.size < 20000), 25).map(item => item.id), [1, 5, 2]);
});

test('inventory reads all pages with exact city/tag filters and refuses an incomplete snapshot', async () => {
  const original = warehouseAPI.getWarehouses;
  const calls = [];
  try {
    warehouseAPI.getWarehouses = async (...args) => {
      calls.push(args);
      return { data: [warehouse(args[0], 6000, '25')], pagination: { totalItems: 2, totalPages: 2 } };
    };
    assert.equal((await readMarketInventory('Bengaluru', 'Peenya')).length, 2);
    assert.deepEqual(calls.map(args => args[0]), [1, 2]);
    assert.deepEqual(calls[0][2], { city: 'Bengaluru', micromarket: 'Peenya', locationMatch: 'exact' });
    assert.equal(calls[0][4], 'live');
    warehouseAPI.getWarehouses = async () => ({ data: [], pagination: { totalItems: 1, totalPages: 1 } });
    await assert.rejects(readMarketInventory('Bengaluru', 'Peenya'), /Incomplete inventory/);
  } finally { warehouseAPI.getWarehouses = original; }
});

test('only registered micromarkets resolve as ad pages', async () => {
  assert.equal(getMicromarketAdPage('peenya').name, 'Peenya');
  assert.equal(getMicromarketAdPage('not-a-market'), undefined);
  await assert.rejects(micromarketLandingLoader({ params: { micromarket: 'not-a-market' }, request: new Request('https://wareongo.com/bangalore/not-a-market') }), error => error.status === 404);
});

test('hero, rent table and FAQ share one inventory snapshot while city content stays intact', () => {
  const base = JSON.parse(readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url)));
  const before = structuredClone(base);
  const page = getMicromarketAdPage('peenya');
  const data = { listingCount: 62, rentRange: '₹25 to ₹80', rentRows: [{ area: 'Peenya', rent: '₹25 to ₹80' }] };
  const content = micromarketAdContent(base, page, data);
  assert.match(marketText(page.heroSummary, data), /62 warehouses in Peenya · ₹25 to ₹80/);
  assert.equal(content.rentGuide.rows[0].rent, data.rentRange);
  assert.match(content.faqs[1].a, /₹25 to ₹80/);
  assert.match(content.copy.availableFooter, /all 62 Peenya listings/);
  assert.deepEqual(content.services, base.services);
  assert.deepEqual(content.benefits, base.benefits);
  assert.deepEqual(base, before);
  const sparse = micromarketAdContent(base, page, { ...data, rentRange: null, rentRows: [] });
  assert.doesNotMatch(sparse.faqs[1].a, /₹|from Rent on request/);
});
