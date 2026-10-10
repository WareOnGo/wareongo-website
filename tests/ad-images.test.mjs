import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { test } from 'node:test';
import { build } from 'esbuild';
import sharp from 'sharp';

const { outputFiles } = await build({ entryPoints: ['src/lib/adImageSources.ts'], bundle: true, write: false, format: 'esm' });
const { adImageSources, FEATURED_IMAGE_SIZES } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const content = JSON.parse(await fs.readFile('src/data/ad-pages/bangalore.json', 'utf8'));

test('every bundled ad photo has decodable WebP candidates with accurate width descriptors', async () => {
  const checked = new Set();
  for (const image of Object.values(content.images)) {
    const sources = adImageSources(image.url, FEATURED_IMAGE_SIZES);
    assert.equal(sources.src, image.url, 'retain the approved CMS URL as the original/fallback');
    assert.ok(sources.srcSet, `Missing responsive sources: ${image.url}`);
    for (const candidate of sources.srcSet.split(', ')) {
      const [url, descriptor] = candidate.split(' ');
      if (checked.has(url)) continue;
      checked.add(url);
      const metadata = await sharp(await fs.readFile(`public${url}`)).metadata();
      assert.equal(metadata.format, 'webp');
      assert.equal(metadata.width, Number.parseInt(descriptor));
    }
  }
});

test('audited mobile photos stay within their image-transfer budgets', async () => {
  for (const [url, budget] of [['/bangalore/featured-devanahalli.webp', 24 * 1024], ['/bangalore/micromarket-bidadi.webp', 18 * 1024]]) {
    const sources = adImageSources(url, FEATURED_IMAGE_SIZES);
    const candidate = sources.srcSet.split(', ').find(value => value.endsWith(' 512w')).split(' ')[0];
    assert.ok((await fs.stat(`public${candidate}`)).size <= budget, `${url} exceeds its mobile budget`);
  }
});

test('query-tagged local photos are optimized while replacement CMS images keep their own URL', () => {
  const local = adImageSources('/bangalore/dobbaspet.webp?listing=1121', '232px');
  assert.ok(local.srcSet);
  assert.equal(local.src, '/bangalore/dobbaspet.webp?listing=1121');
  for (const url of ['https://cdn.example.com/new-photo.webp', '//cdn.example.com/bangalore/dobbaspet.webp', '/bangalore/new-photo.webp']) {
    assert.deepEqual(adImageSources(url, '232px'), { src: url, srcSet: undefined, sizes: undefined });
  }
});
