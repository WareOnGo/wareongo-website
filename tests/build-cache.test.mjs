import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchInventory } from '../src/lib/fetchInventory.mjs';

test('build reads explicitly bypass both caches and preserve caller headers/cancellation', async t => {
  const init = { headers: { Accept: 'application/json' }, signal: new AbortController().signal };
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ data: [] }, { headers: { 'X-Wareongo-Cache': 'bypass' } }));
  await fetchInventory('https://backend.example/warehouses', init, true);
  const sent = fetch.mock.calls[0].arguments[1];
  assert.equal(sent.cache, 'no-store');
  assert.equal(sent.headers.get('Cache-Control'), 'no-cache, no-store');
  assert.equal(sent.headers.get('Accept'), 'application/json');
  assert.equal(sent.signal, init.signal);
  assert.deepEqual(init.headers, { Accept: 'application/json' });
});

test('browser reads retain ordinary caching', async t => {
  const init = { signal: new AbortController().signal };
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ data: [] }));
  await fetchInventory('https://backend.example/warehouses', init);
  assert.equal(fetch.mock.calls[0].arguments[1], init);
});

test('an older backend cannot silently ignore the build cache bypass', async t => {
  const stale = Response.json({ data: [{ id: 2027 }] });
  t.mock.method(globalThis, 'fetch', async () => stale);
  await assert.rejects(fetchInventory('https://backend.example/warehouses', {}, true), /Deploy the backend cache-bypass change/);
  assert.equal(stale.bodyUsed, true);
});

test('fresh reads retain bounded retries and the bypass on every attempt', async t => {
  const timer = setTimeout;
  t.mock.method(globalThis, 'setTimeout', callback => timer(callback, 0));
  let attempts = 0;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    attempts++;
    assert.equal(init.headers.get('Cache-Control'), 'no-cache, no-store');
    return attempts < 3 ? new Response('', { status: 503 })
      : Response.json({ data: [] }, { headers: { 'X-Wareongo-Cache': 'bypass' } });
  });
  assert.equal((await fetchInventory('https://backend.example/locations', {}, true)).status, 200);
  assert.equal(attempts, 3);
});

test('permanent HTTP errors remain available to the existing build guards', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  assert.equal((await fetchInventory('https://backend.example/micromarkets', {}, true)).status, 404);
});
