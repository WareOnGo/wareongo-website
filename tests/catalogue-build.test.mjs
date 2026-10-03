import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { useLoaderData, useLocation } from 'react-router-dom';
import { Head as Helmet } from 'vite-react-ssg';
const { HelmetProvider } = createRequire(import.meta.resolve('vite-react-ssg'))('react-helmet-async');
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server.js';
import { createCatalogueBuild } from '../scripts/lib/catalogue-build.mjs';
import { JSDOM } from 'jsdom';

function Fixture() {
  const data = useLoaderData();
  const { pathname, search } = useLocation();
  const page = Number(new URLSearchParams(data.seedSearch).get('page') || 1);
  const rows = data.content ? data.warehouses.slice((page - 1) * 6, page * 6) : data.warehouses;
  return React.createElement('main', null,
    React.createElement(Helmet, null, React.createElement('link', { rel: 'canonical', href: `https://wareongo.com${pathname}${search}` })),
    rows.map(w => React.createElement('a', { key: w.id, href: `/warehouse/${w.id}`, 'data-warehouse-card': w.id }, w.id)));
}
async function initialHtml(routes, url) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`https://wareongo.com${url}`));
  const helmet = {};
  const app = renderToString(React.createElement(HelmetProvider, { context: helmet }, React.createElement(StaticRouterProvider, {
    router: createStaticRouter(handler.dataRoutes, context), context,
  })));
  return `<!doctype html><html><head>${helmet.helmet.link.toString()}<link rel="stylesheet" href="/assets/app.css"></head><body><div id="root" data-server-rendered="true">${app}</div><script>/* SCRIPT_COMMENT_PLACEHOLDER */</script></body></html>`;
}

test('the build renders every grid page from the matching API and shares overview inventory without changing its loader contract', async t => {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'catalogue-build-'));
  t.after(() => fs.rm(out, { recursive: true, force: true }));
  const build = createCatalogueBuild({ outDir: out, processCss: async html => html });
  const inventory = Array.from({ length: 47 }, (_, i) => ({ id: 100 - i, description: 'shared inventory '.repeat(500) }));
  const calls = [];
  const gridData = { filters: { city: 'Bengaluru' }, warehouses: inventory.slice(0, 21), fetchedAt: 123,
    pagination: { currentPage: 1, pageSize: 21, totalPages: 3, totalItems: 47 } };
  const overviewData = { content: { h1: 'Market overview' }, warehouses: inventory, stats: { count: 47 } };
  const manifests = {};
  for (const [url, data] of [['/listings', gridData], ['/listings/city/bengaluru', gridData], ['/overview/karnataka', overviewData]]) {
    const routes = [{ path: '*', Component: Fixture, loader: () => data }];
    const ctx = { routes, fetchCataloguePage: async (page, filters) => {
      calls.push([page, filters]);
      return { warehouses: inventory.slice((page - 1) * 21, page * 21), fetchedAt: 123,
        pagination: { ...gridData.pagination, currentPage: page } };
    } };
    // SSG passes ordinary routes without a leading slash, but dynamic paths
    // with one. Both must participate in the same publication contract.
    const html = await build.onPageRendered(url === '/listings' ? 'listings' : url, await initialHtml(routes, url), ctx);
    const file = path.join(out, url, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, html);
    const payload = `static-loader-data${url}.hash.json`;
    await fs.mkdir(path.dirname(path.join(out, payload)), { recursive: true });
    await fs.writeFile(path.join(out, payload), JSON.stringify({ 0: data }));
    manifests[url] = payload;
  }
  await fs.writeFile(path.join(out, 'static-loader-data-manifest-test.json'), JSON.stringify(manifests));
  await build.onFinished(out);
  const second = await fs.readFile(path.join(out, '__catalogue/listings/city/bengaluru/2/index.html'), 'utf8');
  assert.match(second, /data-warehouse-card="79"/);
  assert.doesNotMatch(second, /data-warehouse-card="100"/);
  assert.match(second, /https:\/\/wareongo.com\/listings\/city\/bengaluru\?page=2/);
  assert.deepEqual(calls, [[2, gridData.filters], [3, gridData.filters], [2, gridData.filters], [3, gridData.filters]]);
  assert.match(await fs.readFile(path.join(out, '__catalogue/listings/2/index.html'), 'utf8'), /data-warehouse-card="79"/);
  const final = await fs.readFile(path.join(out, '__catalogue/listings/city/bengaluru/3/index.html'), 'utf8');
  assert.equal((final.match(/data-warehouse-card=/g) || []).length, 5);
  const overview = await fs.readFile(path.join(out, '__catalogue/overview/karnataka/2/index.html'), 'utf8');
  assert.match(overview, /data-warehouse-card="94"/);
  assert.doesNotMatch(overview, /shared inventory/);
  assert.match(overview, /id="catalogue-hydration"/);
  const manifest = JSON.parse(await fs.readFile(path.join(out, 'static-loader-data-manifest-test.json'), 'utf8'));
  const shared = JSON.parse(await fs.readFile(path.join(out, manifest['/overview/karnataka']), 'utf8'));
  assert.deepEqual(shared['0'], overviewData, 'old bundles still receive the full original loader shape');
  for (let page = 1; page <= 8; page++) {
    const file = page === 1 ? 'overview/karnataka/index.html' : `__catalogue/overview/karnataka/${page}/index.html`;
    const dom = new JSDOM(await fs.readFile(path.join(out, file), 'utf8'));
    const document = dom.window.document;
    assert.deepEqual([...document.querySelectorAll('[data-warehouse-card]')].map(node => Number(node.getAttribute('data-warehouse-card'))),
      inventory.slice((page - 1) * 6, page * 6).map(row => row.id));
    assert.equal(document.querySelector('link[rel=canonical]').href, `https://wareongo.com/overview/karnataka${page > 1 ? `?page=${page}` : ''}`);
    assert.equal(document.querySelectorAll('#catalogue-hydration').length, 1);
    assert.deepEqual(JSON.parse(document.getElementById('catalogue-hydration').textContent),
      { src: `/${manifest['/overview/karnataka']}`, routeId: '0', seedSearch: page > 1 ? `page=${page}` : '' });
    assert.equal(document.querySelectorAll('link[rel=preload][as=fetch]').length, 1);
    assert.equal([...document.scripts].some(script => script.textContent.startsWith('window.__staticRouterHydrationData')), false);
    dom.window.close();
  }
  const report = JSON.parse(await fs.readFile(path.join(out, 'catalogue-build-report.json'), 'utf8'));
  assert.equal(report.pages.length, 3);
  assert.equal(report.pages.reduce((sum, row) => sum + row.totalPages, 0), 14);
});

test('a missing or changing API page fails the build instead of publishing partial pagination', async t => {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'catalogue-failure-'));
  t.after(() => fs.rm(out, { recursive: true, force: true }));
  const build = createCatalogueBuild({ outDir: out, processCss: async html => html });
  const data = { warehouses: [{ id: 1 }], pagination: { currentPage: 1, pageSize: 21, totalPages: 2, totalItems: 22 } };
  const routes = [{ path: '*', Component: Fixture, loader: () => data }];
  const html = await initialHtml(routes, '/listings');
  await assert.rejects(build.onPageRendered('/listings', html, { routes, fetchCataloguePage: async () => null }), /catalogue|page|inventory/i);
});
