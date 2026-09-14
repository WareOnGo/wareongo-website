import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: ['src/lib/listingSearch.ts'], bundle: true, write: false, platform: 'node', format: 'cjs',
});
const compiled = { exports: {} };
new Function('module', 'exports', outputFiles[0].text)(compiled, compiled.exports);
const { readListingSearch, writeListingSearch, DEFAULT_FILTERS, listingShouldRevalidate } = compiled.exports;
const read = query => readListingSearch(new URLSearchParams(query));

test('shared filters, page and selected page size round trip without dropping attribution', () => {
  const query = new URLSearchParams('utm_source=mail&utm_content=a&utm_content=b&city=Bangalore&state=Karnataka&fire=no&type=PEB&minSqft=20000&maxSqft=80000&page=3&pageSize=30');
  const state = readListingSearch(query);
  assert.equal(state.page, 3);
  assert.equal(state.pageSize, 30);
  assert.equal(state.filters.fireCompliance, 'no');
  const written = writeListingSearch(query, state);
  assert.deepEqual(readListingSearch(written), state);
  assert.deepEqual(written.getAll('utm_content'), ['a', 'b']);
  assert.equal(written.get('utm_source'), 'mail');
});

test('invalid page numbers and unsupported page sizes never reach API offsets', () => {
  for (const page of ['0', '-1', '3.5', '2junk', 'NaN', 'Infinity', '9007199254740991', '99999999999999999999999']) {
    assert.equal(read(`page=${page}`).page, 1, page);
  }
  for (const pageSize of ['0', '-1', '18', '1000000', '21junk']) {
    assert.equal(read(`pageSize=${pageSize}`).pageSize, 21, pageSize);
  }
  assert.equal(read('page=0003&pageSize=10').page, 3);
});

test('case, all values, duplicates, and ranges normalize to one meaningful query', () => {
  assert.deepEqual(read('city=all&state=ALL&type=all&fire=invalid').filters, DEFAULT_FILTERS);
  const state = read('city=bengaluru&type=peb&fire=YES&minSqft=90000&maxSqft=20000&page=2&page=4');
  assert.equal(state.filters.city, 'Bangalore');
  assert.equal(state.filters.warehouseType, 'PEB');
  assert.equal(state.filters.fireCompliance, 'yes');
  assert.equal(state.filters.minSqft, 20000);
  assert.equal(state.filters.maxSqft, 90000);
  const written = writeListingSearch(new URLSearchParams('page=2&page=4'), state);
  assert.deepEqual(written.getAll('page'), ['2']);
  assert.deepEqual(read('minSqft=-1&maxSqft=999999').filters, DEFAULT_FILTERS);
  assert.deepEqual(read('minSqft=garbage&maxSqft=5junk').filters, DEFAULT_FILTERS);
  assert.equal(read('city=Mumbai').filters.city, 'Mumbai', 'existing free-form location links remain supported');
});

test('reset clears owned filters and page while retaining selected page size and unrelated parameters', () => {
  const next = writeListingSearch(new URLSearchParams('city=Delhi&page=4&pageSize=30&utm_source=mail'), {
    filters: DEFAULT_FILTERS, page: 1, pageSize: 30,
  });
  assert.equal(next.toString(), 'utm_source=mail&pageSize=30');
  assert.equal(writeListingSearch(new URLSearchParams('page=1&pageSize=21'), read('')).toString(), '');
});

const revalidate = (from, to, extra = {}) => listingShouldRevalidate({
  currentUrl: new URL(from, 'https://wareongo.com'), nextUrl: new URL(to, 'https://wareongo.com'),
  currentParams: {}, nextParams: {}, defaultShouldRevalidate: true, ...extra,
});

test('query-only pagination/filter navigation retains loader data and ongoing preloads', () => {
  assert.equal(revalidate('/listings', '/listings?page=2'), false);
  assert.equal(revalidate('/listings?city=Delhi', '/listings?city=Bangalore&pageSize=30'), false);
  assert.equal(revalidate('/listings/city/bengaluru', '/listings/city/bengaluru?page=2&pageSize=18'), false);
  assert.equal(revalidate('/overview/karnataka/bengaluru?page=3&pageSize=6', '/overview/karnataka/bengaluru?page=1'), false);
});

test('path changes, unrelated search changes, actions and explicit revalidation keep router defaults', () => {
  assert.equal(revalidate('/listings/city/bengaluru?page=2', '/listings/city/delhi?page=2'), true);
  assert.equal(revalidate('/listings?utm_source=a', '/listings?page=2&utm_source=b'), true);
  assert.equal(revalidate('/listings/city/bengaluru', '/listings/city/bengaluru?city=Delhi'), true);
  assert.equal(revalidate('/listings?page=2', '/listings?page=2'), true);
  for (const extra of [{ formMethod: 'GET' }, { formMethod: 'POST' }, { actionResult: null }, { actionStatus: 200 }]) {
    assert.equal(revalidate('/listings', '/listings?page=2', extra), true);
  }
  assert.equal(revalidate('/listings', '/listings', { defaultShouldRevalidate: false }), false);
});
