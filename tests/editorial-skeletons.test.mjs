import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { editorialSkeletonContent } from '../scripts/lib/editorial-skeletons.mjs';

const hero = { h1: 'Warehouses for Rent', heroEyebrow: 'Local warehouse market', heroProse: 'Published introduction with **emphasis**.', heroImage: { url: '/warehouse.webp', alt: 'Warehouse', width: 1200, height: 900 }, inventoryHeading: 'Available Warehouses' };
const unrelated = { seoTitle: 'SEO_ONLY_SENTINEL', metaDescription: 'SEO description', faqs: [{ q: 'FAQ_ONLY_SENTINEL', a: 'Full answer' }], relatedBlogs: ['related-blog'], rentsProse: 'RENT_ONLY_SENTINEL'.repeat(500), specProse: 'SPEC_ONLY_SENTINEL'.repeat(500) };
const locations = [
  { ...hero, ...unrelated, kind: 'CITY', slug: 'bengaluru', marketProse: 'CITY_MARKET_ONLY_SENTINEL' },
  { ...hero, ...unrelated, kind: 'STATE', slug: 'karnataka', marketHeading: 'State Market', marketProse: 'Published state introduction.', marketImage: hero.heroImage, citiesHeading: 'Selected Cities', stateCities: [{ name: 'Bengaluru', slug: 'bengaluru', image: null }, { name: 'Unlisted City', slug: null, image: null }] },
];
const markets = [{ ...hero, ...unrelated, citySlug: 'bengaluru', slug: 'nelamangala' }];

test('compact editorial data preserves loading-screen markup without bundling full guides', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'editorial-skeletons-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.symlink(path.join(process.cwd(), 'node_modules'), path.join(directory, 'node_modules'), 'dir');
  const renderers = [];
  for (const compact of [false, true]) {
    const file = path.join(directory, `${compact ? 'compact' : 'full'}.mjs`);
    const result = await build({
      stdin: { resolveDir: process.cwd(), contents: `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { StaticRouter } from 'react-router-dom/server.js';
        import { LocationListingsSkeleton, OverviewSkeleton } from './src/components/LocationPageSkeletons';
        export const render = pathname => renderToStaticMarkup(React.createElement(StaticRouter, { location: '/bangalore' },
          React.createElement(pathname.startsWith('/overview/') ? OverviewSkeleton : LocationListingsSkeleton, { pathname })));
      ` },
      bundle: true, outfile: file, platform: 'node', format: 'esm', packages: 'external', metafile: true, jsx: 'automatic',
      define: { __DEV_SERVER__: 'false', 'import.meta.env': '{"SSR":true}' },
      plugins: [{ name: 'approved-editorial-fixture', setup(builder) {
        builder.onLoad({ filter: /\/(location|micromarket)Skeletons\.generated\.ts$/ }, args => {
          const isLocation = args.path.endsWith('/locationSkeletons.generated.ts');
          const pages = isLocation ? locations : markets;
          return { contents: `export const ${isLocation ? 'locationSkeletons' : 'micromarketSkeletons'} = ${JSON.stringify(compact ? pages.map(editorialSkeletonContent) : pages)};`, loader: 'ts' };
        });
      } }],
    });
    assert.ok(!Object.keys(result.metafile.inputs).some(name => /\/(locationPages|micromarkets)\.generated\.ts$/.test(name)), 'full CMS collections must not enter the startup dependency graph');
    if (compact) {
      const source = await fs.readFile(file, 'utf8');
      for (const sentinel of ['SEO_ONLY_SENTINEL', 'FAQ_ONLY_SENTINEL', 'RENT_ONLY_SENTINEL', 'SPEC_ONLY_SENTINEL', 'CITY_MARKET_ONLY_SENTINEL']) assert.ok(!source.includes(sentinel), sentinel);
      assert.match(source, /Published state introduction/);
    }
    renderers.push((await import(pathToFileURL(file))).render);
  }
  for (const pathname of ['/listings/state/karnataka', '/listings/city/bengaluru', '/listings/city/bengaluru/nelamangala', '/listings/city/bengaluru/peb', '/overview/karnataka', '/overview/karnataka/bengaluru', '/overview/karnataka/bengaluru/nelamangala', '/overview/unknown']) {
    assert.equal(renderers[1](pathname), renderers[0](pathname), pathname);
  }
});

test('checked-in compact snapshots match their approved editorial snapshots', async () => {
  const read = async filename => {
    const source = await fs.readFile(`src/data/${filename}.generated.ts`, 'utf8');
    return JSON.parse(source.slice(source.indexOf('= [') + 2).trim().replace(/;$/, ''));
  };
  assert.deepEqual(await read('locationSkeletons'), (await read('locationPages')).map(editorialSkeletonContent));
  assert.deepEqual(await read('micromarketSkeletons'), (await read('micromarkets')).map(editorialSkeletonContent));
});
