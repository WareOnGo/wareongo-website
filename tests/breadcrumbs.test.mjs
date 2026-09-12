import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const source = await readFile(new URL('../src/lib/listingBreadcrumbs.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { createListingBreadcrumbs } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

function fixture() {
  return {
    locations: {
      cities: [{ name: 'Bengaluru', slug: 'bengaluru', stateSlug: 'karnataka', listingIds: [1, 2] }],
      states: [{ name: 'Karnataka', slug: 'karnataka', stateSlug: null, listingIds: [1, 2] }],
    },
    markets: [
      { name: 'Small Belt', slug: 'small-belt', citySlug: 'bengaluru', stateSlug: 'karnataka', listingIds: [1], listings: 5, hasPage: true },
      { name: 'Nelamangala', slug: 'nelamangala', citySlug: 'bengaluru', stateSlug: 'karnataka', listingIds: [1], listings: 20, hasPage: true },
    ],
    routes: {
      cities: [{ canonical: 'Bengaluru', slug: 'bengaluru', count: 30 }],
      states: [{ canonical: 'Karnataka', slug: 'karnataka', count: 40 }],
    },
  };
}
const resolve = f => createListingBreadcrumbs(f.locations, f.markets, f.routes);
const labels = items => items.map(i => i.label);
const paths = items => items.map(i => i.path);

test('warehouse uses the most populous matching micromarket, independently of tag/API order', () => {
  const f = fixture();
  assert.deepEqual(paths(resolve(f).warehouse(1)), [
    '/listings/state/karnataka', '/listings/city/bengaluru', '/listings/city/bengaluru/nelamangala',
  ]);
  f.markets.reverse();
  assert.deepEqual(labels(resolve(f).warehouse(1)), ['Karnataka', 'Bengaluru', 'Nelamangala']);
});

test('equal micromarket counts have a stable tie break', () => {
  const f = fixture(); f.markets[0].listings = 20;
  const first = resolve(f).warehouse(1);
  f.markets.reverse();
  assert.deepEqual(resolve(f).warehouse(1), first);
});

test('unrelated, unbuilt, reserved and invalid micromarkets cannot win', () => {
  for (const change of [{ listingIds: [999] }, { hasPage: false }, { slug: 'peb' }, { slug: 'rcc' }, { slug: '../missing' }, { citySlug: 'missing' }, { stateSlug: 'other-state' }]) {
    const f = fixture(); Object.assign(f.markets[1], change);
    assert.equal(labels(resolve(f).warehouse(1)).at(-1), 'Small Belt', JSON.stringify(change));
  }
});

test('missing micromarket and city routes shorten the trail; missing geography falls back to the page’s Listings link', () => {
  const f = fixture(); f.markets = [];
  assert.deepEqual(labels(resolve(f).warehouse(1)), ['Karnataka', 'Bengaluru']);
  f.routes.cities = [];
  assert.deepEqual(labels(resolve(f).warehouse(1)), ['Karnataka']);
  f.routes.states = [];
  assert.deepEqual(resolve(f).warehouse(1), []);
  assert.deepEqual(resolve(f).warehouse(999), []);
});

test('a listing without micromarket membership does not inherit a popular nearby belt', () => {
  assert.deepEqual(labels(resolve(fixture()).warehouse(2)), ['Karnataka', 'Bengaluru']);
});

test('malformed auxiliary membership rows cannot break warehouse rendering or hide valid siblings', () => {
  const f = fixture();
  f.locations.cities.push(null, { slug: 'broken', listingIds: null });
  f.locations.states.push({ slug: 'karnataka', listingIds: null });
  f.markets.push({ ...f.markets[1], listingIds: null }, { ...f.markets[1], name: null }, null);
  assert.deepEqual(labels(resolve(f).warehouse(1)), ['Karnataka', 'Bengaluru', 'Nelamangala']);
});

test('a state outlier never receives another state’s city or micromarket hierarchy', () => {
  const f = fixture();
  f.locations.states = [{ name: 'Tamil Nadu', slug: 'tamil-nadu', stateSlug: null, listingIds: [1] }];
  f.routes.states.push({ canonical: 'Tamil Nadu', slug: 'tamil-nadu', count: 5 });
  assert.deepEqual(labels(resolve(f).warehouse(1)), ['Tamil Nadu']);
});

test('city and micromarket grids use verified state and city ancestors', () => {
  const resolver = resolve(fixture());
  assert.deepEqual(labels(resolver.city('bengaluru')), ['Karnataka']);
  assert.deepEqual(labels(resolver.micromarket('bengaluru', 'nelamangala', 'Nelamangala')), ['Karnataka', 'Bengaluru']);
  assert.deepEqual(resolver.city('missing'), []);
});

test('a built city remains linkable without an editorial overview', () => {
  const f = fixture(); f.routes.cities[0].count = 1;
  assert.equal(paths(resolve(f).warehouse(2)).at(-1), '/listings/city/bengaluru');
});

test('state and city with the same name remain distinct valid routes', () => {
  const f = fixture(); f.markets = [];
  for (const [kind, collection] of Object.entries(f.locations)) {
    Object.assign(collection[0], { name: 'Delhi', slug: 'delhi', stateSlug: kind === 'cities' ? 'delhi' : null });
    Object.assign(f.routes[kind][0], { canonical: 'Delhi', slug: 'delhi' });
  }
  assert.deepEqual(paths(resolve(f).warehouse(1)), ['/listings/state/delhi', '/listings/city/delhi']);
});

const bundled = await build({
  entryPoints: [fileURLToPath(new URL('../src/loaders/warehouseLoader.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'esm', drop: ['console'],
  define: { '__DEV_SERVER__': 'false', 'import.meta.env': JSON.stringify({ SSR: false, VITE_API_BASE_URL: 'https://fixture.invalid' }) },
});
let importNumber = 0;
const freshLoader = () => import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text + `\n// fixture ${importNumber++}`).toString('base64'));

test('real warehouse loader resolves all existing city aliases and multiple tags through canonical membership', async t => {
  const aliases = [
    ['  BANGALORE  ', 'Bengaluru', 'bengaluru'], ['Bombay', 'Mumbai', 'mumbai'],
    ['Calcutta', 'Kolkata', 'kolkata'], ['Madras', 'Chennai', 'chennai'], ['Gurgaon', 'Gurugram', 'gurugram'],
  ];
  const rows = aliases.map(([city], index) => ({ id: index + 1, city, state: 'Test State', address: 'An unrelated address',
    totalSpaceSqft: [1000], photos: [], micromarket: ['Small Belt', 'LARGE/BELT'], warehouseType: 'PEB' }));
  const locations = {
    cities: aliases.map(([, name, slug], index) => ({ name, slug, stateSlug: 'test-state', listingIds: [index + 1] })),
    states: [{ name: 'Test State', slug: 'test-state', stateSlug: null, listingIds: rows.map(r => r.id) }],
  };
  const markets = aliases.flatMap(([, , citySlug], index) => [
    { name: 'Small Belt', slug: 'small-belt', listings: 5 },
    { name: 'Large/Belt', slug: 'large-belt', listings: 50 },
  ].map(m => ({ ...m, citySlug, stateSlug: 'test-state', hasPage: true, listingIds: [index + 1] })));
  t.mock.method(globalThis, 'fetch', async input => {
    const path = new URL(input).pathname;
    if (path === '/warehouses') return Response.json({ data: rows, pagination: { totalPages: 1 } });
    if (path === '/locations') return Response.json({ data: locations });
    if (path === '/micromarkets') return Response.json({ data: markets });
    if (/^\/warehouses\/\d+$/.test(path)) return Response.json(rows.find(r => r.id === Number(path.split('/').at(-1))));
    return new Response('{}', { status: 404 });
  });
  const { warehouseLoader } = await freshLoader();
  for (const [index, [, canonical, slug]] of aliases.entries()) {
    const result = await warehouseLoader({ params: { slug: `warehouse-${index + 1}` } });
    assert.deepEqual(labels(result.breadcrumbAncestors), ['Test State', canonical, 'Large/Belt']);
    assert.equal(result.breadcrumbAncestors[1].path, `/listings/city/${slug}`);
  }
});

test('auxiliary geography outages leave a valid warehouse and its general Listings fallback available', async t => {
  const row = { id: 1, city: 'Bangalore', state: 'Karnataka', totalSpaceSqft: [1000], photos: [] };
  t.mock.method(globalThis, 'fetch', async input => {
    const path = new URL(input).pathname;
    if (path === '/warehouses') return Response.json({ data: [row], pagination: { totalPages: 1 } });
    if (path === '/warehouses/1') return Response.json(row);
    return new Response('{}', { status: 404 });
  });
  const { warehouseLoader } = await freshLoader();
  const result = await warehouseLoader({ params: { slug: 'warehouse-1' } });
  assert.equal(result.id, 1);
  assert.deepEqual(result.breadcrumbAncestors, []);
});
