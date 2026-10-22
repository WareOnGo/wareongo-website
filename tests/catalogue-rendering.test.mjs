import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const { outputFiles } = await build({
  stdin: { contents: `
    import { renderToString } from 'react-dom/server';
    import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { HelmetProvider } from 'react-helmet-async';
    import { AuthProvider } from './src/context/AuthContext';
    import { ListingsView } from './src/pages/Listings';
    import LocationListings from './src/pages/LocationListings';
    import PageHead from './src/components/PageHead';
    import { transformWarehouseData } from './src/services/warehouseAPI';
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

test('overview FAQ answers and crawlable page links are in the initial HTML below listings', async () => {
  const html = await compiled.exports.renderLocation();
  assert.match(html, /Which sizes are available\?/);
  assert.match(html, /Compare the recorded floor areas before arranging a visit\./);
  assert.match(html, /aria-expanded="false"/);
  assert.ok(html.indexOf('id="listing-faq-title"') > html.lastIndexOf('data-warehouse-card='));
  assert.match(html, /href="\/overview\/karnataka\/bengaluru"/);
  const { html: page } = await compiled.exports.renderGrid('/listings?page=2');
  assert.match(page, /href="\/listings\?page=3"/);
});
