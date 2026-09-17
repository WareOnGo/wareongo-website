import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

async function analytics({ prod = true, hostname = 'wareongo.com', testMode = false, productionBundle = false, browser = {} } = {}) {
  const { outputFiles } = await build({ entryPoints: ['src/lib/analytics.ts'], bundle: true, write: false, format: 'esm',
    drop: productionBundle ? ['console', 'debugger'] : [], minify: productionBundle,
    define: { 'import.meta.env.PROD': String(prod), 'import.meta.env.DEV': String(!prod) } });
  const scripts = [];
  const logs = [];
  globalThis.window = { location: { hostname, href: `https://${hostname}/`, pathname: '/' },
    console: { log: (...args) => logs.push(args) }, __WAREONGO_ANALYTICS_TEST__: testMode, ...browser };
  globalThis.document = { title: '', referrer: 'https://www.google.com/search?q=private', createElement: () => ({}), head: { appendChild: el => scripts.push(el) } };
  globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  const mod = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text + `\n// instance ${Math.random()}`).toString('base64'));
  const calls = () => (window.dataLayer || []).map(x => Array.from(x));
  return { ...mod, calls, scripts, logs };
}

test('production tag only loads on approved hosts; dev and previews never send', async () => {
  for (const options of [{ prod: false }, { hostname: 'preview.vercel.app' }, { hostname: 'localhost' }]) {
    const a = await analytics(options); a.recordAnalyticsPage('Test'); a.trackEvent('cta_click', { label: 'Test' });
    assert.equal(a.scripts.length, 0); assert.equal(a.calls().length, 0);
  }
  const a = await analytics({ prod: false, testMode: true }); a.recordAnalyticsPage('Test');
  assert.equal(a.scripts.length, 0); assert.equal(a.calls().filter(c => c[0] === 'config').length, 1);
});

test('automatic page views have one config owner and resolved context on SPA events', async () => {
  const a = await analytics(); a.recordAnalyticsPage('Home'); a.recordAnalyticsPage('Home');
  window.location.href = 'https://wareongo.com/about-us'; window.location.pathname = '/about-us';
  a.recordAnalyticsPage('About'); a.trackEvent('cta_click', { label: 'Contact' });
  window.location.href = 'https://wareongo.com/'; a.recordAnalyticsPage('Home');
  const calls = a.calls();
  assert.equal(calls.filter(c => c[0] === 'config').length, 1);
  assert.equal(calls.filter(c => c[1] === 'page_view').length, 0);
  assert.equal(a.scripts.length, 1);
  const event = calls.find(c => c[0] === 'event');
  assert.equal(event[2].page_title, 'About'); assert.equal(event[2].page_referrer, 'https://wareongo.com/');
  assert.equal(document.title, 'Home');
});

test('safe URL drops secrets, unknown query keys, fragments, credentials and unknown routes', async () => {
  const a = await analytics();
  assert.equal(a.safeUrl('https://user:pass@wareongo.com/listings?city=Bangalore&token=secret&email=a%40b.com&utm_source=google#email'), 'https://wareongo.com/listings?city=Bangalore&utm_source=google');
  assert.equal(a.safeUrl('https://wareongo.com/reset/sensitive-token'), 'https://wareongo.com/other');
  assert.equal(a.safeUrl('mailto:a@b.com'), '');
});

test('service navigation retains its page identity and strips private query values', async () => {
  const a = await analytics();
  for (const slug of ['warehouse-search', 'build-to-suit', 'lease-negotiation', 'compliance-procurement']) {
    const path = `/services/${slug}`;
    assert.equal(a.pageType(path), 'service');
    assert.equal(a.safeUrl(`https://wareongo.com${path}?email=private%40example.com`), `https://wareongo.com${path}`);
  }
  assert.equal(a.safeUrl('https://wareongo.com/services/private-token'), 'https://wareongo.com/other');
});

test('normalization separates placement and rank, normalizes markets, and drops raw values/errors', async () => {
  const a = await analytics();
  const p = a.normalizeAnalytics({ warehouse_id: 12, city: 'Bangalore', position: 2, contact_type: 'email', value: 'sales@wareongo.com', location: 'footer', error_message: 'secret', companyName: 'private', arbitrary: 42 });
  assert.deepEqual(p, { warehouse_id: '12', list_position: 2, warehouse_city: 'bengaluru', contact_method: 'email', contact_target: 'sales_email', placement: 'footer' });
  assert.deepEqual(a.normalizeAnalytics({ position: 'header_mobile' }), { placement: 'header', navigation_variant: 'mobile' });
});

test('request CTA origin is consumed once and success payload never includes customer inputs', async () => {
  const a = await analytics(); a.recordAnalyticsPage('Home');
  a.trackEvent('nav_click', { destination: '/request-warehouse', placement: 'hero' });
  assert.equal(a.calls().at(-1)[1], 'cta_click');
  const origin = a.takeLeadOrigin(); assert.equal(origin.origin_placement, 'hero'); assert.deepEqual(a.takeLeadOrigin(), {});
  a.trackEvent('generate_lead', { ...origin, form_id: 'warehouse_request', lead_type: 'warehouse_request', name: 'Private', email: 'test@example.com', companyName: 'Secret Ltd' });
  assert.ok(!JSON.stringify(a.calls().at(-1)).includes('Private')); assert.ok(!JSON.stringify(a.calls().at(-1)).includes('Secret'));
});

test('review logs retain final event parameters and page context in production and no-send previews', async () => {
  for (const options of [{ productionBundle: true }, { prod: false }, { hostname: 'preview.vercel.app', productionBundle: true }]) {
    const a = await analytics(options);
    a.recordAnalyticsPage('Home');
    const firstPageLog = a.logs.find(log => log[1] === 'set');
    a.recordAnalyticsPage('Updated home');
    assert.equal(firstPageLog[2].page_title, 'Home', 'logs retain the parameters from the time of the action');
    window.location.href = `https://${window.location.hostname}/listings?city=Bangalore&email=private%40example.com`;
    a.recordAnalyticsPage('Listings');
    a.trackEvent('listing_gallery_interaction', { placement: 'warehouse_card', warehouse_id: 12, city: 'Bangalore',
      action: 'next', image_index: 2, email: 'private@example.com', companyName: 'Private Company' });
    const log = a.logs.at(-1);
    assert.equal(log[1], 'event'); assert.equal(log[2], 'listing_gallery_interaction');
    assert.deepEqual(log[3], { page_location: `https://${window.location.hostname}/listings?city=Bangalore`,
      page_path: '/listings?city=Bangalore', page_title: 'Listings', page_referrer: `https://${window.location.hostname}/`,
      page_type: 'listings', placement: 'warehouse_card', warehouse_id: '12', warehouse_city: 'bengaluru',
      action: 'next', image_index: 2, transport_type: 'beacon' });
    assert.doesNotMatch(JSON.stringify(a.logs), /private@example|Private Company/);
    if (a.analyticsEnabled()) {
      assert.equal(log[0], '[GA4] command');
      assert.deepEqual(log.slice(1), a.calls().at(-1));
    } else {
      assert.equal(log[0], '[GA4] preview (sending disabled)');
      assert.equal(a.calls().length, 0); assert.equal(a.scripts.length, 0);
    }
    a.trackEvent('nav_click', { destination: '/request-warehouse', placement: 'hero' });
    assert.equal(a.logs.at(-1)[2], 'cta_click', 'the log uses the normalized event name');
    assert.equal(a.logs.at(-1)[3].cta_id, 'request_warehouse');
  }
});

test('automatic request logging decodes batches and preserves native transports without observing unrelated requests', async () => {
  const forwarded = [];
  const fetchResult = Promise.resolve({ ok: true });
  let resources;
  class XHR {
    open(...args) { forwarded.push(['open', this, ...args]); }
    send(...args) { forwarded.push(['send', this, ...args]); }
  }
  const a = await analytics({ browser: {
    navigator: { sendBeacon(...args) { forwarded.push(['beacon', this, ...args]); return false; } },
    fetch(...args) { forwarded.push(['fetch', this, ...args]); return fetchResult; },
    XMLHttpRequest: XHR,
    PerformanceObserver: class { constructor(callback) { resources = callback; } observe() {} },
  } });
  a.recordAnalyticsPage('Home');
  const wrappedFetch = window.fetch;
  a.trackEvent('faq_open', { question_id: 'one' });
  assert.equal(window.fetch, wrappedFetch, 'install only once per document');
  const url = 'https://region1.google-analytics.com/g/collect?v=2&tid=G-X1FJP93CV6&dl=https%3A%2F%2Fwareongo.com%2F&dt=Home';
  const body = 'en=scroll&epn.percent_scrolled=90\nen=click&ep.link_url=https%3A%2F%2Fexample.com%2F&ep.outbound=true';
  const init = { method: 'POST', body, keepalive: true };
  assert.equal(window.fetch(url, init), fetchResult);
  assert.deepEqual(forwarded.at(-1), ['fetch', window, url, init]);
  const beaconBody = new URLSearchParams('en=page_view');
  assert.equal(window.navigator.sendBeacon(url, beaconBody), false);
  assert.deepEqual(forwarded.at(-1), ['beacon', window.navigator, url, beaconBody]);
  const xhr = new window.XMLHttpRequest();
  xhr.open('POST', url, true, 'user', 'pass');
  assert.deepEqual(forwarded.at(-1), ['open', xhr, 'POST', url, true, 'user', 'pass']);
  const buffer = new TextEncoder().encode('en=form_start&ep.form_id=header_contact');
  xhr.send(buffer);
  assert.deepEqual(forwarded.at(-1), ['send', xhr, buffer]);
  resources({ getEntries: () => [{ initiatorType: 'img', name: `${url}&en=user_engagement&_et=1234` },
    { initiatorType: 'fetch', name: `${url}&en=scroll` }] });
  const logs = a.logs.filter(log => log[0] === '[GA4] request');
  assert.deepEqual(logs.map(log => log[1]), ['scroll', 'click', 'page_view', 'form_start', 'user_engagement']);
  assert.equal(logs[0][2].percent_scrolled, 90);
  assert.equal(logs[0][2].page_title, 'Home');
  assert.equal(logs[1][2].link_url, 'https://example.com/');
  assert.equal(logs[1][3].raw_parameters['ep.outbound'], 'true');
  assert.equal(logs[4][2].engagement_time_msec, '1234');
  assert.deepEqual(logs.map(log => log[3].transport), ['fetch', 'fetch', 'sendBeacon', 'XMLHttpRequest', 'image']);
  const count = a.logs.length;
  const privateRequest = new Request('https://api.wareongo.com/enquiries', { method: 'POST', body: 'Private Customer' });
  privateRequest.clone = () => { throw new Error('must not inspect application request bodies'); };
  window.fetch(privateRequest);
  window.fetch(url.replace('G-X1FJP93CV6', 'G-OTHER'), init);
  window.fetch(url.replace('google-analytics.com', 'google-analytics.com.example.com'), init);
  assert.equal(a.logs.length, count);
  assert.equal(await privateRequest.text(), 'Private Customer');
  assert.equal(a.calls().filter(call => call[0] === 'event').length, 1, 'observing requests never emits events');
});

test('Blob and Request bodies are logged asynchronously without consuming the original request', { timeout: 2000 }, async () => {
  const a = await analytics({ browser: { navigator: { sendBeacon: () => true }, fetch: () => Promise.resolve({ ok: true }) } });
  a.recordAnalyticsPage('Home');
  const url = 'https://www.google-analytics.com/g/collect?tid=G-X1FJP93CV6';
  const nextLog = () => new Promise(resolve => {
    window.console.log = (...args) => { a.logs.push(args); if (args[0] === '[GA4] request') resolve(args); };
  });
  let logged = nextLog();
  window.navigator.sendBeacon(url, new Blob(['en=click&ep.link_domain=example.com']));
  assert.equal((await logged)[2].link_domain, 'example.com');
  const request = new Request(url, { method: 'POST', body: 'en=page_view&dt=Review' });
  logged = nextLog();
  await window.fetch(request);
  assert.equal(request.bodyUsed, false);
  assert.equal((await logged)[2].page_title, 'Review');
  assert.equal(await request.text(), 'en=page_view&dt=Review');
});

test('review logging remains inert during SSR and cannot break tracking if the console throws', async () => {
  const a = await analytics();
  window.console.log = () => { throw new Error('unavailable console'); };
  a.recordAnalyticsPage('Home');
  a.trackEvent('cta_click', { label: 'Contact' });
  assert.equal(a.calls().at(-1)[1], 'cta_click');
  delete globalThis.window;
  assert.doesNotThrow(() => { a.recordAnalyticsPage('SSR'); a.trackEvent('cta_click', { label: 'SSR' }); });
});
