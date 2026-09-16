import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseFragment } from 'parse5';
import { selectNavigationGuide } from '../scripts/lib/navigation-guide.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { outputFiles } = await build({
  absWorkingDir: root,
  stdin: { contents: `
    export * from './src/lib/locationNavigation';
    export * from './src/data/navigation';
    export * from './src/data/locations.generated';
    export { navigationGuide } from './src/data/navigation-guide.generated';
    import { createMemoryRouter, RouterProvider } from 'react-router-dom';
    import { renderToString } from 'react-dom/server';
    import { AuthProvider } from './src/context/AuthContext';
    import Navbar from './src/components/Navbar';
    export const renderNavigation = () => renderToString(<RouterProvider router={createMemoryRouter([
      { path: '*', element: <AuthProvider><Navbar /><Navbar /></AuthProvider> }
    ])} />);
  `, resolveDir: root, loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"', __DEV_SERVER__: 'false',
    'import.meta.env': JSON.stringify({ SSR: true, PROD: false, DEV: false }) },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);
const { createLocationCatalogue, featuredLocations, searchLocations, locationCatalogue,
  CITIES, STATES, MICROMARKETS, CITY_MIN_LISTINGS, POPULAR_LOCATION_IDS, popularLocations,
  renderNavigation, navigationGuide } = compiled.exports;

const place = (canonical, slug, count = 3) => ({ canonical, slug, count });
const fixture = () => createLocationCatalogue({ cityMinListings: 3,
  states: [place('Delhi', 'delhi'), place('Karnataka', 'karnataka'), place('Empty', 'empty', 0)],
  cities: [place('Delhi', 'delhi'), place('Bengaluru', 'bengaluru'), place('Thin', 'thin', 2),
    place('Bengaluru', 'bengaluru'), place('Bad', '../bad'), place('No count', 'no-count', NaN),
    place('Chhatrapati Sambhajinagar / Aurangabad', 'chhatrapati-sambhajinagar--aurangabad')],
  micromarkets: [
    { ...place('Industrial Area', 'industrial-area'), parentCity: 'Bengaluru', citySlug: 'bengaluru' },
    { ...place('Industrial Area', 'industrial-area'), parentCity: 'Delhi', citySlug: 'delhi' },
    { ...place('Reserved', 'peb'), parentCity: 'Delhi', citySlug: 'delhi' },
    { ...place('Orphan', 'orphan'), parentCity: '', citySlug: '' },
  ],
});

test('catalogue advertises exactly the existing generated locations and city threshold', () => {
  assert.equal(locationCatalogue.states.length, STATES.filter(p => p.count > 0).length);
  assert.equal(locationCatalogue.cities.length, CITIES.filter(p => p.count >= CITY_MIN_LISTINGS).length);
  assert.equal(locationCatalogue.micromarkets.length, MICROMARKETS.length);
  const all = Object.values(locationCatalogue).flat();
  assert.equal(new Set(all.map(p => p.id)).size, all.length);
  assert.equal(new Set(all.map(p => p.href)).size, all.length);
  for (const p of all) assert.match(p.href, /^\/listings\/(state|city)\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/);
});

test('cities, states and same-named markets keep distinct destinations', () => {
  const data = fixture();
  assert.equal(data.states[0].href, '/listings/state/delhi');
  assert.equal(data.cities.find(p => p.label === 'Delhi').href, '/listings/city/delhi');
  assert.deepEqual(data.micromarkets.map(p => p.href), [
    '/listings/city/bengaluru/industrial-area', '/listings/city/delhi/industrial-area',
  ]);
});

test('thin inventory, duplicate records, invalid paths, reserved types and orphan markets are omitted', () => {
  const data = fixture();
  assert.deepEqual(data.cities.map(p => p.slug), ['bengaluru', 'chhatrapati-sambhajinagar--aurangabad', 'delhi']);
  assert.equal(data.states.length, 2);
  assert.equal(data.micromarkets.length, 2);
});

test('featured lists preserve build-time popularity without re-sorting or pinning places', () => {
  for (const category of ['states', 'cities', 'micromarkets']) {
    assert.deepEqual(popularLocations[category].map(p => p.id), POPULAR_LOCATION_IDS[category]);
    assert.equal(popularLocations[category].length, category === 'micromarkets' ? 5 : 6);
  }
  const data = fixture();
  assert.deepEqual(featuredLocations(data, 'cities', [
    'cities/delhi', 'cities/missing', 'cities/bengaluru', 'cities/delhi', 'states/delhi',
  ]).map(p => p.slug), ['delhi', 'bengaluru']);
  assert.deepEqual(featuredLocations(data, 'cities', []), []);
  assert.deepEqual(featuredLocations({ states: [], cities: [], micromarkets: [] }, 'cities', ['cities/delhi']), []);
});

test('search supports aliases, case, punctuation, parent city and multiple words without changing links', () => {
  const data = fixture();
  assert.equal(searchLocations(data, '  BANGALORE  ', 'cities')[0].href, '/listings/city/bengaluru');
  assert.equal(searchLocations(data, 'bangalore industrial', 'micromarkets')[0].href, '/listings/city/bengaluru/industrial-area');
  assert.equal(searchLocations(data, 'Chhatrapati / Aurangabad', 'cities').length, 1);
  assert.equal(searchLocations(data, 'indústrial', 'micromarkets').length, 2);
  assert.equal(searchLocations(data, 'unmatched query').length, 0);
  assert.equal(searchLocations(data, '  ').length, Object.values(data).flat().length);
  assert.equal(searchLocations(data, 'delhi').length, 3, 'cross-category search is ready for a future header control');
});

const market = { name: 'Kompally', slug: 'kompally', parentCity: 'Hyderabad', citySlug: 'hyderabad',
  stateSlug: 'telangana', hasPage: true, listings: 50 };
const article = { citySlug: 'hyderabad', slug: 'kompally', heroProse: 'Large article body',
  heroImage: { url: 'https://example.test/kompally.webp', alt: 'Kompally warehouse', width: 1600, height: 1200 } };

test('featured guide uses published content and canonical eligible geography, without bundling article copy', () => {
  const guide = selectNavigationGuide([article], [market]);
  assert.equal(guide.href, '/overview/telangana/hyderabad/kompally');
  assert.deepEqual(guide.image, article.heroImage);
  assert.ok(!JSON.stringify(guide).includes('Large article body'));
  if (navigationGuide) assert.match(navigationGuide.href, /^\/overview\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/);
});

test('unpublished, delisted, mismatched, or invalid guide paths yield the assistance card', () => {
  assert.equal(selectNavigationGuide([], [market]), null);
  assert.equal(selectNavigationGuide([article], [{ ...market, hasPage: false }]), null);
  assert.equal(selectNavigationGuide([article], [{ ...market, stateSlug: null }]), null);
  assert.equal(selectNavigationGuide([article], [{ ...market, stateSlug: '../bad' }]), null);
  assert.equal(selectNavigationGuide([{ ...article, citySlug: 'another-city' }], [market]), null);
  assert.equal(selectNavigationGuide([article], []), null);
});

test('guide selection is stable and missing photographs never become broken image elements', () => {
  const next = { ...market, slug: 'medchal', name: 'Medchal', listings: 200 };
  const pages = [article, { citySlug: 'hyderabad', slug: 'medchal' }];
  assert.equal(selectNavigationGuide(pages, [next, market]).label, 'Kompally');
  assert.equal(selectNavigationGuide(pages.slice(1), [next, market]).label, 'Medchal');
  assert.equal(selectNavigationGuide([{ ...article, heroImage: undefined }], [market]).image, undefined);
  assert.equal(selectNavigationGuide([{ ...article, heroImage: { url: 'javascript:bad', alt: 'Bad' } }], [market]).image, undefined);
});

const descendants = node => (node.childNodes ?? []).flatMap(child => [child, ...descendants(child)]);
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;

test('navbar server-renders with native links, closed disclosures and unique IDs when a loading header coexists', () => {
  const nodes = descendants(parseFragment(renderNavigation()));
  const anchors = nodes.filter(n => n.tagName === 'a');
  for (const href of ['/', '/listings', '/blogs', '/about-us', '/request-warehouse']) {
    assert.equal(anchors.filter(n => attr(n, 'href') === href).length, 2);
  }
  assert.equal(anchors.filter(n => attr(n, 'href') === '/casestudies').length, 0);
  assert.ok(!nodes.some(n => attr(n, 'role') === 'menu'), 'ordinary navigation keeps native link semantics');
  assert.ok(!nodes.some(n => attr(n, 'role') === 'dialog'), 'closed mobile content is not in initial focus order');
  const ids = nodes.map(n => attr(n, 'id')).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length);
  const controlled = nodes.filter(n => attr(n, 'aria-controls'));
  assert.equal(controlled.length, 2);
  for (const trigger of controlled) {
    assert.equal(attr(trigger, 'aria-expanded'), 'false');
    assert.ok(nodes.some(n => attr(n, 'id') === attr(trigger, 'aria-controls') && attr(n, 'hidden') !== undefined));
  }
  for (const anchor of anchors) assert.ok(!descendants(anchor).some(n => ['a', 'button'].includes(n.tagName)));
});
