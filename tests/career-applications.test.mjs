import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const { outputFiles } = await build({ entryPoints: ['src/services/careerApplications.ts'], bundle: true, write: false, platform: 'node', format: 'esm',
  alias: { '@': process.cwd() + '/src' }, define: { 'import.meta.env.VITE_API_BASE_URL': '"https://backend.example.test"' } });
const { submitCareerApplication: submit, validateCareerApplication: validate } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const valid = { name: ' Asha ', email: ' asha@example.com ', phoneNumber: '', note: ' Marketing ' };

test('careers sends no sales attribution and requires an explicit successful acknowledgement', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://backend.example.test/career-applications');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { name: 'Asha', email: 'asha@example.com', phoneNumber: '', note: 'Marketing' });
    return Response.json({ success: true }, { status: 201 });
  });
  assert.deepEqual(await submit({ ...valid, source: 'homepage', gclid: 'sales-click', pagePath: '/careers' }), { success: true });
  for (const [status, body] of [[200, {}], [400, { success: true }], [500, { error: 'private server detail' }], [429, {}]]) {
    fetch.mock.mockImplementation(async () => Response.json(body, { status }));
    const result = await submit(valid); assert.equal(result.success, false);
    assert.doesNotMatch(result.error, /private server detail/);
    if (status === 429) assert.match(result.error, /Too many attempts/);
  }
});

test('server field validation is bounded and network errors preserve a retry path', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ fieldErrors: { email: 'Use a valid email.', unknown: 'ignore', note: 'x'.repeat(500) } }, { status: 400 }));
  const result = await submit(valid);
  assert.equal(result.fieldErrors.email, 'Use a valid email.'); assert.equal(result.fieldErrors.unknown, undefined); assert.equal(result.fieldErrors.note.length, 240);
  fetch.mock.mockImplementation(async () => { throw new Error('offline'); });
  assert.match((await submit(valid)).error, /details are still here/);
});

test('CMS previews cannot post applications even if called outside the component', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { pathname: '/preview/cms' } } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'window', previous); else delete globalThis.window; });
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('No network allowed'); });
  assert.equal((await submit(valid)).success, false); assert.equal(fetch.mock.callCount(), 0);
});

test('client validation supports optional fields and international phone formatting', () => {
  assert.deepEqual(validate(valid), {});
  assert.deepEqual(validate({ ...valid, phoneNumber: '+91 (98765) 43210' }), {});
  for (const [key, value] of [['name', ' '], ['name', 'x'.repeat(101)], ['email', 'invalid'], ['phoneNumber', '123'], ['phoneNumber', '9'.repeat(16)], ['phoneNumber', 'abc9876543210'], ['note', 'x'.repeat(2001)]]) {
    assert.ok(validate({ ...valid, [key]: value })[key], key);
  }
});
