import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server.js';
import { JSDOM } from 'jsdom';

// Head is exported by vite-react-ssg, which has its own Helmet dependency.
// Its provider must come from that same instance (the app also has Helmet 3).
const { HelmetProvider } = createRequire(import.meta.resolve('vite-react-ssg'))('react-helmet-async');

const isCatalogue = url => url === '/listings' || url.startsWith('/listings/') || url.startsWith('/overview/');
const backingFile = (out, url, page) => path.join(out, '__catalogue', url, String(page), 'index.html');
const hydrationScript = document => [...document.scripts].find(script => script.textContent.startsWith('window.__staticRouterHydrationData = '));

function readHydration(document) {
  const source = hydrationScript(document)?.textContent;
  // React Router escapes the JSON twice. Parse data, never evaluate script.
  const match = source?.match(/^window\.__staticRouterHydrationData = JSON\.parse\(("(?:[^"\\]|\\.)*")\);$/s);
  if (!match) throw new Error('Missing React Router hydration data in catalogue HTML');
  return JSON.parse(JSON.parse(match[1]));
}

function seededRoutes(routes, routeId, data, parent = []) {
  return routes.map((route, index) => {
    const indices = [...parent, index];
    const id = route.id ?? indices.join('-');
    return { ...route, ...(id === routeId ? { loader: () => data } : {}),
      ...(route.children ? { children: seededRoutes(route.children, routeId, data, indices) } : {}) };
  });
}

async function renderPage(document, routes, routeId, data, url, reference) {
  const handler = createStaticHandler(seededRoutes(routes, routeId, data));
  const context = await handler.query(new Request(`https://wareongo.com${url}`));
  if (context instanceof Response || context.errors) throw new Error(`Catalogue render failed: ${url}`);
  const helmet = {};
  const app = renderToString(React.createElement(HelmetProvider, { context: helmet },
    React.createElement(StaticRouterProvider, { router: createStaticRouter(handler.dataRoutes, context), context, hydrate: !reference })));
  document.getElementById('root').innerHTML = app;
  document.querySelectorAll('head [data-rh]').forEach(node => node.remove());
  const head = helmet.helmet;
  document.head.insertAdjacentHTML('afterbegin', [head.title, head.meta, head.link, head.script].map(part => part.toString()).join(''));
  if (reference) shareOverview(document, reference);
}

function shareOverview(document, reference) {
  const script = hydrationScript(document) ?? document.createElement('script');
  script.id = 'catalogue-hydration';
  script.type = 'application/json';
  script.textContent = JSON.stringify(reference).replace(/</g, '\\u003c');
  if (!script.parentNode) document.getElementById('root').appendChild(script);
  const preload = document.querySelector('link[data-catalogue-preload]') ?? document.createElement('link');
  preload.rel = 'preload';
  preload.setAttribute('as', 'fetch');
  preload.href = reference.src;
  preload.setAttribute('crossorigin', 'anonymous');
  preload.setAttribute('data-catalogue-preload', '');
  document.head.appendChild(preload);
}

/** Build-time only. Public URLs remain query-based; no request-time renderer. */
export function createCatalogueBuild({ outDir = 'dist', processCss }) {
  const pages = [];
  const sharedFiles = new Map();
  let cssQueue = Promise.resolve();
  const writePage = async (url, page, html) => {
    html = html.replace('/* SCRIPT_COMMENT_PLACEHOLDER */', "window.__VITE_REACT_SSG_HASH__ = 'stable'");
    // Match SSG's bounded critical-CSS queue instead of processing many large
    // DOMs at once. A failed extraction must fail this build.
    cssQueue = cssQueue.then(() => processCss(html));
    const output = await cssQueue;
    const file = backingFile(outDir, url, page);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, output);
    return Buffer.byteLength(output);
  };
  return {
    async onPageRendered(url, html, context) {
      url = '/' + url.replace(/^\/+|\/+$/g, '');
      if (!isCatalogue(url)) return html;
      const dom = new JSDOM(html);
      try {
        const hydration = readHydration(dom.window.document);
        const entry = Object.entries(hydration.loaderData).find(([, data]) => Array.isArray(data?.warehouses));
        if (!entry) throw new Error(`Missing catalogue inventory: ${url}`);
        const [routeId, base] = entry;
        const overview = url.startsWith('/overview/');
        const totalItems = overview ? base.warehouses.length : base.pagination.totalItems;
        const totalPages = Math.max(1, Math.ceil(totalItems / (overview ? 6 : 21)));
        let shared;
        if (overview) {
          const payload = JSON.stringify(hydration.loaderData);
          const hash = createHash('sha256').update(payload).digest('hex').slice(0, 24);
          const filename = `static-loader-data/catalogue/${hash}.json`;
          await fs.mkdir(path.dirname(path.join(outDir, filename)), { recursive: true });
          await fs.writeFile(path.join(outDir, filename), payload);
          sharedFiles.set(url, filename);
          shared = { src: `/${filename}`, routeId };
          shareOverview(dom.window.document, { ...shared, seedSearch: '' });
        }
        const firstPage = shared ? dom.serialize() : html;
        const seen = new Set(base.warehouses.map(w => w.id));
        const report = { path: url, totalItems, totalPages, originalHtmlBytes: Buffer.byteLength(html), addedHtmlBytes: 0,
          ...(shared ? { sharedData: shared.src } : {}) };
        for (let page = 2; page <= totalPages; page++) {
          const fetched = overview ? base : await context.fetchCataloguePage(page, base.filters);
          if (!fetched || (!overview && (fetched.pagination.currentPage !== page || fetched.pagination.pageSize !== 21
            || fetched.pagination.totalItems !== totalItems || fetched.warehouses.length !== Math.min(21, totalItems - (page - 1) * 21)))) {
            throw new Error(`Catalogue inventory changed or page missing: ${url}?page=${page}`);
          }
          if (!overview) for (const warehouse of fetched.warehouses) {
            if (seen.has(warehouse.id)) throw new Error(`Duplicate catalogue inventory: ${url}?page=${page}`);
            seen.add(warehouse.id);
          }
          const seedSearch = `page=${page}`;
          const data = { ...base, ...fetched, seedSearch };
          // Page one's optimized cover must never be attributed to page two.
          if (!overview) delete data.coverImage;
          // Reuse this category's document, and never serialize its full overview
          // inventory into each page just to parse and remove it again.
          await renderPage(dom.window.document, context.routes, routeId, data, `${url}?${seedSearch}`,
            shared ? { ...shared, seedSearch } : undefined);
          report.addedHtmlBytes += await writePage(url, page, dom.serialize());
        }
        if (!overview && seen.size !== totalItems) throw new Error(`Incomplete catalogue inventory: ${url}`);
        pages.push(report);
        return firstPage;
      } finally { dom.window.close(); }
    },
    async onFinished(out = outDir) {
      // Keep the manifest contract for existing bundles, with one shared full
      // overview JSON instead of an additional copy for every paginated HTML.
      for (const filename of await fs.readdir(out)) {
        if (!/^static-loader-data-manifest-.*\.json$/.test(filename)) continue;
        const file = path.join(out, filename);
        const manifest = JSON.parse(await fs.readFile(file, 'utf8'));
        for (const [url, shared] of sharedFiles) {
          const previous = manifest[url];
          manifest[url] = shared;
          if (previous && previous !== shared && !Object.values(manifest).includes(previous)) await fs.unlink(path.join(out, previous));
        }
        await fs.writeFile(file, JSON.stringify(manifest));
      }
      await fs.writeFile(path.join(out, 'catalogue-build-report.json'), JSON.stringify({ pages: pages.sort((a, b) => a.path.localeCompare(b.path)) }, null, 2));
    },
  };
}
