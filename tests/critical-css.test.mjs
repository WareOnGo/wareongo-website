import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { loadConfigFromFile } from 'vite';
import { createCriticalCssProcessor } from '../scripts/lib/critical-css.mjs';

test('concurrent SSG and catalogue CSS requests retain each document’s layout rules', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'critical-css-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, 'pages.css'), Array.from({ length: 12 }, (_, i) => `.page-${i}{display:grid;gap:${i + 1}px}#heading-${i}{font-size:${i + 20}px}`).join(''));
  const ssg = createCriticalCssProcessor({ path: directory });
  const catalogue = createCriticalCssProcessor({ path: directory });
  const output = await Promise.all(Array.from({ length: 12 }, (_, i) => (i % 2 ? catalogue : ssg)(
    `<!doctype html><html><head><link rel="stylesheet" href="/pages.css"></head><body><main class="page-${i}"><h1 id="heading-${i}">Page ${i}</h1></main></body></html>`,
  )));
  output.forEach((html, i) => {
    const dom = new JSDOM(html);
    const css = [...dom.window.document.querySelectorAll('style')].map(node => node.textContent).join('');
    assert.match(css, new RegExp(`\\.page-${i}\\{display:grid;gap:${i + 1}px\\}`));
    assert.match(css, new RegExp(`#heading-${i}\\{font-size:${i + 20}px\\}`));
    assert.doesNotMatch(css, new RegExp(`\\.page-${(i + 1) % 12}\\{`));
    assert.ok(dom.window.document.querySelector('link[rel="stylesheet"][media="print"]'));
    assert.ok(dom.window.document.querySelector('noscript'));
    dom.window.close();
  });
});

test('the actual Vite hook prioritizes the ordinary production route and explicit route forms', async () => {
  const { config } = await loadConfigFromFile({ command: 'build', mode: 'production' }, 'vite.config.ts');
  assert.equal(config.ssgOptions.beastiesOptions, false, 'SSG must not start a second, independent CSS queue');
  const input = `<!doctype html><html><head><!--${'x'.repeat(2048)}--><meta charset="UTF-8"><script type="module" async crossorigin src="/assets/app.js"></script></head><body><h1>Bangalore</h1></body></html>`;
  for (const route of ['bangalore', '/bangalore', '/bangalore/', 'bangalore/peenya', '/bangalore/peenya/', 'hosur', '/hosur/']) {
    const html = await config.ssgOptions.onPageRendered(route, input, {});
    const dom = new JSDOM(html);
    const script = dom.window.document.querySelector('script');
    assert.equal(script.hasAttribute('async'), false, route);
    assert.equal(script.hasAttribute('defer'), true, route);
    assert.equal(script.getAttribute('fetchpriority'), 'low', route);
    assert.ok(html.indexOf('<meta charset="UTF-8">') < 1024, 'encoding must survive CSS extraction in the first 1024 bytes');
    assert.equal(dom.window.document.head.firstElementChild.getAttribute('charset'), 'UTF-8', route);
    assert.equal(dom.window.document.querySelector('h1').textContent, 'Bangalore');
    dom.window.close();
  }
  const untouched = new JSDOM(await config.ssgOptions.onPageRendered('/', input, {}));
  assert.equal(untouched.window.document.querySelector('script').hasAttribute('async'), true);
  untouched.window.close();
});
