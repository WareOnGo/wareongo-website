import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

async function analytics({ prod = true, hostname = 'wareongo.com', testMode = false } = {}) {
  const { outputFiles } = await build({ entryPoints: ['src/lib/analytics.ts'], bundle: true, write: false, format: 'esm', define: { 'import.meta.env.PROD': String(prod), 'import.meta.env.DEV': String(!prod) } });
  const scripts = [];
  globalThis.window = { location: { hostname, href: `https://${hostname}/`, pathname: '/' }, __WAREONGO_ANALYTICS_TEST__: testMode };
  globalThis.document = { title: '', referrer: 'https://www.google.com/search?q=private', createElement: () => ({}), head: { appendChild: el => scripts.push(el) } };
  globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  const mod = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text + `\n// instance ${Math.random()}`).toString('base64'));
  const calls = () => (window.dataLayer || []).map(x => Array.from(x));
  return { ...mod, calls, scripts };
}

test('production tag only loads on approved hosts; dev and previews are silent', async () => {
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
