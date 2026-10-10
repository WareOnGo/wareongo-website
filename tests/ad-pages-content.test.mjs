import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { parseAdPage } from '../scripts/lib/ad-page-content.mjs';
import { generateAdPages } from '../scripts/generate-ad-pages.mjs';

const original = JSON.parse(fs.readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url), 'utf8'));
test('an approved CMS revision becomes the website snapshot', async () => {
  const approved = structuredClone(original);
  approved.copy.heroHeading = 'CMS-approved warehouse heading';
  approved.areaGroups[0].rows[0].need = 'Share your requirement';
  approved.rentGuide.intro = 'Approved market introduction';
  approved.faqs[0].a = 'Approved FAQ answer';
  approved.services[0].mobileBody = 'Approved mobile description';
  approved.benefits[3] = { ...approved.benefits[3], title: 'Approved fourth benefit', body: 'Approved supporting copy.' };
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

test('an older approved revision builds with current guides and drops retired fields', async () => {
  const older = JSON.parse(fs.readFileSync(new URL('./fixtures/bangalore-v1.json', import.meta.url), 'utf8'));
  delete older.heroSteps;
  older.benefits = older.benefits.slice(0, 3);
  delete older.images.why;
  older.copy.heroIntro = 'Previous introduction';
  older.heroPoints = [{ value: '611', label: 'live listings' }];
  let generated = '';
  const pages = await generateAdPages({ read: async () => Response.json({ data: [older] }), write: async (_path, value) => { generated = value; } });
  assert.deepEqual(pages, [parseAdPage(older)]);
  assert.deepEqual(pages[0].rentGuide, original.rentGuide);
  assert.doesNotMatch(generated, /heroIntro|heroPoints|heroSteps|overviewStats|Previous introduction/);
});

const { outputFiles } = await build({
  stdin: {
    contents: `
      import { renderToStaticMarkup } from 'react-dom/server';
      import BangaloreBenefits from './src/components/city/BangaloreBenefits';
      export const render = content => renderToStaticMarkup(<BangaloreBenefits content={content} />);
    `,
    resolveDir: fileURLToPath(new URL('../', import.meta.url)),
    loader: 'tsx',
  },
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);
const renderBenefits = content => new JSDOM(compiled.exports.render(content)).window.document;

test('standard benefits retain full titles and their compact mobile labels', () => {
  const document = renderBenefits(original);
  for (const [id, compact] of [['benefit-4', 'Single PoC'], ['benefit-5', 'Compliance Support'], ['benefit-6', 'Built-to-Suit']]) {
    const heading = document.querySelector(`[data-benefit="${id}"] h3`);
    assert.equal(heading.querySelector('.bangalore-landing__benefit-full-title').textContent, original.benefits.find(item => item.id === id).title);
    assert.equal(heading.querySelector('.bangalore-landing__benefit-mobile-title').textContent, compact);
  }
});

for (const [id, title] of [['benefit-4', 'Dedicated Launch Advisor'], ['benefit-5', 'Local Clearance Advice'], ['benefit-6', 'Custom Fit-Out Options']]) {
  test(`a custom CMS title for ${id} stays visible at every viewport`, () => {
    const content = structuredClone(original);
    const benefit = content.benefits.find(item => item.id === id);
    benefit.title = title;
    benefit.mobileTitle = ''; // Explicitly opt into the main heading on mobile.
    benefit.body = 'Independently approved supporting copy.';
    const card = renderBenefits(content).querySelector(`[data-benefit="${id}"]`);
    assert.equal(card.querySelector('h3').textContent, title);
    assert.equal(card.querySelector('.bangalore-landing__benefit-body').textContent, benefit.body);
    assert.equal(card.querySelector('.bangalore-landing__benefit-full-title, .bangalore-landing__benefit-mobile-title'), null);
  });
}
