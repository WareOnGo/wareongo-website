import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchRead } from '../src/lib/fetchRead.mjs';

const url = 'https://backend.example/warehouses/299';
function fastBackoff(t) {
  const delays = [];
  const setTimer = globalThis.setTimeout;
  t.mock.method(Math, 'random', () => 0);
  t.mock.method(globalThis, 'setTimeout', (fn, ms) => { delays.push(ms); return setTimer(fn, 0); });
  return delays;
}

test('a transient detail failure recovers with increasing backoff and releases failed bodies', async t => {
  const delays = fastBackoff(t);
  const failures = [new Response('busy', { status: 500 }), new Response('busy', { status: 503 })];
  const success = Response.json({ id: 299 });
  const responses = [...failures, success];
  const fetch = t.mock.method(globalThis, 'fetch', async () => responses.shift());
  assert.equal(await fetchRead(url), success);
  assert.equal(fetch.mock.callCount(), 3);
  assert.deepEqual(delays, [500, 1000]);
  assert.ok(failures.every(response => response.bodyUsed));
});

test('persistent pool exhaustion returns the final failure after exactly three attempts', async t => {
  fastBackoff(t);
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('pool full', { status: 500 }));
  const response = await fetchRead(url);
  assert.equal(response.status, 500);
  assert.equal(await response.text(), 'pool full');
  assert.equal(fetch.mock.callCount(), 3);
});

test('missing warehouses and other permanent failures are never retried', async t => {
  const fetch = t.mock.method(globalThis, 'fetch');
  for (const status of [400, 401, 403, 404, 422, 501]) {
    fetch.mock.mockImplementation(async () => new Response('', { status }));
    const before = fetch.mock.callCount();
    assert.equal((await fetchRead(url)).status, status);
    assert.equal(fetch.mock.callCount() - before, 1);
  }
});

test('network failures retry but preserve the final exception', async t => {
  const delays = fastBackoff(t);
  const error = new TypeError('fetch failed');
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw error; });
  await assert.rejects(fetchRead(url), value => value === error);
  assert.equal(fetch.mock.callCount(), 3);
  assert.deepEqual(delays, [500, 1000]);
});

test('non-network exceptions and aborted fetches are not retried', async t => {
  const fetch = t.mock.method(globalThis, 'fetch');
  for (const error of [new Error('unexpected'), new DOMException('Aborted', 'AbortError')]) {
    fetch.mock.mockImplementation(async () => { throw error; });
    const before = fetch.mock.callCount();
    await assert.rejects(fetchRead(url), value => value === error);
    assert.equal(fetch.mock.callCount() - before, 1);
  }
});

test('aborting during backoff stops pagination retries immediately', async t => {
  const controller = new AbortController();
  const setTimer = globalThis.setTimeout;
  let timer;
  t.mock.method(globalThis, 'setTimeout', (fn, ms) => {
    timer = setTimer(fn, ms);
    queueMicrotask(() => controller.abort());
    return timer;
  });
  t.after(() => clearTimeout(timer));
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
  await assert.rejects(fetchRead(url, { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(fetch.mock.callCount(), 1);
});

test('an already cancelled request never reaches the network', async t => {
  const controller = new AbortController(); controller.abort();
  const fetch = t.mock.method(globalThis, 'fetch');
  await assert.rejects(fetchRead(url, { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(fetch.mock.callCount(), 0);
});

test('Retry-After is honoured within the bounded delay', async t => {
  const delays = fastBackoff(t);
  const responses = [new Response('', { status: 429, headers: { 'Retry-After': '2' } }), new Response('ok')];
  t.mock.method(globalThis, 'fetch', async () => responses.shift());
  assert.equal((await fetchRead(url)).status, 200);
  assert.deepEqual(delays, [2000]);
});

test('a long Retry-After returns the response without retrying early', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503, headers: { 'Retry-After': '60' } }));
  assert.equal((await fetchRead(url)).status, 503);
  assert.equal(fetch.mock.callCount(), 1);
});

test('mutation requests are never retried', async t => {
  const init = { method: 'POST', body: 'enquiry' };
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 500 }));
  assert.equal((await fetchRead(url, init)).status, 500);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(fetch.mock.calls[0].arguments[1], init);
});
