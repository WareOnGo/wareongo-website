import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createStaticRouting } from '../scripts/lib/static-routing.mjs';

const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
const files = new Set(['/__catalogue/listings/1', '/__catalogue/listings/2', '/__catalogue/listings/city/bengaluru/1',
  '/__catalogue/listings/city/bengaluru/2', '/__catalogue/overview/karnataka/1', '/__catalogue/overview/karnataka/2', '/about-us']);
const resolve = createStaticRouting(config, async file => files.has(file) ? file : null);
const get = url => resolve(new URL(url, 'https://wareongo.com'));

test('Vercel-compiled rules select static pagination at root and nested paths, with tracking parameters preserved', async () => {
  for (const path of ['/listings', '/listings/city/bengaluru', '/overview/karnataka']) {
    for (const query of ['page=2', `page=2&pageSize=${path.startsWith('/overview') ? 6 : 21}&utm_source=share`]) {
      const result = await get(`${path}?${query}`);
      assert.equal(result.file, `/__catalogue${path}/2`);
      assert.equal(result.headers['x-robots-tag'], undefined, 'an internal rewrite cannot noindex the public URL');
    }
    assert.equal((await get(path)).file, `/__catalogue${path}/1`);
    assert.equal((await get(`${path}?page=999`)).file, `/__catalogue${path}/1`, 'missing static pages recover through the normal client flow');
  }
});

test('filter keys, non-default sizes, malformed pages and unknown paths have deliberate fallbacks', async () => {
  for (const query of ['city=Bengaluru', 'state=Karnataka', 'micromarket=a', 'type=PEB,RCC', 'fire=yes', 'area=0-10000', 'minSqft=1', 'maxSqft=2', 'pageSize=10', 'pageSize=30', 'pageSize=50']) {
    const result = await get(`/listings?page=2&${query}`);
    assert.equal(result.file, '/__catalogue/listings/1');
    assert.equal(result.headers['x-robots-tag'], 'noindex, follow', query);
  }
  for (const page of ['-1', '0', 'hello', '1e2', '2.1']) {
    assert.equal((await get(`/listings?page=${page}`)).file, '/__catalogue/listings/1');
  }
  assert.equal((await get('/listings/city/missing')).status, 404);
  assert.equal((await get('/__catalogue/listings/2')).headers['x-robots-tag'], 'noindex, follow');
  assert.equal((await get('/about-us')).file, '/about-us');
});

test('the harness enforces filesystem precedence so a misplaced public HTML cannot hide broken pagination', async () => {
  const withPublicFile = createStaticRouting(config, async file => file === '/listings' || files.has(file) ? file : null);
  assert.equal((await withPublicFile(new URL('https://wareongo.com/listings?page=2'))).file, '/listings');
});

test('clean URL redirects retain pagination and attribution before the static rewrite', async () => {
  const result = await get('/listings/?page=2&utm_source=shared');
  assert.equal(result.status, 308);
  assert.equal(result.headers.location, '/listings?page=2&utm_source=shared');
});
