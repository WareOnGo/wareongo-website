import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { build } from 'esbuild';
import { highestWarehouseId } from '../scripts/lib/warehouse-build.mjs';
import { fetchAllWarehouses } from '../scripts/lib/locations.mjs';
import { generateWarehouseRouteMap } from '../scripts/generate-warehouse-route-map.mjs';

const headers = { 'X-Wareongo-Cache': 'bypass', 'X-Wareongo-Listing-Filters': '3' };
const row = id => ({ id, city: 'Bengaluru', state: 'Karnataka', address: `Warehouse ${id}`,
  totalSpaceSqft: [10000], warehouseType: 'PEB', photos: [] });

test('the generated ceiling uses the greatest valid ID, and refuses an empty or malformed inventory', () => {
  assert.equal(highestWarehouseId([{ id: 12 }, { id: 42 }, { id: 3 }]), 42);
  assert.throws(() => highestWarehouseId([]), /empty/);
  for (const id of [undefined, '42', 0, -1, 1.5, 2147483648, NaN]) {
    assert.throws(() => highestWarehouseId([{ id }]), /Invalid warehouse ID/);
  }
});

test('a build starts uncapped, then pins later pages so inserts cannot shift its inventory', async t => {
  const rows = Array.from({ length: 503 }, (_, index) => ({ id: 503 - index }));
  const requests = [];
  t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(input);
    requests.push(url);
    const live = requests.length === 1 ? rows : [{ id: 505 }, { id: 504 }, ...rows];
    const eligible = live.filter(w => !url.searchParams.has('maxId') || w.id <= Number(url.searchParams.get('maxId')));
    const page = Number(url.searchParams.get('page'));
    return Response.json({ data: eligible.slice((page - 1) * 500, page * 500),
      pagination: { totalPages: Math.ceil(eligible.length / 500) } }, { headers });
  });
  assert.deepEqual(await fetchAllWarehouses(), rows);
  assert.equal(requests[0].searchParams.has('maxId'), false);
  assert.equal(requests[1].searchParams.get('maxId'), '503');
  requests.length = 0;
  assert.deepEqual(await fetchAllWarehouses(500), rows.filter(w => w.id <= 500));
  assert.equal(requests[0].searchParams.get('maxId'), '500', 'post-build generators reuse the cutoff from page one');
});

async function client(maxId, { dev = false, ssr = false, mode = 'production' } = {}) {
  const bundled = await build({
    stdin: { contents: `export { listingsQueryOptions } from './src/lib/listingsQuery.ts';
      export { warehouseAPI } from './src/services/warehouseAPI.ts';`, resolveDir: process.cwd() },
    bundle: true, write: false, platform: 'node', format: 'cjs', drop: ['console'],
    define: { __DEV_SERVER__: String(dev), 'import.meta.env': JSON.stringify({ SSR: ssr, MODE: mode, VITE_API_BASE_URL: 'https://fixture.invalid' }) },
    plugins: [{ name: 'build-fixture', setup(builder) {
      builder.onLoad({ filter: /warehouse-build\.generated\.json$/ }, () => ({ contents: JSON.stringify({ maxId }), loader: 'json' }));
    } }],
  });
  const module = { exports: {} };
  new Function('module', 'exports', bundled.outputFiles[0].text)(module, module.exports);
  return module.exports;
}

for (const [name, options] of [['browser', {}], ['SSR', { ssr: true }], ['development build', { mode: 'development' }]]) {
  test(`${name}: every list request carries the build cutoff, filters, paging and cancellation`, async t => {
    const { warehouseAPI, listingsQueryOptions } = await client(42, options);
    const signal = new AbortController().signal;
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (input, init) => {
      const url = new URL(input);
      requests.push(url);
      assert.equal(url.searchParams.get('maxId'), '42');
      assert.equal(init.signal, signal);
      return Response.json({ data: [row(42)], pagination: { currentPage: 2, pageSize: 21, totalItems: 22, totalPages: 2 } }, { headers });
    });
    const filters = { city: 'Bengaluru', warehouseType: 'PEB,RCC', spaceRanges: '0-10000,50000-', fireNocAvailable: true };
    const query = listingsQueryOptions(2, 21, filters);
    const result = await query.queryFn({ signal });
    assert.deepEqual(result.warehouses.map(w => w.id), [42]);
    assert.equal(result.pagination.totalItems, 22);
    for (const [key, value] of Object.entries({ ...filters, page: 2, pageSize: 21 })) {
      assert.equal(requests[0].searchParams.get(key), String(value));
    }
    assert.deepEqual(query.queryKey, ['warehouses', { ...filters, maxId: 42 }, 2, 21]);
    await warehouseAPI.getWarehouses(1, 500, undefined, signal);
    assert.equal(requests.length, 2, 'one request per call; no browser inventory scans');
  });
}

test('each build has its own ceiling and query cache; Vite dev remains uncapped', async t => {
  const old = await client(42);
  const next = await client(50);
  const dev = await client(42, { dev: true });
  const requests = [];
  t.mock.method(globalThis, 'fetch', async input => {
    requests.push(new URL(input));
    return Response.json({ data: [], pagination: { currentPage: 1, pageSize: 21, totalItems: 0, totalPages: 0 } });
  });
  for (const api of [old, next, old, dev]) await api.warehouseAPI.getWarehouses();
  assert.deepEqual(requests.map(url => url.searchParams.get('maxId')), ['42', '50', '42', null]);
  assert.notDeepEqual(old.listingsQueryOptions(1, 21, {}).queryKey, next.listingsQueryOptions(1, 21, {}).queryKey);
});

test('failed or cancelled capped requests never retry without the cutoff', async t => {
  const { listingsQueryOptions } = await client(42);
  const requests = [];
  t.mock.method(globalThis, 'fetch', async input => { requests.push(new URL(input)); return new Response('', { status: 400 }); });
  const query = listingsQueryOptions(1, 21, {});
  await assert.rejects(query.queryFn({ signal: new AbortController().signal }), /400/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(query.queryFn({ signal: controller.signal }), /abort/i);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].searchParams.get('maxId'), '42');
});

test('publication requires a rendered page and matching payload at the cutoff; mismatches fail', async t => {
  const dist = await fs.mkdtemp(path.join(os.tmpdir(), 'warehouse-cutoff-'));
  t.after(() => fs.rm(dist, { recursive: true, force: true }));
  const route = '/warehouse/warehouse-42';
  await fs.mkdir(path.join(dist, 'static-loader-data'), { recursive: true });
  await fs.mkdir(path.join(dist, route), { recursive: true });
  await fs.writeFile(path.join(dist, 'static-loader-data-manifest-stable.json'), JSON.stringify({ [route]: 'static-loader-data/42.json' }));
  await fs.writeFile(path.join(dist, route, 'index.html'), '<h1>Warehouse 42</h1>');
  await fs.writeFile(path.join(dist, 'static-loader-data/42.json'), JSON.stringify({ detail: { id: 42 } }));
  assert.equal((await generateWarehouseRouteMap(dist, 42))[42], route);
  for (const maxId of [41, 43]) await assert.rejects(generateWarehouseRouteMap(dist, maxId), /cutoff/);
  await fs.writeFile(path.join(dist, 'static-loader-data/42.json'), JSON.stringify({ detail: { id: 43 } }));
  await assert.rejects(generateWarehouseRouteMap(dist, 42), /matching published loader data/);
});
