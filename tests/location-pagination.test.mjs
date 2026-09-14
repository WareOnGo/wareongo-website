import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const directory = fileURLToPath(new URL('..', import.meta.url));
const { outputFiles } = await build({
  absWorkingDir: directory,
  stdin: {
    contents: `
      import { renderToString } from 'react-dom/server';
      import { StaticRouter } from 'react-router-dom/server';
      import { usePagedListings } from './src/hooks/usePagedListings';
      export { readLocationPagination, createLocationPageSearch } from './src/hooks/usePagedListings';
      const inventory = Array.from({ length: 47 }, (_, i) => i + 1);
      function Fixture() {
        const { shown, currentPage, perPage, hrefForPage } = usePagedListings(inventory);
        return <div data-page={currentPage} data-size={perPage}>
          <span>{shown.join(',')}</span><a href={hrefForPage(2)}>Next</a>
        </div>;
      }
      export const renderPagination = location => renderToString(
        <StaticRouter location={location}><Fixture /></StaticRouter>
      );
    `,
    resolveDir: directory,
    loader: 'tsx',
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(
  createRequire(import.meta.url), compiled, compiled.exports,
);
const { readLocationPagination, createLocationPageSearch, renderPagination } = compiled.exports;
const read = (query, count = 47, size = 18) => readLocationPagination(new URLSearchParams(query), count, size);

test('bare and page-only links use the local viewport without changing six-row page sizes', () => {
  for (const size of [6, 12, 18]) {
    assert.deepEqual(read('', 47, size), { currentPage: 1, totalPages: Math.ceil(47 / size), start: 0 });
    assert.equal(read('page=2', 47, size).start, size);
  }
});

test('shared links retain the source first listing on every receiving viewport', () => {
  for (const sourceSize of [6, 12, 18]) {
    for (const receivingSize of [6, 12, 18]) {
      for (const page of [2, 3, 4]) {
        const firstListing = (page - 1) * sourceSize;
        const result = read(`page=${page}&pageSize=${sourceSize}`, 100, receivingSize);
        assert.ok(result.start <= firstListing);
        assert.ok(result.start + receivingSize > firstListing);
      }
    }
  }
  assert.deepEqual(read('page=3&pageSize=18', 47, 6), { currentPage: 7, totalPages: 8, start: 36 });
  assert.deepEqual(read('page=3&pageSize=6', 47, 18), { currentPage: 1, totalPages: 3, start: 0 });
});

test('out-of-range pages clamp to the final populated page, including safe-integer extremes', () => {
  for (const size of [6, 12, 18]) {
    for (const requested of ['999', String(Number.MAX_SAFE_INTEGER)]) {
      const result = read(`page=${requested}&pageSize=18`, 47, size);
      assert.equal(result.currentPage, Math.ceil(47 / size));
      assert.ok(result.start < 47);
    }
    assert.deepEqual(read('page=999', 0, size), { currentPage: 1, totalPages: 1, start: 0 });
  }
});

test('malformed page numbers and unsupported source sizes recover predictably', () => {
  for (const page of ['0', '-1', '2.5', '1e2', 'hello', 'Infinity', '9007199254740992']) {
    assert.equal(read(`page=${page}`).currentPage, 1, page);
  }
  for (const size of ['0', '-6', '21', '6.5', 'hello', '9007199254740992']) {
    assert.equal(read(`page=2&pageSize=${size}`, 47, 12).start, 12, size);
  }
});

test('page links preserve unrelated parameters, remove defaults and collapse duplicate page parameters', () => {
  const source = new URLSearchParams('utm_source=partner&tag=a&tag=b&page=3&page=4&pageSize=6');
  const second = createLocationPageSearch(source, 2, 18);
  assert.equal(second.toString(), 'utm_source=partner&tag=a&tag=b&page=2&pageSize=18');
  assert.equal(createLocationPageSearch(second, 1, 6).toString(), 'utm_source=partner&tag=a&tag=b');
  assert.equal(source.get('page'), '3', 'link generation must not mutate the current URL');
});

test('translated and clamped links canonicalize once and remain stable on reread', () => {
  for (const query of ['page=3&pageSize=18', 'page=999&pageSize=6', 'page=-1', 'page=2']) {
    for (const size of [6, 12, 18]) {
      const before = read(query, 47, size);
      const canonical = createLocationPageSearch(new URLSearchParams(query), before.currentPage, size);
      assert.deepEqual(read(canonical.toString(), 47, size), before);
      assert.equal(createLocationPageSearch(canonical, before.currentPage, size).toString(), canonical.toString());
    }
  }
});

test('server rendering retains the default desktop inventory before URL state hydrates', () => {
  const plain = renderPagination('/listings/city/bengaluru');
  const shared = renderPagination('/listings/city/bengaluru?page=7&pageSize=6&utm_source=partner#listings');
  assert.equal(shared, plain);
  assert.match(shared, /data-page="1" data-size="18"/);
  assert.match(shared, /1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18/);
  assert.match(shared, /href="\/listings\/city\/bengaluru\?page=2&amp;pageSize=18"/);
});
