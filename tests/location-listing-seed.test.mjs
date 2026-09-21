import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { locationTypeCombos } from '../scripts/lib/locations.mjs';

const bundled = await build({
  entryPoints: ['src/loaders/locationLoader.ts'], bundle: true, write: false,
  platform: 'node', format: 'esm', drop: ['console'],
  define: { '__DEV_SERVER__': 'true', 'import.meta.env': JSON.stringify({ SSR: false, VITE_API_BASE_URL: 'https://fixture.invalid' }) },
});
let run = 0;
const freshLoader = () => import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text + `\n// run ${run++}`).toString('base64'));
const row = (id, city, warehouseType, size = 10000) => ({ id, city, state: 'Karnataka', warehouseType,
  address: `Warehouse ${id}`, totalSpaceSqft: [size], photos: [], micromarket: ['Nelamangala'] });

function mockInventory(t, inventory, filtered, markets = []) {
  t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(input);
    if (url.pathname === '/micromarkets') return Response.json({ data: markets });
    if (url.pathname === '/locations') return Response.json({ data: { cities: [], states: [] } });
    if (url.pathname === '/warehouses') {
      const data = url.searchParams.has('locationMatch') ? filtered : inventory;
      return Response.json({ data, pagination: { currentPage: 1, pageSize: Number(url.searchParams.get('pageSize')), totalPages: 1, totalItems: data.length } });
    }
    return new Response('{}', { status: 404 });
  });
}

test('micromarket grid counts and size summary stay inside its city; overview membership stays intact', async t => {
  const inventory = [row(1, ' Bangalore ', 'PEB'), row(2, 'Bengaluru', 'PEB'), row(3, 'Bengaluru', 'PEB'),
    row(4, 'Bengaluru', 'RCC'), row(5, 'Bengaluru', 'RCC'), row(6, 'Delhi', 'PEB', 999000)];
  mockInventory(t, inventory, inventory.slice(0, 5).reverse(), [{ name: 'Nelamangala', slug: 'nelamangala',
    parentCity: 'Bengaluru', citySlug: 'bengaluru', parentState: 'Karnataka', stateSlug: 'karnataka',
    hasPage: true, listings: 6, listingIds: [1, 2, 3, 4, 5, 6], peers: [] }]);
  const loader = await freshLoader();
  const overview = await loader.micromarketOverviewLoader({ params: { state: 'karnataka', city: 'bengaluru', micromarket: 'nelamangala' } });
  assert.equal(overview.warehouses.length, 6);
  assert.deepEqual(overview.typeCounts, { PEB: 4, RCC: 2 });
  const grid = await loader.cityTypeListingsLoader({ params: { city: 'bengaluru', type: 'nelamangala' } });
  assert.deepEqual(grid.warehouses.map(w => w.id), [5, 4, 3, 2, 1]);
  assert.equal(grid.pagination.totalItems, 5);
  assert.equal(grid.summary.maxSize, 10000);
  assert.deepEqual(grid.typeCounts, { PEB: 3, RCC: 2 });
  assert.deepEqual(await loader.micromarketOverviewLoader({ params: { state: 'karnataka', city: 'bengaluru', micromarket: 'nelamangala' } }), overview);
});

test('type links and static routes include hybrid stock and normalized location whitespace', async t => {
  const inventory = [row(1, 'New\u00a0\u00a0Town', 'PEB + RCC')];
  mockInventory(t, inventory, inventory);
  const loader = await freshLoader();
  const grid = await loader.cityListingsLoader({ params: { city: 'new-town' } });
  assert.deepEqual(grid.typeCounts, { PEB: 1, RCC: 1 });
  assert.deepEqual(await loader.cityTypeStaticPaths(), ['/listings/city/new-town/peb', '/listings/city/new-town/rcc']);
  const typed = await loader.cityTypeListingsLoader({ params: { city: 'new-town', type: 'peb' } });
  assert.equal(typed.pagination.totalItems, 1);
});

test('sitemap type routes follow the same hybrid and whitespace matching as the API', () => {
  assert.deepEqual(locationTypeCombos([row(1, 'New\u00a0\u00a0Town', 'PEB + RCC')], 'city')
    .map(combo => [combo.location.slug, combo.warehouseType, combo.count]), [['new-town', 'PEB', 1], ['new-town', 'RCC', 1]]);
});
