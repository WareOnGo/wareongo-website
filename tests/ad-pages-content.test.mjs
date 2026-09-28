import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateAdPages } from '../scripts/generate-ad-pages.mjs';

const original = JSON.parse(fs.readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url), 'utf8'));
test('an approved CMS revision becomes the website snapshot', async () => {
  const approved = structuredClone(original);
  approved.copy.heroHeading = 'CMS-approved warehouse heading';
  approved.heroSteps[0] = 'Share your requirement';
  approved.benefits[3] = { ...approved.benefits[3], title: 'Approved fourth benefit', body: 'Approved supporting copy.' };
  approved.images.why = { ...approved.images.why, url: 'https://images.example.test/why.webp', alt: 'Approved benefit section image' };
  approved.images.services = { ...approved.images.services, url: 'https://images.example.test/service.webp', alt: 'Approved warehouse image' };
  const writes = [];
  const pages = await generateAdPages({ read: async (url, options) => {
    assert.ok(url.endsWith('/ad-pages'));
    assert.equal(options.cache, 'no-store');
    return Response.json({ data: [{ ...approved, privateDraft: 'Never publish this' }] });
  }, write: async (...args) => { writes.push(args); } });
  assert.deepEqual(pages, [approved]);
  assert.equal(writes.length, 1);
  assert.match(writes[0][1], /CMS-approved warehouse heading/);
  assert.match(writes[0][1], /Share your requirement/);
  assert.match(writes[0][1], /Approved warehouse image/);
  assert.doesNotMatch(writes[0][1], /Never publish this/);
});
for (const [label, response] of [
  ['API outage', new Response('', { status: 503 })],
  ['missing migration', new Response('', { status: 404 })],
  ['missing page', Response.json({ data: [] })],
  ['invalid approved content', Response.json({ data: [{ ...original, copy: { ...original.copy, heroHeading: '' } }] })],
  ['invalid image', Response.json({ data: [{ ...original, images: { ...original.images, services: { ...original.images.services, url: '//unsafe.example/image.webp' } } }] })],
]) test(`${label} stops generation without overwriting the last snapshot`, async () => {
  let wrote = false;
  await assert.rejects(generateAdPages({ read: async () => response, write: async () => { wrote = true; } }));
  assert.equal(wrote, false);
});

test('an older approved revision builds with process steps and drops removed hero copy', async () => {
  const older = structuredClone(original);
  delete older.heroSteps;
  older.benefits = older.benefits.slice(0, 3);
  delete older.images.why;
  older.copy.heroIntro = 'Previous introduction';
  older.heroPoints = [{ value: '611', label: 'live listings' }];
  let generated = '';
  const pages = await generateAdPages({ read: async () => Response.json({ data: [older] }), write: async (_path, value) => { generated = value; } });
  assert.deepEqual(pages, [original]);
  assert.doesNotMatch(generated, /heroIntro|heroPoints|Previous introduction/);
});
