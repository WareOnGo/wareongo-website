import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const bundled = build({
  stdin: { contents: `
    export { getLeadAttribution } from './src/lib/leadAttribution';
    export { submitContactForm } from './src/services/formSubmission';
    export { submitWarehouseRequest } from './src/services/warehouseRequest';
  `, resolveDir: process.cwd() },
  bundle: true, write: false, format: 'esm',
  alias: { '@': process.cwd() + '/src' },
  define: { 'import.meta.env.VITE_API_BASE_URL': '"https://backend.example.test"' },
});
let instance = 0;
async function app() {
  const { outputFiles } = await bundled;
  return import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text + `\n// ${instance++}`).toString('base64'));
}
function browser(t, path = '/') {
  const dom = new JSDOM('', { url: 'https://wareongo.com' + path });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: dom.window });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete globalThis.window;
    dom.window.close();
  });
  return dom.window;
}

test('Google click ID survives navigation, independently loaded bundles and long real-world IDs', async t => {
  const gclid = 'AbCd_-'.repeat(40);
  const window = browser(t, '/bangalore?gclid=' + gclid + '&email=private%40example.com');
  const first = await app();
  assert.deepEqual(first.getLeadAttribution(), { gclid, pagePath: '/bangalore' });
  window.history.pushState({}, '', '/warehouse/42');
  assert.deepEqual(first.getLeadAttribution(), { gclid, pagePath: '/warehouse/42' });
  const second = await app();
  assert.equal(second.getLeadAttribution().gclid, gclid);
  window.history.pushState({}, '', '/?gclid=new-click');
  assert.equal(second.getLeadAttribution().gclid, 'new-click');
  window.history.pushState({}, '', '/request-warehouse');
  assert.deepEqual(second.getLeadAttribution(), { gclid: 'new-click', pagePath: '/request-warehouse' });
  assert.equal(window.sessionStorage.length, 1);
  assert.doesNotMatch(JSON.stringify(second.getLeadAttribution()), /private|email/);
});

test('SSR, missing attribution and blocked browser storage never prevent submission', async t => {
  const server = await app();
  assert.deepEqual(server.getLeadAttribution(), {});
  const window = browser(t);
  const module = await app();
  assert.deepEqual(module.getLeadAttribution(), { pagePath: '/' });
  Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } });
  window.history.pushState({}, '', '/?gclid=available-click');
  assert.equal(module.getLeadAttribution().gclid, 'available-click');
  window.history.pushState({}, '', '/request-warehouse');
  assert.equal(module.getLeadAttribution().gclid, 'available-click');
});

test('a form loaded before a newer ad click submits the latest attribution captured by another bundle', async t => {
  const window = browser(t, '/?gclid=old-click');
  const form = await app();
  form.getLeadAttribution();
  const analytics = await app();
  window.history.pushState({}, '', '/bangalore?gclid=new-click');
  analytics.getLeadAttribution();
  window.history.pushState({}, '', '/request-warehouse');
  let payload;
  const fetch = t.mock.method(globalThis, 'fetch', async (_, options) => {
    payload = JSON.parse(options.body);
    return Response.json({ id: 42 }, { status: 201 });
  });
  const result = await form.submitContactForm({ name: 'Asha', phone: '9876543210', source: 'homepage' });
  assert.equal(result.success, true);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(payload.gclid, 'new-click');
});

test('separate bundles share the current click even when browser storage is blocked', async t => {
  const window = browser(t, '/?gclid=available-click');
  Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } });
  (await app()).getLeadAttribution();
  window.history.pushState({}, '', '/warehouse/42');
  assert.deepEqual((await app()).getLeadAttribution(), { gclid: 'available-click', pagePath: '/warehouse/42' });
});

test('a failed storage write cannot restore an older click over the latest click', async t => {
  const window = browser(t, '/?gclid=old-click');
  const first = await app();
  first.getLeadAttribution();
  t.mock.method(window.Storage.prototype, 'setItem', () => { throw new Error('Quota exceeded'); });
  window.history.pushState({}, '', '/?gclid=new-click');
  first.getLeadAttribution();
  window.history.pushState({}, '', '/warehouse/42');
  assert.equal((await app()).getLeadAttribution().gclid, 'new-click');
});

test('nullable optional form fields still reach the backend', async t => {
  browser(t);
  const module = await app();
  const fetch = t.mock.method(globalThis, 'fetch', async (_, options) => {
    const payload = JSON.parse(options.body);
    assert.equal(payload.companyName, undefined);
    assert.ok(payload.email == null || payload.email === '');
    return Response.json({ id: 1 }, { status: 201 });
  });
  for (const value of [undefined, null]) {
    const result = await module.submitContactForm({ name: 'Asha', phone: '9876543210',
      source: 'homepage', companyName: value, email: value });
    assert.equal(result.success, true);
    const request = await module.submitWarehouseRequest({ name: 'Asha', phone: '9876543210',
      company: 'Example', location: 'Bangalore', requirements: 'Loading docks', email: value });
    assert.equal(request.success, true);
  }
  assert.equal(fetch.mock.callCount(), 4);
});

test('invalid click IDs are omitted and preview pages do not capture or forward attribution', async t => {
  const window = browser(t, '/?gclid=invalid%0Avalue');
  let module = await app();
  assert.equal(module.getLeadAttribution().gclid, undefined);
  window.history.pushState({}, '', '/?gclid=' + 'x'.repeat(513));
  assert.equal(module.getLeadAttribution().gclid, undefined);
  window.sessionStorage.setItem('wareongo:lead:gclid', 'invalid value');
  module = await app();
  assert.equal(module.getLeadAttribution().gclid, undefined);
  window.history.pushState({}, '', '/preview/ad-pages/bangalore?gclid=preview-click');
  assert.deepEqual(module.getLeadAttribution(), { pagePath: '/preview/ad-pages/bangalore' });
  assert.notEqual(window.sessionStorage.getItem('wareongo:lead:gclid'), 'preview-click');
});

test('click ID character and length limits also apply to terminal newlines and restored session values', async t => {
  const window = browser(t);
  const module = await app();
  for (const invalid of ['looks-valid\n', 'looks-valid\r', 'looks-valid\r\n', 'x'.repeat(513)]) {
    window.history.replaceState({}, '', '/?gclid=' + encodeURIComponent(invalid));
    assert.equal(module.getLeadAttribution().gclid, undefined, JSON.stringify(invalid));
    assert.equal(window.sessionStorage.getItem('wareongo:lead:gclid'), null);
  }
  window.history.replaceState({}, '', '/');
  window.sessionStorage.setItem('wareongo:lead:gclid', 'looks-valid\n');
  assert.equal(module.getLeadAttribution().gclid, undefined);
  const longest = 'x'.repeat(512);
  window.history.replaceState({}, '', '/?gclid=' + longest);
  assert.equal(module.getLeadAttribution().gclid, longest);
});

test('every contact-form source forwards optional attribution through the existing endpoint', async t => {
  browser(t, '/bangalore?gclid=google-click');
  const module = await app();
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options, body: JSON.parse(options.body) });
    return Response.json({ id: 42 }, { status: 201 });
  });
  for (const source of ['homepage', 'warehouse-card-42-callback', 'warehouse-detail-42-callback',
    'bangalore-landing', 'bangalore-service-distribution', 'bangalore-landing-hoskote',
    'bangalore-available-requirements', 'bangalore-landing-warehouse-42']) {
    const company = /^warehouse-/.test(source) ? { companyName: 'Example' } : {};
    const result = await module.submitContactForm({ name: ' Asha ', phone: ' 9876543210 ', source, ...company });
    assert.deepEqual(result, { success: true, leadId: 'enquiry_42' });
    const last = requests.at(-1);
    assert.equal(last.url, 'https://backend.example.test/enquiries');
    assert.deepEqual(last.body, { name: 'Asha', phoneNumber: '9876543210', email: null, source,
      gclid: 'google-click', pagePath: '/bangalore', ...company });
    assert.equal(last.options.headers.Authorization, undefined, 'CRM credentials never belong in the browser');
  }
  await module.submitContactForm({ name: 'Asha', phone: '9876543210', source: 'homepage', companyName: ' Example ', email: ' asha@example.com ' });
  assert.equal(requests.at(-1).body.companyName, 'Example');
  assert.equal(requests.at(-1).body.email, 'asha@example.com');
});

test('both warehouse-request forms preserve their payloads and send gclid and email when available', async t => {
  const window = browser(t, '/bangalore?gclid=landing-click');
  const module = await app();
  module.getLeadAttribution();
  window.history.pushState({}, '', '/request-warehouse');
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return Response.json({ id: '9007199254740993' }, { status: 201 });
  });
  const base = { name: 'Asha', phone: '9876543210', company: 'Example', location: 'Bangalore' };
  await module.submitWarehouseRequest({ ...base, requirements: '24-hour access' });
  const plain = requests.at(-1);
  assert.equal(plain.url, 'https://backend.example.test/customer-requests');
  assert.equal(plain.body.additional_requirements, '24-hour access');
  assert.equal(plain.body.email, undefined);
  const requirements = JSON.stringify({ location: 'Bangalore', additionalComments: null,
    contact: { fullName: 'Asha', phone: '9876543210', email: 'asha@example.com', company: 'Example' } });
  const result = await module.submitWarehouseRequest({ ...base, requirements, email: ' asha@example.com ' });
  assert.deepEqual(result, { success: true, leadId: 'request_9007199254740993' });
  assert.equal(requests.at(-1).body.additional_requirements, requirements);
  assert.equal(requests.at(-1).body.email, 'asha@example.com');
  for (const { body } of requests) {
    assert.equal(body.gclid, 'landing-click');
    assert.equal(body.pagePath, '/request-warehouse');
  }
});

test('organic submissions omit gclid and retain existing success/error handling', async t => {
  browser(t, '/request-warehouse');
  const module = await app();
  const contact = { name: 'Asha', phone: '9876543210', source: 'homepage' };
  const fetch = t.mock.method(globalThis, 'fetch', async (_, options) => {
    assert.equal(JSON.parse(options.body).gclid, undefined);
    return Response.json({ error: 'Invalid phone' }, { status: 400 });
  });
  assert.deepEqual(await module.submitContactForm(contact), { success: false, error: 'Invalid phone', errorCode: 'validation_server' });
  fetch.mock.mockImplementation(async () => { throw new Error('offline'); });
  assert.equal((await module.submitContactForm(contact)).errorCode, 'network');
});
