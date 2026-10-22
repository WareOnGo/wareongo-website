import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';
import { analyticsBootstrapPlugin } from '../scripts/lib/analytics-bootstrap.mjs';
import { prioritizeAdPageHtml } from '../scripts/lib/critical-css.mjs';

const plugin = analyticsBootstrapPlugin();
plugin.configResolved({ root: process.cwd(), isProduction: true });
const [tag] = await plugin.transformIndexHtml.handler();
const boot = ({ url = 'https://wareongo.com/', title = 'WareOnGo', referrer = 'https://www.google.com/' } = {}) => new JSDOM(
  `<!doctype html><html><head><title>${title}</title></head><body><script>${tag.children}</script><main>SSG content</main></body></html>`,
  { url, referrer, runScripts: 'dangerously', virtualConsole: new VirtualConsole() },
);
const calls = dom => Array.from(dom.window.dataLayer || [], item => Array.from(item));

test('built HTML starts one tag with its rendered title and filtered acquisition URL before React', () => {
  const dom = boot({ url: 'https://wareongo.com/bangalore?utm_source=google&gclid=campaign-click&email=private%40example.com#form', title: 'Bangalore | WareOnGo' });
  try {
    const command = calls(dom);
    assert.equal(command.filter(c => c[0] === 'config').length, 1);
    assert.equal(command[0][1].page_title, 'Bangalore | WareOnGo');
    assert.equal(command[0][1].page_location, 'https://wareongo.com/bangalore?utm_source=google&gclid=campaign-click');
    assert.equal(command[0][1].page_referrer, 'https://www.google.com/');
    assert.equal(command[0][1].page_type, 'bangalore');
    assert.doesNotMatch(JSON.stringify(command), /private|email|#form/);
    assert.equal(dom.window.sessionStorage.getItem('wareongo:lead:gclid'), 'campaign-click');
    assert.equal(dom.window.document.querySelectorAll('script[src*="googletagmanager.com"]').length, 1);
    assert.equal(dom.window.__VITE_REACT_SSG_CONTEXT__, undefined);
    // A repeated entry (or later independently bundled code) must reuse ownership.
    dom.window.eval(tag.children);
    assert.equal(calls(dom).filter(c => c[0] === 'config').length, 1);
    assert.equal(dom.window.document.querySelectorAll('script[src*="googletagmanager.com"]').length, 1);
  } finally { dom.window.close(); }
});

test('the inline entry stays silent on preview paths and unapproved hosts', () => {
  for (const url of ['http://localhost:4187/', 'https://preview.vercel.app/', 'https://wareongo.com/preview/cms', 'https://wareongo.com/preview/ad-pages/bangalore']) {
    const dom = boot({ url, title: 'Private draft' });
    try {
      assert.equal(dom.window.dataLayer, undefined, url);
      assert.equal(dom.window.document.querySelectorAll('script[src]').length, 0, url);
    } finally { dom.window.close(); }
  }
});

test('untitled fallback documents do not emit an unresolved page view', () => {
  const dom = boot({ title: '' });
  try { assert.equal(dom.window.dataLayer, undefined); }
  finally { dom.window.close(); }
});

test('development builds do not inject the production tag bootstrap', async () => {
  const dev = analyticsBootstrapPlugin();
  dev.configResolved({ root: process.cwd(), isProduction: false });
  assert.deepEqual(await dev.transformIndexHtml.handler(), []);
});

for (const path of ['/bangalore/peenya', '/bangalore/hoskote', '/bangalore/nelamangala', '/bangalore/electronic-city-jigani-bommasandra', '/bangalore/sheds', '/hosur', '/hyderabad']) test(path + ' starts one tag first in the head with resolved metadata before hydration', () => {
  const html = prioritizeAdPageHtml(path + '/', `<!doctype html><html><head><title>Peenya &amp; WareOnGo</title><meta charset="UTF-8"></head><body><script id="wareongo-analytics-bootstrap">${tag.children}</script><script type="module" async src="/app.js"></script></body></html>`);
  assert.match(html, /<head><meta charset="UTF-8"><script data-page-title=/);
  assert.match(html, /defer fetchpriority="low"/);
  const dom = new JSDOM(html, { url: 'https://wareongo.com' + path + '?utm_source=google&email=private%40example.com', runScripts: 'dangerously', virtualConsole: new VirtualConsole() });
  try {
    const command = calls(dom);
    assert.equal(command.filter(call => call[0] === 'config').length, 1);
    assert.equal(command[0][1].page_title, 'Peenya & WareOnGo');
    assert.equal(command[0][1].page_type, 'micromarket_ad');
    assert.equal(command[0][1].page_location, 'https://wareongo.com' + path + '?utm_source=google');
    assert.equal(dom.window.document.querySelectorAll('title').length, 1);
    dom.window.eval(tag.children);
    assert.equal(calls(dom).filter(call => call[0] === 'config').length, 1);
    assert.equal(dom.window.document.querySelectorAll('script[src*="googletagmanager.com"]').length, 1);
  } finally { dom.window.close(); }
});
