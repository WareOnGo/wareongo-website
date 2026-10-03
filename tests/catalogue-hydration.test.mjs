import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const { outputFiles } = await build({ entryPoints: ['src/lib/catalogueHydration.ts'], bundle: true, write: false, platform: 'node', format: 'cjs' });
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);
const { restoreCatalogueHydration } = compiled.exports;
const doc = (src = '/static-loader-data/catalogue/abc.json') => new JSDOM(`<div id="root">Server-rendered cards</div><script type="application/json" id="catalogue-hydration">${JSON.stringify({ src, routeId: '0-0-22', seedSearch: 'page=2' })}</script>`).window.document;

test('a shared overview snapshot restores its complete inventory and only the document page seed', async () => {
  const original = { '0-0-22': { warehouses: Array.from({ length: 47 }, (_, id) => ({ id })), stats: { count: 47 } } };
  const requests = [];
  const result = await restoreCatalogueHydration(doc(), async url => { requests.push(url); return Response.json(original); });
  assert.deepEqual(requests, ['/static-loader-data/catalogue/abc.json']);
  assert.deepEqual(result.loaderData['0-0-22'], { ...original['0-0-22'], seedSearch: 'page=2' });
  assert.equal(original['0-0-22'].seedSearch, undefined);
  assert.equal(result.errors, null);
});

test('ordinary pages need no catalogue request', async () => {
  const document = new JSDOM('<div id="root">Page</div>').window.document;
  assert.equal(await restoreCatalogueHydration(document, () => { throw new Error('Unexpected fetch'); }), undefined);
});

test('failed or invalid shared data never replaces the server-rendered cards', async () => {
  for (const response of [new Response('Unavailable', { status: 503 }), Response.json({}), Response.json({ '0-0-22': { warehouses: [] } })]) {
    const document = doc();
    await assert.rejects(restoreCatalogueHydration(document, async () => response));
    assert.equal(document.getElementById('root').textContent, 'Server-rendered cards');
  }
  await assert.rejects(restoreCatalogueHydration(doc('https://foreign.test/data'), () => { throw new Error('Must not fetch'); }), /reference/i);
});

test('a stalled snapshot times out while keeping the static page available for retry', async () => {
  const document = doc();
  const stalled = (_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(options.signal.reason));
  });
  await assert.rejects(restoreCatalogueHydration(document, stalled, 10), /abort|timeout/i);
  assert.equal(document.getElementById('root').textContent, 'Server-rendered cards');
});
