import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { parseAdPage } from '../scripts/lib/ad-page-content.mjs';

process.env.NODE_ENV = 'production';
globalThis.__wogPreviewSsr = true;
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const { outputFiles } = await build({
  stdin: { loader: 'tsx', resolveDir: root, contents: `
    import {renderToStaticMarkup} from 'react-dom/server';
    import {createMemoryRouter, RouterProvider} from 'react-router-dom';
    import {HelmetProvider} from 'react-helmet-async';
    import {AuthProvider} from './src/context/AuthContext';
    import {PreviewPage} from './src/pages/CmsPreview';
    import Blog from './src/pages/BlogDetail';
    import Service from './src/pages/ServiceDetail';
    import Privacy from './src/pages/PrivacyPolicy';
    import Terms from './src/pages/TermsOfService';
    import Editorial from './src/pages/EditorialLocationPage';
    import Bangalore from './src/pages/BangaloreLanding';
    import {normalizeHeadingCase} from './src/lib/headingCase';
    import {normalizeContentPunctuation} from './src/lib/contentPunctuation';
    import {transformWarehouseData} from './src/services/warehouseAPI';
    export {readCmsPreview} from './src/lib/cmsPreviewContent';
    export {trustedPreviewParent} from './src/lib/cmsPreview';
    export {previewEditorialPage} from './src/loaders/locationLoader';
    export {locationOverviewPath} from './src/services/locationsAPI';
    export {blogs} from './src/data/blogs';
    export {servicePages} from './src/data/servicePages';
    export {getLegalPage} from './src/data/legalPages';
    export const normalize = content => normalizeHeadingCase(normalizeContentPunctuation(content));
    export const transform = transformWarehouseData;
    const wrap = (element, path) => renderToStaticMarkup(<HelmetProvider><RouterProvider router={createMemoryRouter([
      {path:'*', loader:()=>null, element:<AuthProvider>{element}</AuthProvider>}
    ], {initialEntries:[path], hydrationData:{loaderData:{0:null}}})}/></HelmetProvider>);
    export const render = (value, editorial, preview=false) => {
      const Component = {blog:Blog,service:Service,legal:value.content.slug==='privacy-policy'?Privacy:Terms}[value.type] ?? Editorial;
      return wrap(preview ? <PreviewPage value={value} editorial={editorial}/> : <Component content={value.content} data={editorial}/>, preview?'/preview/cms':'/overview/karnataka/bengaluru');
    };
    export const ad = content => wrap(<Bangalore content={content}/>, '/bangalore');
  ` },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
  loader: { '.css': 'empty' },
  alias: { '@': root + 'src', 'vite-react-ssg': root + 'node_modules/vite-react-ssg/dist/index.mjs',
    'react-helmet-async': createRequire(root + 'node_modules/vite-react-ssg/dist/index.mjs').resolve('react-helmet-async') },
  define: { __DEV_SERVER__: 'false', 'process.env.NODE_ENV': '"production"', 'import.meta.env': '{"PROD":true}', 'import.meta.env.SSR': 'globalThis.__wogPreviewSsr' },
});
const module = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(require, module, module.exports);
const app = module.exports;
const document = html => new JSDOM(html).window.document;
const visibleMarkup = html => {
  const doc = document(html);
  doc.querySelectorAll('head,script').forEach(el => el.remove());
  doc.querySelectorAll('[href]').forEach(el => el.removeAttribute('href'));
  return doc.body.innerHTML;
};

for (const [type, original] of [
  ['blog', { ...app.blogs[0], dateModified: '2026-10-09', datePublished: null }],
  ['service', { slug: 'warehouse-search', title: 'Warehouse search', seoTitle: 'Warehouse search', description: 'Search description', summary: 'Search summary', blocks: [], faqs: [], keywords: [] }],
  ['legal', app.getLegalPage('privacy-policy')],
  ['legal', app.getLegalPage('terms-of-service')],
]) test(`${type}/${original.slug}: draft and published page render identically`, () => {
  const edited = { ...original, title: 'test heading — with punctuation', blocks: [{ kind: 'p', text: 'Edited **body** — with punctuation.' }], faqs: [] };
  if (type === 'blog') edited.related = [app.blogs[1]?.slug ?? app.blogs[0].slug, 'missing-blog'];
  const value = app.readCmsPreview({ type, content: edited });
  const preview = app.render(value, undefined, true);
  assert.equal(visibleMarkup(preview), visibleMarkup(app.render(value)));
  const doc = document(preview);
  assert.equal(doc.querySelector('h1').textContent.trim(), 'Test Heading: With Punctuation');
  assert.ok(doc.querySelector('strong'));
  if (type === 'blog') {
    assert.equal(doc.querySelector('#blog-faq'), null);
    assert.doesNotMatch(doc.querySelector('[aria-label="Related blogs"]').textContent, /missing-blog|\/blogs\//);
  }
});

const stats = { listings: 50, measured: 50, rent: null, size: null, clearHeight: null, docksMedian: null,
  construction: [], flooring: [], fireNoc: 0, commercialClu: 0, peers: [], listingIds: Array.from({ length: 50 }, (_, i) => i + 1) };
const rows = stats.listingIds.map(id => ({ id, warehouseName: `Warehouse ${id}`, city: 'Bengaluru', state: 'Karnataka',
  address: 'Peenya', micromarket: ['Peenya'], warehouseType: 'BTS', totalSpaceSqft: [1000], ratePerSqft: '', images: [], photos: [], photosWebp: [] }));
const editorialContent = { kind: 'CITY', slug: 'bengaluru', seoTitle: 'Title', metaDescription: 'Description',
  h1: 'warehouses for rent — bengaluru', heroProse: 'Storage — with loading bays.',
  rentsProse: 'Pricing explanation.', specProse: 'Specification explanation.', faqs: [], relatedBlogs: [app.blogs[0].slug] };
const editorialData = { type: 'city', canonical: 'Bengaluru', slug: 'bengaluru', warehouses: rows.map(app.transform),
  stats, peers: [], overviewPath: '/overview/karnataka/bengaluru',
  editorial: { scope: 'city', name: 'Bengaluru', place: 'Bengaluru', path: '/overview/karnataka/bengaluru',
    listingPath: '/listings/city/bengaluru', ancestors: [], up: null } };

test('sparse editorial previews use six real cards and omit unavailable panels', () => {
  const value = app.readCmsPreview({ type: 'city', content: { ...editorialContent, inventoryHeading: ' ', marketProse: ' ', h1: ` ${editorialContent.h1} ` } });
  const data = { ...editorialData, content: value.content };
  const preview = app.render(value, data, true);
  assert.equal(visibleMarkup(preview), visibleMarkup(app.render(value, data)));
  const doc = document(preview);
  assert.equal(doc.querySelectorAll('#listings .warehouse-card').length, 6);
  assert.ok(doc.querySelector('#listings h2').textContent.includes('Warehouses for Rent in Bengaluru'));
  assert.equal(doc.querySelector('#market'), null);
  assert.equal(doc.querySelectorAll('#overview dl > div').length, 1);
  assert.equal(doc.querySelector('#rents figure'), null);
  assert.equal(doc.querySelector('[aria-labelledby="inventory-band"]'), null);
  assert.equal(doc.querySelectorAll('#specification tbody tr').length, 0);
  assert.ok(doc.querySelector('[aria-label="Related pages"]').textContent.includes(app.blogs[0].title));
});

test('editorial preview loads unpublished copy with current inventory and applies draft overrides', async () => {
  const location = { ...stats, kind: 'CITY', name: 'Bengaluru', slug: 'bengaluru', parentState: 'Karnataka', stateSlug: 'karnataka', hasPage: true };
  const original = globalThis.fetch;
  globalThis.__wogPreviewSsr = false;
  globalThis.fetch = async url => {
    const pathname = new URL(url).pathname;
    if (pathname.endsWith('/locations')) return Response.json({ data: { cities: [location], states: [] } });
    if (pathname.endsWith('/micromarkets')) return Response.json({ data: [] });
    if (pathname.endsWith('/warehouses')) return Response.json({ data: rows, pagination: { page: 1, pageSize: 500, totalPages: 1, total: rows.length } });
    throw new Error(`Unexpected preview read: ${pathname}`);
  };
  try {
    const value = app.readCmsPreview({ type: 'city', content: { ...editorialContent, statOverrides: { rent: { min: 10, median: 15, max: 20 } } } });
    const data = await app.previewEditorialPage(value);
    assert.equal(data.warehouses.length, 50);
    assert.equal(data.content.h1, 'Warehouses for Rent: Bengaluru');
    assert.equal(data.stats.rent.median, 15);
    assert.equal(data.content.relatedBlogs[0], app.blogs[0].slug);
  } finally { globalThis.fetch = original; globalThis.__wogPreviewSsr = true; }
});

test('Bangalore guide, rent, FAQ and mobile edits all reach the actual page', () => {
  const page = JSON.parse(fs.readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url), 'utf8'));
  page.areaGroups[0].rows[0] = { need: 'Custom occupier need', areas: 'Custom suggested area' };
  page.rentGuide.intro = 'Custom rent introduction';
  page.rentGuide.rows[0] = { area: 'Custom rent area', rent: '₹21 to ₹32' };
  page.faqs[0] = { q: 'Custom question?', a: 'Custom answer.' };
  page.services[0].title = 'Custom Desktop Title';
  page.services[0].mobileTitle = 'Custom Mobile Title';
  page.services[0].mobileBody = 'Custom mobile description';
  const doc = document(app.ad(parseAdPage(page)));
  for (const text of ['Custom occupier need', 'Custom suggested area', 'Custom rent introduction', 'Custom rent area', '₹21 to ₹32', 'Custom question?', 'Custom answer.']) assert.ok(doc.body.textContent.includes(text), text);
  assert.ok([...doc.querySelectorAll('.bangalore-landing__service-mobile-copy')].some(el => el.textContent === 'Custom Mobile Title'));
  assert.ok([...doc.querySelectorAll('.bangalore-landing__service-full-copy')].some(el => el.textContent === 'Custom Desktop Title'));
});

test('preview trusts only the configured CMS sites or local-to-local development', () => {
  assert.equal(app.trustedPreviewParent('https://cms.wareongo.com', 'wareongo.com'), true);
  for (const origin of ['https://evil.example', 'https://cms.wareongo.com.evil.example', 'https://unrelated.vercel.app', 'http://localhost:3000', 'null']) assert.equal(app.trustedPreviewParent(origin, 'wareongo.com'), false);
  assert.equal(app.trustedPreviewParent('http://localhost:3000', '127.0.0.1'), true);
  assert.throws(() => app.readCmsPreview({ type: 'unsupported', content: {} }));
  assert.throws(() => app.readCmsPreview({ type: 'blog', content: { slug: 'a' } }));
});

test('canonical backend geography with repeated hyphens keeps its overview URL', () => {
  const slug = 'chhatrapati-sambhajinagar--aurangabad';
  assert.equal(app.locationOverviewPath({ kind: 'CITY', slug, stateSlug: 'maharashtra', hasPage: true }), `/overview/maharashtra/${slug}`);
});

test('preview accepts native edits beyond the AI import limit and bounds oversized messages', () => {
  const content = { ...app.blogs[0], dateModified: '2026-10-09', blocks: [{ kind: 'p', text: 'a'.repeat(800_000) }] };
  assert.equal(app.readCmsPreview({ type: 'blog', content }).content.blocks[0].text.length, 800_000);
  content.blocks[0].text = 'a'.repeat(1_048_576);
  assert.throws(() => app.readCmsPreview({ type: 'blog', content }), /Invalid preview/);
});
