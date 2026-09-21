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


const warehouse = id => ({ id, address: 'Test warehouse', city: 'Bengaluru', state: 'Karnataka',
  totalSpaceSqft: [120000], warehouseType: 'PEB', fireNocAvailable: true,
  clearHeightFt: '30', ratePerSqft: '25', photos: [], compliances: '' });

test('filtered pages make one bounded API read, retaining backend totals and all filters', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(new URL(url));
    assert.equal(options.signal.aborted, false);
    return new Response(JSON.stringify({ data: [warehouse(42)],
      pagination: { currentPage: 3, pageSize: 21, totalItems: 43, totalPages: 3 } }));
  };
  const filters = { city: 'Bengaluru', state: 'Karnataka', locationMatch: 'exact', micromarket: 'nelamangala',
    warehouseType: 'PEB', minSpace: 50000, fireNocAvailable: true };
  const options = listingsQueryOptions(3, 21, filters);
  const result = await options.queryFn({ signal: new AbortController().signal });
  assert.deepEqual(result.warehouses.map(row => row.id), [42]);
  assert.equal(result.pagination.totalItems, 43);
  assert.equal(calls.length, 1, 'no full inventory or membership catalogue reads');
  assert.equal(calls[0].pathname, '/warehouses');
  for (const [key, value] of Object.entries({ ...filters, page: 3, pageSize: 21 })) assert.equal(calls[0].searchParams.get(key), String(value));
  assert.equal(calls[0].searchParams.has('maxSpace'), false, '50,000+ stays open-ended');
  assert.deepEqual(options.queryKey, ['warehouses', filters, 3, 21]);
});

test('zero area bounds and upper bounds above the UI slider survive API serialization', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async url => {
    const search = new URL(url).searchParams;
    assert.equal(search.get('minSpace'), '0');
    assert.equal(search.get('maxSpace'), '250000');
    return new Response(JSON.stringify({ data: [], pagination: { currentPage: 1, pageSize: 21, totalItems: 0, totalPages: 0 } }));
  };
  const result = await listingsQueryOptions(1, 21, { minSpace: 0, maxSpace: 250000 }).queryFn({ signal: new AbortController().signal });
  assert.deepEqual(result.warehouses, []);
  assert.equal(result.pagination.totalPages, 0);
});

test('cancelled or failed filtered requests never fall back to unfiltered inventory', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const options = listingsQueryOptions(1, 21, { city: 'Bengaluru', micromarket: 'removed-market' });
  let reads = 0;
  globalThis.fetch = async () => { reads++; return new Response('{}', { status: 400 }); };
  const controller = new AbortController(); controller.abort();
  await assert.rejects(options.queryFn({ signal: controller.signal }), { name: 'AbortError' });
  assert.equal(reads, 0);
  await assert.rejects(options.queryFn({ signal: new AbortController().signal }), /HTTP error.*400/);
  assert.equal(reads, 1);
});
