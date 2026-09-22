import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createEditorialImagePreparer } from '../src/lib/overviewImages.server.mjs';
import { publishOverviewImages } from '../scripts/publish-overview-images.mjs';

const source = 'https://pub-0123456789abcdef.r2.dev/blogs/warehouse.webp';
const pixels = Buffer.alloc(1600 * 1200 * 3);
for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 31 + Math.floor(i / 1600) * 17) % 256;
const original = await sharp(pixels, { raw: { width: 1600, height: 1200, channels: 3 } }).webp({ quality: 90 }).toBuffer();
async function temp(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wog-overview-image-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

test('responsive images save bytes without cropping, deduplicate downloads and reuse complete caches', async t => {
  const cacheDir = await temp(t);
  let downloads = 0;
  const prepare = createEditorialImagePreparer({ cacheDir, fetchImage: async () => { downloads++; return new Response(original); } });
  const [variants, duplicate] = await Promise.all([prepare(source), prepare(source)]);
  assert.deepEqual(variants, duplicate);
  assert.equal(downloads, 1);
  assert.deepEqual(variants.map(v => v.width), [384, 768, 1280]);
  for (const variant of variants) {
    const file = path.join(cacheDir, path.basename(variant.src));
    const image = await sharp(file).metadata();
    assert.equal(image.width, variant.width);
    assert.ok(Math.abs(image.width / image.height - 4 / 3) < 0.01);
    assert.ok((await fs.stat(file)).size < original.length);
  }
  const warm = createEditorialImagePreparer({ cacheDir, fetchImage: () => { throw new Error('unexpected download'); } });
  assert.deepEqual(await warm(source), variants);
  await fs.unlink(path.join(cacheDir, path.basename(variants[0].src)));
  const repaired = createEditorialImagePreparer({ cacheDir, fetchImage: async () => { downloads++; return new Response(original); } });
  assert.deepEqual(await repaired(source), variants);
  assert.equal(downloads, 2);
});

test('small images retain their true width and unsupported or failed sources keep the original path', async t => {
  const cacheDir = await temp(t);
  const small = await sharp(pixels.subarray(0, 200 * 150 * 3), {raw:{width:200,height:150,channels:3}}).png({compressionLevel:0}).toBuffer();
  const prepare = createEditorialImagePreparer({cacheDir,fetchImage:async()=>new Response(small)});
  const variants = await prepare(source);
  assert.deepEqual(variants.map(v => v.width),[200]);
  let calls = 0;
  const invalid = createEditorialImagePreparer({cacheDir,fetchImage:()=>{calls++;throw new Error('must not fetch');}});
  for(const url of [undefined,'bad','http://localhost/a.webp','https://pub-abc.r2.dev.evil.test/a.webp','https://pub-abc.r2.dev/a.svg']) assert.equal(await invalid(url),undefined);
  assert.equal(calls,0);
  for(const body of [new Response(null,{status:404}),new Response('bad image'),new Response('too big',{headers:{'content-length':String(9*1024*1024)}})]) {
    const failed = createEditorialImagePreparer({cacheDir,fetchImage:async(_url,options)=>{assert.equal(options.redirect,'error');return body;}});
    assert.equal(await failed(source.replace('warehouse','missing')),undefined);
  }
});

test('publishing verifies promised files and copies only variants used by this build', async t => {
  const root = await temp(t);
  const cacheDir = path.join(root,'wareongo-overview-images-v1');
  const prepare = createEditorialImagePreparer({cacheDir,fetchImage:async()=>new Response(original)});
  const variants = await prepare(source);
  await prepare(source.replace('warehouse','unused'));
  const dist = path.join(root,'dist');
  await fs.mkdir(path.join(dist,'static-loader-data'),{recursive:true});
  await fs.writeFile(path.join(dist,'static-loader-data-manifest-stable.json'),JSON.stringify({'/overview/karnataka':'static-loader-data/page.json'}));
  const payload = path.join(dist,'static-loader-data/page.json');
  await fs.writeFile(payload,JSON.stringify({route:{imageVariants:{[source]:variants}}}));
  assert.equal(await publishOverviewImages(dist,root),variants.length);
  assert.equal((await fs.readdir(path.join(dist,'overview-images'))).length,variants.length);
  await fs.unlink(path.join(cacheDir,path.basename(variants[0].src)));
  await assert.rejects(publishOverviewImages(dist,root),/ENOENT/);
  await fs.writeFile(payload,JSON.stringify({route:{coverImages:{[source]:'/../../private.webp'}}}));
  await assert.rejects(publishOverviewImages(dist,root),/Invalid overview cover/);
});
