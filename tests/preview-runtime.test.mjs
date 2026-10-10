import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { act } from 'react';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
async function bundle(contents) {
  const { outputFiles } = await build({
    stdin: { contents, loader: 'tsx', resolveDir: root },
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    alias: { '@': root + 'src' },
    define: { __DEV_SERVER__: 'false', 'import.meta.env': '{"SSR":false,"PROD":true,"DEV":false,"VITE_API_BASE_URL":"https://fixture.invalid"}' },
    plugins: [{ name: 'build-cutoff', setup(builder) {
      builder.onLoad({ filter: /warehouse-build\.generated\.json$/ }, () => ({ contents: '{"maxId":42}', loader: 'json' }));
    } }],
  });
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, loaded, loaded.exports);
  return loaded.exports;
}

const rows = Array.from({ length: 505 }, (_, i) => ({ id: 41 + i, city: i < 4 ? 'Bengaluru' : 'New City',
  state: 'Karnataka', warehouseType: 'PEB', totalSpaceSqft: [12000], ratePerSqft: '25',
  photos: [], images: [{ originalUrl: `https://fixture.invalid/warehouse-${41 + i}.jpg`, webpUrl: null }] }));
const stats = inventory => ({ listings: inventory.length, measured: inventory.length, listingIds: inventory.map(row => row.id),
  rent: { min: 25, median: 25, max: 25 }, size: { min: 12000, median: 12000, max: 12000 },
  clearHeight: null, docksMedian: null, fireNoc: 0, commercialClu: 0, construction: [], flooring: [], peers: [] });
const cities = [
  { ...stats(rows.slice(0, 4)), kind: 'CITY', name: 'Bengaluru', slug: 'bengaluru', parentState: 'Karnataka', stateSlug: 'karnataka', hasPage: true },
  { ...stats(rows.slice(4)), kind: 'CITY', name: 'New City', slug: 'new-city', parentState: 'Karnataka', stateSlug: 'karnataka', hasPage: true },
];
const state = { ...stats(rows), kind: 'STATE', name: 'Karnataka', slug: 'karnataka', parentState: null, stateSlug: null, hasPage: true };
const market = { ...stats(rows.slice(4)), name: 'New Market', slug: 'new-market', parentCity: 'New City', citySlug: 'new-city',
  parentState: 'Karnataka', stateSlug: 'karnataka', hasPage: true };
const copy = { seoTitle: 'Preview title', metaDescription: 'Description', h1: 'Draft heading', heroProse: 'Draft introduction', faqs: [], relatedBlogs: [] };

for (const first of ['published', 'preview']) test(`${first} first: previews include new city/state/micromarket inventory without contaminating published reads`, async t => {
  const app = await bundle("export { previewEditorialPage, getAllWarehouses } from './src/loaders/locationLoader';");
  const requests = [];
  t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(input);
    if (url.pathname === '/locations') return Response.json({ data: { cities, states: [state] } });
    if (url.pathname === '/micromarkets') return Response.json({ data: [market] });
    assert.equal(url.pathname, '/warehouses');
    requests.push(url);
    const eligible = rows.filter(row => !url.searchParams.has('maxId') || row.id <= Number(url.searchParams.get('maxId')));
    const page = Number(url.searchParams.get('page')), size = Number(url.searchParams.get('pageSize'));
    return Response.json({ data: eligible.slice((page - 1) * size, page * size),
      pagination: { currentPage: page, pageSize: size, totalItems: eligible.length, totalPages: Math.ceil(eligible.length / size) } });
  });
  const published = async () => assert.deepEqual((await app.getAllWarehouses()).map(row => row.id), [41, 42]);
  if (first === 'published') await published();
  for (const [type, identity, expected] of [
    ['city', { kind: 'CITY', slug: 'bengaluru' }, rows.slice(0, 4)],
    ['city', { kind: 'CITY', slug: 'new-city' }, rows.slice(4)],
    ['state', { kind: 'STATE', slug: 'karnataka' }, rows],
    ['micromarket', { citySlug: 'new-city', slug: 'new-market' }, rows.slice(4)],
  ]) {
    const data = await app.previewEditorialPage({ type, content: { ...copy, ...identity } });
    assert.deepEqual(data.warehouses.map(row => row.id), expected.map(row => row.id), `${type}/${identity.slug}`);
    assert.equal(data.stats.listings, expected.length);
    if (type === 'state') assert.ok(data.stateOverview.cities.find(city => city.slug === 'new-city').image, 'new city cards need current photos too');
  }
  await published();
  assert.deepEqual(requests.filter(url => url.searchParams.has('maxId')).map(url => url.searchParams.get('maxId')), ['42']);
  assert.deepEqual(requests.filter(url => !url.searchParams.has('maxId')).map(url => url.searchParams.get('page')), ['1', '2']);
});

const auth = await bundle(`
  import {createRoot} from 'react-dom/client';
  import {createMemoryRouter, RouterProvider} from 'react-router-dom';
  import {AuthProvider, useAuth} from './src/context/AuthContext';
  function Probe({loginToken}) {
    const {user, token, isAuthenticated, login, logout} = useAuth();
    return <><output>{JSON.stringify({user, token, isAuthenticated})}</output>
      <button id="login" onClick={() => login(loginToken, {name:'Replacement'})}>Login</button>
      <button id="logout" onClick={logout}>Logout</button></>;
  }
  export function mount(element, path, loginToken) {
    const router = createMemoryRouter([{path:'*', element:<AuthProvider><Probe loginToken={loginToken}/></AuthProvider>}], {initialEntries:[path]});
    const view = createRoot(element); view.render(<RouterProvider router={router}/>);
    return {view, router};
  }
`);
const validToken = Buffer.from('{"alg":"none"}').toString('base64url') + '.'
  + Buffer.from('{"name":"Website User","role":"user"}').toString('base64url') + '.test';
const replacementToken = Buffer.from('{"alg":"none"}').toString('base64url') + '.'
  + Buffer.from('{"name":"Replacement","role":"user"}').toString('base64url') + '.test';

function browser(t, path, token) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://wareongo.com' + path });
  const globals = { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage,
    navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true };
  const prior = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  dom.window.localStorage.setItem('authToken', token);
  t.after(() => {
    dom.window.close();
    for (const [key, descriptor] of Object.entries(prior)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return dom;
}

for (const path of ['/preview/cms', '/preview/ad-pages/bangalore'])
  for (const token of [validToken, 'invalid-token']) test(`${path}: preview auth never reads or writes ${token === validToken ? 'valid' : 'invalid'} website credentials`, async t => {
    const dom = browser(t, path, token), storage = dom.window.Storage.prototype;
    const read = storage.getItem, calls = [];
    for (const name of ['getItem', 'setItem', 'removeItem']) {
      const method = storage[name];
      t.mock.method(storage, name, function (...args) { calls.push([name, ...args]); return method.apply(this, args); });
    }
    let mounted;
    await act(async () => { mounted = auth.mount(document.getElementById('root'), path, replacementToken); });
    try {
      assert.deepEqual(JSON.parse(document.querySelector('output').textContent), { user: null, token: null, isAuthenticated: false });
      await act(async () => document.getElementById('login').click());
      await act(async () => document.getElementById('logout').click());
      assert.deepEqual(calls.filter(([, key]) => key === 'authToken'), []);
      assert.equal(read.call(localStorage, 'authToken'), token);
    } finally { await act(async () => mounted.view.unmount()); mounted.router.dispose(); }
  });

test('website auth survives entering/leaving previews and still supports normal login/logout', async t => {
  browser(t, '/blogs/test', validToken);
  let mounted;
  await act(async () => { mounted = auth.mount(document.getElementById('root'), '/blogs/test', replacementToken); });
  const snapshot = () => JSON.parse(document.querySelector('output').textContent);
  try {
    assert.equal(snapshot().user.name, 'Website User');
    await act(async () => mounted.router.navigate('/preview/cms'));
    assert.equal(snapshot().isAuthenticated, false);
    assert.equal(localStorage.getItem('authToken'), validToken);
    await act(async () => mounted.router.navigate('/blogs/test'));
    assert.equal(snapshot().user.name, 'Website User');
    await act(async () => document.getElementById('logout').click());
    assert.equal(snapshot().isAuthenticated, false);
    assert.equal(localStorage.getItem('authToken'), null);
    await act(async () => document.getElementById('login').click());
    assert.equal(localStorage.getItem('authToken'), replacementToken);
    assert.equal(snapshot().user.name, 'Replacement');
    assert.equal(snapshot().isAuthenticated, true);
    await act(async () => mounted.router.navigate('/preview/ad-pages/bangalore'));
    assert.equal(snapshot().isAuthenticated, false);
    assert.equal(localStorage.getItem('authToken'), replacementToken);
  } finally { await act(async () => mounted.view.unmount()); mounted.router.dispose(); }
});
