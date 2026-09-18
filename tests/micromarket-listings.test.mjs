import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const { outputFiles } = await build({
  stdin: { contents: `export { listingsQueryOptions } from './src/lib/listingsQuery.ts';
    export { warehouseAPI } from './src/services/warehouseAPI.ts';
    export { QueryClient } from '@tanstack/react-query';`, resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'cjs', define: { 'import.meta.env': '{}' },
});
const compiled = { exports: {} };
new Function('module', 'exports', outputFiles[0].text)(compiled, compiled.exports);
const { listingsQueryOptions, warehouseAPI, QueryClient } = compiled.exports;

test('micromarket membership filters the complete city before pagination and shares cached inventory', async t => {
  const client = new QueryClient();
  const originalFetch = globalThis.fetch;
  const originalWarehouses = warehouseAPI.getWarehouses;
  t.after(() => { client.clear(); globalThis.fetch = originalFetch; warehouseAPI.getWarehouses = originalWarehouses; });
  const inventory = Array.from({ length: 620 }, (_, i) => ({
    id: i + 1, address: 'Test warehouse', city: i === 1 ? 'Bengaluru Rural' : 'Bengaluru', state: 'Karnataka',
    totalSpaceSqft: i === 0 ? [5000, 25000] : i === 499 ? [50000] : i === 500 ? [60000] : i === 619 ? [120000] : [10000],
    warehouseType: i % 2 === 0 ? 'PEB' : 'RCC', fireNocAvailable: i % 2 === 0,
    clearHeightFt: '30', ratePerSqft: '25', photos: [], compliances: '',
  }));
  const requests = [];
  warehouseAPI.getWarehouses = async (page, pageSize, filters, signal) => {
    assert.equal(signal.aborted, false);
    requests.push({ page, pageSize, filters });
    assert.equal(filters.micromarket, undefined, 'never send a filter the listings API does not support');
    assert.equal(filters.minSpace, undefined, 'area filtering happens before local pagination');
    assert.equal(filters.maxSpace, undefined);
    // The existing endpoint accepts partial city matches; the locality must
    // still belong to exactly the city the visitor selected.
    const rows = inventory.filter(row => filters.city.split(',').some(city => row.city.includes(city))
      && (!filters.warehouseType || row.warehouseType === filters.warehouseType)
      && (filters.fireNocAvailable === undefined || row.fireNocAvailable === filters.fireNocAvailable));
    return { data: rows.slice((page - 1) * pageSize, page * pageSize),
      pagination: { currentPage: page, pageSize, totalItems: rows.length, totalPages: Math.ceil(rows.length / pageSize) } };
  };
  let membershipReads = 0;
  globalThis.fetch = async url => {
    assert.equal(new URL(url).pathname, '/micromarkets');
    membershipReads++;
    return new Response(JSON.stringify({ data: [{ slug: 'whitefield', listingIds: [1, 2, 500, 501, 620, 9999] }] }));
  };
  const filters = { city: 'Bangalore,Bengaluru', micromarket: 'whitefield' };
  const run = (page, extra = {}) => {
    const options = listingsQueryOptions(page, 2, { ...filters, ...extra }, client);
    return options.queryFn({ signal: new AbortController().signal });
  };
  const first = await run(1);
  assert.deepEqual(first.warehouses.map(row => row.id), [1, 500]);
  assert.deepEqual(first.pagination, { currentPage: 1, pageSize: 2, totalItems: 4, totalPages: 2 });
  const second = await run(2);
  assert.deepEqual(second.warehouses.map(row => row.id), [501, 620], 'include matches beyond the first 500 source rows');
  assert.deepEqual(requests.map(request => request.page), [1, 2]);
  assert.equal(membershipReads, 1);
  const bounded = await run(1, { minSpace: 20000, maxSpace: 30000 });
  assert.deepEqual(bounded.warehouses.map(row => row.id), [1], 'match any available unit in a warehouse');
  const unbounded = await run(1, { minSpace: 50000 });
  assert.equal(unbounded.pagination.totalItems, 3, '50,000+ must include 120,000 sq ft inventory');
  assert.deepEqual((await run(2, { minSpace: 50000 })).warehouses.map(row => row.id), [620]);
  assert.equal(requests.length, 2, 'page and area changes reuse the same city inventory');
  const requirements = await run(1, { warehouseType: 'PEB', fireNocAvailable: true });
  assert.deepEqual(requirements.warehouses.map(row => row.id), [1, 501]);
  assert.equal(requirements.pagination.totalItems, 2);
  assert.equal(requests.at(-1).filters.fireNocAvailable, true);
  const missing = await run(1, { micromarket: 'removed-market' });
  assert.equal(missing.pagination.totalItems, 0);
  assert.deepEqual(missing.warehouses, []);
});

test('micromarket lookup failures and cancelled searches cannot return an unfiltered city', async t => {
  const client = new QueryClient();
  const originalFetch = globalThis.fetch;
  const originalWarehouses = warehouseAPI.getWarehouses;
  t.after(() => { client.clear(); globalThis.fetch = originalFetch; warehouseAPI.getWarehouses = originalWarehouses; });
  warehouseAPI.getWarehouses = async () => ({ data: [], pagination: { totalPages: 1 } });
  globalThis.fetch = async () => new Response('{}', { status: 400 });
  const options = listingsQueryOptions(1, 21, { city: 'Bengaluru', micromarket: 'whitefield' }, client);
  await assert.rejects(options.queryFn({ signal: new AbortController().signal }), /Failed to fetch micromarkets/);
  globalThis.fetch = async () => new Response(JSON.stringify({ data: [] }));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(options.queryFn({ signal: controller.signal }), { name: 'AbortError' });
});

const warehouse = (id, area = 10000) => ({
  id, address: 'Test warehouse', city: 'Bengaluru', state: 'Karnataka', totalSpaceSqft: [area],
  warehouseType: 'PEB', fireNocAvailable: true, clearHeightFt: '30', ratePerSqft: '25', photos: [], compliances: '',
});

test('area-only searches count every source page without reading micromarkets', async t => {
  const client = new QueryClient();
  const originalFetch = globalThis.fetch;
  const originalWarehouses = warehouseAPI.getWarehouses;
  t.after(() => { client.clear(); globalThis.fetch = originalFetch; warehouseAPI.getWarehouses = originalWarehouses; });
  const inventory = Array.from({ length: 620 }, (_, i) => warehouse(i + 1, i >= 490 ? 120000 : 5000));
  let reads = 0;
  globalThis.fetch = async () => { throw new Error('Area filtering must not depend on micromarket availability'); };
  warehouseAPI.getWarehouses = async (page, pageSize, filters) => {
    reads++;
    assert.equal(filters.minSpace, undefined, 'the endpoint paginates area matches incorrectly');
    return { data: inventory.slice((page - 1) * pageSize, page * pageSize),
      pagination: { totalItems: inventory.length, totalPages: Math.ceil(inventory.length / pageSize) } };
  };
  const run = page => listingsQueryOptions(page, 21, { minSpace: 50000 }, client).queryFn({ signal: new AbortController().signal });
  const first = await run(1);
  assert.equal(first.pagination.totalItems, 130);
  assert.equal(first.pagination.totalPages, 7);
  assert.equal(first.warehouses[0].id, 491);
  const last = await run(7);
  assert.deepEqual(last.warehouses.map(row => row.id), [617, 618, 619, 620]);
  assert.equal(reads, 2, 'pagination reuses the complete scope');
});

test('shared inventory survives one cancellation and aborts when its final consumer leaves', async t => {
  const client = new QueryClient();
  const originalWarehouses = warehouseAPI.getWarehouses;
  t.after(() => { client.clear(); warehouseAPI.getWarehouses = originalWarehouses; });
  const sources = [];
  warehouseAPI.getWarehouses = (_page, _pageSize, _filters, signal) => new Promise((resolve, reject) => {
    sources.push({ signal, resolve });
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const run = (controller, city = 'Bengaluru') => listingsQueryOptions(1, 21, { city, minSpace: 1000 }, client)
    .queryFn({ signal: controller.signal });
  const firstController = new AbortController();
  const secondController = new AbortController();
  const first = run(firstController);
  const second = run(secondController);
  assert.equal(sources.length, 1, 'concurrent searches share the source read');
  const cancelled = assert.rejects(first, { name: 'AbortError' });
  firstController.abort();
  await cancelled;
  assert.equal(sources[0].signal.aborted, false, 'the second search still owns this read');
  sources[0].resolve({ data: [warehouse(1)], pagination: { totalItems: 1, totalPages: 1 } });
  assert.equal((await second).warehouses[0].id, 1);
  const lastController = new AbortController();
  const last = run(lastController, 'Pune');
  const finalCancellation = assert.rejects(last, { name: 'AbortError' });
  lastController.abort();
  await finalCancellation;
  assert.equal(sources[1].signal.aborted, true, 'abandoned scopes must not continue downloading');
});

test('an incomplete inventory read fails instead of presenting partial totals', async t => {
  const client = new QueryClient();
  const originalWarehouses = warehouseAPI.getWarehouses;
  t.after(() => { client.clear(); warehouseAPI.getWarehouses = originalWarehouses; });
  warehouseAPI.getWarehouses = async page => ({ data: page === 1 ? [warehouse(1)] : [],
    pagination: { totalItems: 1200, totalPages: 3 } });
  const options = listingsQueryOptions(1, 21, { minSpace: 1000 }, client);
  await assert.rejects(options.queryFn({ signal: new AbortController().signal }), /Inventory ended before its final page/);
});
