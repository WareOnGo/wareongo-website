import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createListingCoverPreparer } from '../src/lib/listingCover.server.mjs';
import { publishListingCovers } from '../scripts/publish-listing-covers.mjs';

const source = 'https://pub-0123456789abcdef.r2.dev/webp/warehouse.webp';
const pixels = Buffer.alloc(1280 * 652 * 3);
for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 31 + Math.floor(i / 1280) * 17) % 256;
const original = await sharp(pixels, { raw: { width: 1280, height: 652, channels: 3 } }).webp({ quality: 85 }).toBuffer();
const temp = async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wog-cover-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
};

test('a cover is smaller, preserves framing, shares in-flight work and survives a warm build without downloads', async t => {
  const cacheDir = await temp(t);
  let downloads = 0;
  const prepare = createListingCoverPreparer({ cacheDir, fetchImage: async () => {
    downloads++; return new Response(original);
  } });
  const [one, two] = await Promise.all([prepare(source), prepare(source)]);
  assert.deepEqual(one, two);
  assert.equal(downloads, 1);
  assert.equal(one.source, source);
  const file = path.join(cacheDir, path.basename(one.src));
  const metadata = await sharp(file).metadata();
  assert.equal(metadata.width, 768);
  assert.ok(Math.abs(metadata.width / metadata.height - 1280 / 652) < 0.01);
  assert.ok((await fs.stat(file)).size < original.length);
  const warm = createListingCoverPreparer({ cacheDir, fetchImage: () => { throw new Error('unexpected network'); } });
  assert.deepEqual(await warm(source), one);
  assert.notEqual((await prepare(source.replace('warehouse.webp', 'edited.webp'))).src, one.src);
});

test('untrusted URLs, redirects, failures, oversized bodies and invalid image bytes leave the remote photo usable', async t => {
  const cacheDir = await temp(t);
  let downloads = 0;
  const untrusted = createListingCoverPreparer({ cacheDir, fetchImage: () => { downloads++; throw new Error('must not fetch'); } });
  for (const url of [undefined, 'bad', 'http://localhost/a.webp', 'https://pub-abc.r2.dev.attacker.test/a.webp', 'https://pub-abc.r2.dev/video.mp4']) {
    assert.equal(await untrusted(url), undefined);
  }
  assert.equal(downloads, 0);
  for (const response of [new Response(null, { status: 404 }), new Response(null, { status: 302 }),
    new Response('no image'), new Response('oversized', { headers: { 'Content-Length': String(9 * 1024 * 1024) } }),
    new Response(new Uint8Array(9 * 1024 * 1024))]) {
    const prepare = createListingCoverPreparer({ cacheDir, fetchImage: async (_url, options) => {
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal instanceof AbortSignal);
      return response;
    } });
    assert.equal(await prepare(source), undefined);
  }
  assert.deepEqual(await fs.readdir(cacheDir), []);
});

test('publishing copies only referenced covers and refuses to ship a missing file', async t => {
  const root = await temp(t);
  const cacheDir = path.join(root, 'cache');
  const dist = path.join(root, 'dist');
  const prepare = createListingCoverPreparer({ cacheDir, fetchImage: async () => new Response(original) });
  const coverImage = await prepare(source);
  await prepare(source.replace('warehouse.webp', 'unused.webp'));
  await fs.mkdir(path.join(dist, 'static-loader-data'), { recursive: true });
  await fs.writeFile(path.join(dist, 'static-loader-data-manifest-stable.json'), JSON.stringify({
    '/listings': 'static-loader-data/listings.json', '/listings/city/lucknow': 'static-loader-data/listings.json',
  }));
  await fs.writeFile(path.join(dist, 'static-loader-data/listings.json'), JSON.stringify({ route: { coverImage } }));
  assert.equal(await publishListingCovers(dist, cacheDir), 1);
  assert.deepEqual(await fs.readdir(path.join(dist, 'listing-covers')), [path.basename(coverImage.src)]);
  await fs.unlink(path.join(cacheDir, path.basename(coverImage.src)));
  await assert.rejects(publishListingCovers(dist, cacheDir), /ENOENT/);
});
