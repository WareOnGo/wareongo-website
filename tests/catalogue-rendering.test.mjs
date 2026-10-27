import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const { outputFiles } = await build({
  stdin: { contents: `
    import { renderToString } from 'react-dom/server';
    import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { HelmetProvider } from 'react-helmet-async';
    import { AuthProvider } from './src/context/AuthContext';
    import { ListingsView } from './src/pages/Listings';
    import LocationListings from './src/pages/LocationListings';
    import EditorialLocationPage from './src/pages/EditorialLocationPage';
    import PageHead from './src/components/PageHead';
    import { transformWarehouseData } from './src/services/warehouseAPI';
    import { DEFAULT_FILTERS } from './src/lib/listingSearch';
    const warehouses = Array.from({ length: 21 }, (_, i) => transformWarehouseData({
      id: 79 - i, city: 'Bengaluru', state: 'Karnataka', warehouseType: 'PEB',
      address: 'Test warehouse', photos: [], totalSpaceSqft: [10000], micromarket: [],
    }));
    export async function renderGrid(url, withCustomHead = false) {
      const seed = { warehouses, seedSearch: 'page=2', fetchedAt: Date.now(),
        pagination: { currentPage: 2, pageSize: 21, totalPages: 5, totalItems: 100 } };
      const element = <AuthProvider><QueryClientProvider client={new QueryClient()}>
        <ListingsView initialData={seed} head={withCustomHead ? ({ warehouses, pagination }) =>
          <PageHead title="Fixture" description="Catalogue" path="/listings">
            <script type="application/ld+json">{JSON.stringify({ page: pagination.currentPage, ids: warehouses.map(w => w.id) })}</script>
          </PageHead> : undefined} />
      </QueryClientProvider></AuthProvider>;
      const handler = createStaticHandler([{ path: '*', element }]);
      const context = await handler.query(new Request('https://wareongo.com' + url));
      const helmet = {};
      const html = renderToString(<HelmetProvider context={helmet}><StaticRouterProvider
        router={createStaticRouter(handler.dataRoutes, context)} context={context} /></HelmetProvider>);
      return { html, head: helmet.helmet.link.toString() + helmet.helmet.meta.toString() + helmet.helmet.script.toString() };
    }
    export async function renderLocation() {
      const seed = { type: 'city', canonical: 'Bengaluru', slug: 'bengaluru', warehouses,
        overviewPath: '/overview/karnataka/bengaluru',
        overviewFaqs: [{ q: 'Which sizes are available?', a: 'Compare the recorded floor areas before arranging a visit.' }],
      };
      const element = <AuthProvider><QueryClientProvider client={new QueryClient()}><LocationListings /></QueryClientProvider></AuthProvider>;
      const handler = createStaticHandler([{ path: '*', loader: () => seed, element }]);
      const context = await handler.query(new Request('https://wareongo.com/listings/city/bengaluru'));
      return renderToString(<HelmetProvider><StaticRouterProvider router={createStaticRouter(handler.dataRoutes, context)} context={context} /></HelmetProvider>);
    }
    export async function renderOverview(path, scope, search, contentOverride = {}) {
      const data = { warehouses, seedSearch: search,
        content: { seoTitle: 'Overview', metaDescription: 'Market overview', h1: 'Overview', heroProse: '', faqs: [], relatedBlogs: [], ...contentOverride },
        stats: { listings: warehouses.length, measured: 0, construction: [], flooring: [], fireNoc: 0, commercialClu: 0 },
        editorial: { path, scope, name: 'Market', place: 'Market', listingPath: '/listings', ancestors: [], up: null } };
      const handler = createStaticHandler([{ path: '*', element: <AuthProvider><EditorialLocationPage data={data}/></AuthProvider> }]);
      const context = await handler.query(new Request('https://wareongo.com' + path + (search ? '?' + search : '')));
      const helmet = {};
      const html = renderToString(<HelmetProvider context={helmet}><StaticRouterProvider
        router={createStaticRouter(handler.dataRoutes, context)} context={context} /></HelmetProvider>);
      return { html, head: helmet.helmet.link.toString() + helmet.helmet.meta.toString() + helmet.helmet.script.toString() };
    }
    export async function renderEditorialListing(scope, search = '', contentOverride = {}) {
      const path = scope === 'state' ? '/listings/state/karnataka' : '/listings/city/bengaluru' + (scope === 'micromarket' ? '/nelamangala' : '');
      const overviewPath = '/overview/karnataka' + (scope === 'state' ? '' : '/bengaluru') + (scope === 'micromarket' ? '/nelamangala' : '');
      const spread = { min: 10, median: 20, max: 30 };
      const stats = { listings: 100, measured: 90, construction: [], flooring: [], fireNoc: 50, commercialClu: 40,
        size: { min: 1000, median: 10000, max: 50000 }, rent: spread, clearHeight: spread, docksMedian: 2,
        samples: { rent: 90 }, engineeredFloorShare: 50 };
      const photo = { url: 'https://pub-0123456789abcdef.r2.dev/hero.webp', alt: 'Editorial warehouse photograph', width: 1600, height: 1200 };
      const content = { seoTitle: 'Standalone overview title', metaDescription: 'Standalone overview description',
        h1: 'Authored location introduction', heroEyebrow: 'Authored eyebrow', heroProse: 'Authored introduction **with emphasis**.', heroImage: photo,
        marketHeading: 'Authored market heading', marketProse: 'Authored market explanation.', marketImage: { ...photo, alt: 'Editorial market photograph' },
        rentsHeading: 'Authored rent heading', rentsProse: 'Authored rental explanation.',
        specHeading: 'Authored specification heading', specProse: 'Authored specification explanation.',
        corridorHeading: 'Authored corridor heading', corridorProse: 'Authored corridor explanation.',
        complianceHeading: 'Authored compliance heading', complianceProse: 'Authored compliance explanation.',
        citiesHeading: 'Authored cities heading',
        faqs: [{ q: 'Authored FAQ question?', a: 'Authored FAQ **answer**.' }], relatedBlogs: [], ...contentOverride };
      const overview = { content, stats, peers: [{ name: 'Comparison market', path: '/listings/city/pune', medianRent: 25 }],
        editorial: { path: overviewPath, scope, name: 'Fixture market', place: 'Fixture market', listingPath: path, ancestors: [], up: null },
        cityOverview: scope === 'city' ? {
          segments: { large: stats, small: stats }, corridors: [], rentBySize: [{ ...stats, slug: 'large', label: 'Recorded size band' }],
          specsBySize: { large: stats, small: stats }, micromarkets: [], nearbyCities: [], nearbyLabel: 'Nearby cities',
        } : undefined,
        stateOverview: scope === 'state' ? { cities: [{ name: 'Chosen city', slug: 'bengaluru', path: '/listings/city/bengaluru',
          listings: 100, rent: spread, sizeMedian: 10000, build: 'PEB', image: { ...photo, alt: 'Chosen city photograph' } }],
          otherCities: ['Additional city'], nearbyStates: [], marketImage: null } : undefined,
      };
      const seed = { type: scope, canonical: 'Fixture market', slug: scope === 'state' ? 'karnataka' : scope === 'city' ? 'bengaluru' : 'nelamangala',
        parentCity: scope === 'micromarket' ? { canonical: 'Bengaluru', slug: 'bengaluru' } : undefined,
        warehouses, overview, overviewPath, seedSearch: search, fetchedAt: Date.now(),
        pagination: { currentPage: search.includes('page=2') ? 2 : 1, pageSize: 21, totalPages: 5, totalItems: 100 },
        filters: { ...DEFAULT_FILTERS, city: 'Bengaluru' },
        summary: { minSize: 1000, maxSize: 50000, cities: [] },
      };
      const element = <AuthProvider><QueryClientProvider client={new QueryClient()}><LocationListings /></QueryClientProvider></AuthProvider>;
      const handler = createStaticHandler([{ path: '*', loader: () => seed, element }]);
      const context = await handler.query(new Request('https://wareongo.com' + path + (search ? '?' + search : '')));
      const helmet = {};
      const html = renderToString(<HelmetProvider context={helmet}><StaticRouterProvider
        router={createStaticRouter(handler.dataRoutes, context)} context={context} /></HelmetProvider>);
      return { html, path, head: helmet.helmet.title.toString() + helmet.helmet.link.toString() + helmet.helmet.meta.toString() + helmet.helmet.script.toString() };
    }
  `, resolveDir: process.cwd(), loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', loader: { '.css': 'empty' },
  alias: { 'react-helmet-async': './node_modules/react-helmet-async/lib/index.esm.js' },
  define: { 'process.env.NODE_ENV': '"production"', '__DEV_SERVER__': 'false',
    'import.meta.env': JSON.stringify({ SSR: true, PROD: false, DEV: false }) },
});

test('category metadata receives the same visible result page as the cards', async () => {
  const { head } = await compiled.exports.renderGrid('/listings?page=2', true);
  assert.match(head, /"page":2,"ids":\[79,78,77/);
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);

test('page two static HTML contains page two cards and a self canonical', async () => {
  const { html, head } = await compiled.exports.renderGrid('/listings?page=2');
  assert.match(html, /21 warehouses shown on page 2/);
  assert.match(html, /href="\/warehouse\/[^" ]+-79"/);
  assert.match(head, /rel="canonical" href="https:\/\/wareongo.com\/listings\?page=2"/);
  assert.doesNotMatch(head, /name="robots" content="noindex/);
});

test('filter permutations have an explicit noindex and clean category canonical', async () => {
  const { head } = await compiled.exports.renderGrid('/listings?city=Bengaluru&type=PEB&fire=yes&page=2');
  assert.match(head, /name="robots" content="noindex,follow"/);
  assert.match(head, /rel="canonical" href="https:\/\/wareongo.com\/listings"/);
});

test('state, city and micromarket overviews render noindex metadata on every page', async () => {
  for (const [scope, path] of [
    ['state', '/overview/karnataka'],
    ['city', '/overview/karnataka/bengaluru'],
    ['micromarket', '/overview/karnataka/bengaluru/nelamangala'],
  ]) {
    for (const search of ['', 'page=2']) {
      const { html, head } = await compiled.exports.renderOverview(path, scope, search);
      assert.match(html, /id="editorial-title"/);
      assert.match(head, /name="robots" content="noindex,follow"/);
      assert.ok(head.includes(`rel="canonical" href="https://wareongo.com${path}${search ? '?' + search : ''}"`));
    }
  }
});

test('overview FAQ answers and crawlable page links are in the initial HTML below listings', async () => {
  const html = await compiled.exports.renderLocation();
  assert.match(html, /Which sizes are available\?/);
  assert.match(html, /Compare the recorded floor areas before arranging a visit\./);
  assert.match(html, /aria-expanded="false"/);
  assert.ok(html.indexOf('id="listing-faq-title"') > html.lastIndexOf('data-warehouse-card='));
  assert.match(html, /href="\/overview\/karnataka\/bengaluru"/);
  const { html: page } = await compiled.exports.renderGrid('/listings?page=2');
  const dom = new JSDOM(page);
  const nextPage = dom.window.document.querySelector('[data-testid="listings-load-more"] a');
  assert.equal(nextPage?.textContent, 'Load more warehouses');
  assert.equal(nextPage?.getAttribute('href'), '/listings?page=3');
  dom.window.close();
});

test('complete editorial content is in initial listing HTML below the grid on all scopes and pagination pages', async () => {
  for (const scope of ['state', 'city', 'micromarket']) {
    for (const search of ['', 'page=2']) {
      const { html, head, path } = await compiled.exports.renderEditorialListing(scope, search);
      const dom = new JSDOM('<!doctype html><html><head>' + head + '</head><body>' + html + '</body></html>');
      const doc = dom.window.document;
      const footer = doc.querySelector('#listing-overview');
      assert.ok(footer, scope);
      for (const copy of ['Authored location introduction', 'Authored eyebrow', 'Authored introduction with emphasis.',
        'Authored market heading', 'Authored market explanation.', 'Authored rent heading', 'Authored rental explanation.',
        'Authored specification heading', 'Authored specification explanation.', 'Authored FAQ question?', 'Authored FAQ answer.', 'Comparison market']) {
        assert.ok(footer.textContent.includes(copy), scope + ': ' + copy);
      }
      assert.ok(html.indexOf('id="listing-overview"') > html.lastIndexOf('data-warehouse-card='));
      assert.equal(doc.querySelectorAll('[data-warehouse-card]').length, 21, 'one result grid');
      assert.equal(doc.querySelectorAll('h1').length, 1);
      assert.equal(doc.querySelectorAll('main').length, 1);
      assert.equal(footer.querySelector('#listing-overview-title').tagName, 'H2');
      assert.equal(footer.querySelector('img[alt="Editorial warehouse photograph"]').getAttribute('loading'), 'lazy');
      assert.ok(footer.querySelector('img[alt="Editorial market photograph"]'));
      assert.ok(doc.querySelector('a[href="#listing-overview"]'));
      assert.equal(doc.querySelectorAll('meta[name="robots"][content*="noindex"]').length, 0);
      assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://wareongo.com' + path + (search ? '?' + search : ''));
      assert.ok(!doc.title.includes('Standalone overview'));
      const schema = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
      assert.equal(schema.filter(data => data['@type'] === 'CollectionPage').length, 1);
      const faq = schema.find(data => data['@type'] === 'FAQPage');
      assert.equal(faq.mainEntity[0].acceptedAnswer.text, 'Authored FAQ answer.');
      if (scope !== 'micromarket') assert.ok(footer.textContent.includes('Authored compliance explanation.'));
      if (scope === 'city') {
        assert.ok(footer.textContent.includes('Authored corridor explanation.'));
        assert.ok(footer.querySelector('.city-corridor-panel'));
        assert.ok(footer.querySelector('.city-rent-table'));
        assert.ok(footer.querySelector('.city-spec-comparison'));
      }
      if (scope === 'state') {
        assert.ok(footer.textContent.includes('Authored cities heading'));
        assert.ok(footer.textContent.includes('Chosen city'));
        assert.ok(footer.textContent.includes('Additional city'));
        assert.ok(footer.querySelector('img[alt="Chosen city photograph"]'));
      }
      dom.window.close();
    }
  }
});

test('CMS text cannot close a structured-data script or inject markup into listing and overview HTML', async () => {
  const text = '</script><script id=editorial-breakout>null</script>';
  const content = { h1: text, metaDescription: text, faqs: [{ q: text, a: text }] };
  for (const result of await Promise.all([
    compiled.exports.renderEditorialListing('micromarket', '', content),
    compiled.exports.renderOverview('/overview/karnataka/bengaluru/nelamangala', 'micromarket', '', content),
  ])) {
    const dom = new JSDOM('<!doctype html><html><head>' + result.head + '</head><body>' + result.html + '</body></html>');
    const doc = dom.window.document;
    assert.equal(doc.querySelector('#editorial-breakout'), null);
    const schema = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
    assert.equal(schema.find(data => data['@type'] === 'FAQPage').mainEntity[0].acceptedAnswer.text, text);
    assert.ok(doc.body.textContent.includes(text), 'the authored text remains available to readers');
    dom.window.close();
  }
});
