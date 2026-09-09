import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchMicromarketPages } from '../scripts/lib/api.mjs';

test('an explicitly empty published collection is allowed', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: [] }));
  assert.deepEqual(await fetchMicromarketPages(), []);
});

test('published content reaches the build without losing fields', async t => {
  const page = { citySlug: 'bengaluru', slug: 'nelamangala', heroProse: 'Market overview', faqs: [{ q: 'Access?', a: 'Via the highway.' }] };
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: [page] }));
  assert.deepEqual(await fetchMicromarketPages(), [page]);
});

test('backend outages stop the build instead of removing published overview URLs', async t => {
  const fetch = t.mock.method(globalThis, 'fetch');
  for (const status of [404, 500, 503]) {
    fetch.mock.mockImplementation(async () => new Response('{}', { status }));
    await assert.rejects(fetchMicromarketPages(), /Failed to fetch micromarket pages/);
  }
  fetch.mock.mockImplementation(async () => { throw new TypeError('network unavailable'); });
  await assert.rejects(fetchMicromarketPages(), /network unavailable/);
});

test('malformed responses cannot be mistaken for an empty published collection', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'unavailable' }));
  await assert.rejects(fetchMicromarketPages(), /unexpected shape/);
});
