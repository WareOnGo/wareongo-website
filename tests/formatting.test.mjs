import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  const fullPath = path.resolve(root, file);
  if (cache.has(fullPath)) return cache.get(fullPath);
  const loaded = { exports: {} };
  cache.set(fullPath, loaded.exports);
  const compiled = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, { exports: loaded.exports, module: loaded, console,
    require(id) {
      if (!id.startsWith('.') && !id.startsWith('@/')) return require(id);
      const base = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(fullPath), id);
      const target = ['.ts', '.tsx'].map(ext => base + ext).find(p => fs.existsSync(p));
      return load(target);
    },
  }, { filename: fullPath });
  return loaded.exports;
}

const { plainInlineText } = load('src/lib/inline-format.ts');
const InlineText = load('src/components/InlineText.tsx').default;
const { ContentBlock } = load('src/components/ContentBlock.tsx');
const { LegalInline } = load('src/components/LegalContent.tsx');
const render = (text, Component = InlineText) => renderToStaticMarkup(createElement(Component, { text }));

for (const [text, html, plain] of [
  ['**Bold** and *italic*', '<strong>Bold</strong> and <em>italic</em>', 'Bold and italic'],
  ['**bold _italic_ words**', '<strong>bold <em>italic</em> words</strong>', 'bold italic words'],
  ['**bold *italic***', '<strong>bold <em>italic</em></strong>', 'bold italic'],
  ['*italic **bold** words*', '<em>italic <strong>bold</strong> words</em>', 'italic bold words'],
  ['***both***', '<strong><em>both</em></strong>', 'both'],
  ['ware*house*', 'ware<em>house</em>', 'warehouse'],
  ['**a** *b*', '<strong>a</strong> <em>b</em>', 'a b'],
  ['plain_text_here, 2 * 3, **unfinished', 'plain_text_here, 2 * 3, **unfinished', 'plain_text_here, 2 * 3, **unfinished'],
  ['<img src=x onerror=alert(1)> **safe**', '&lt;img src=x onerror=alert(1)&gt; <strong>safe</strong>', '<img src=x onerror=alert(1)> safe'],
  ['\\*literal\\*', '*literal*', '*literal*'],
]) test('renders stored emphasis safely: ' + text, () => {
  assert.equal(render(text), html);
  assert.equal(plainInlineText(text), plain);
});

test('paragraphs, lists, headings, tables and captions render emphasis', () => {
  for (const block of [
    { kind: 'p', text: '**Bold** *italic*' },
    { kind: 'h2', text: '**Bold** *italic*' },
    { kind: 'h3', text: '**Bold** *italic*' },
    { kind: 'ul', items: ['**Bold** *italic*'] },
    { kind: 'ol', items: ['**Bold** *italic*'] },
    { kind: 'table', table: { headers: ['**Bold**'], rows: [['*italic*']] } },
    { kind: 'images', images: [{ url: '/photo.webp', alt: '**literal alt**', width: 100, height: 100 }], caption: '**Bold** *italic*' },
  ]) {
    const html = renderToStaticMarkup(createElement(ContentBlock, { block }));
    assert.ok(html.includes('<strong>Bold</strong>'));
    assert.ok(html.includes('<em>italic</em>'));
    if (block.kind === 'images') assert.ok(html.includes('alt="**literal alt**"'));
  }
});

test('legal copy keeps safe links and formats their labels and surrounding words', () => {
  const html = render('**Contact [*support*](mailto:sales@wareongo.com)**', LegalInline);
  assert.equal(html, '<strong>Contact <a href="mailto:sales@wareongo.com" class="text-wareongo-blue hover:underline break-words"><em>support</em></a></strong>');
  for (const href of ['javascript:alert', '//evil.example', '/\\evil.example', 'data:text/html,evil']) {
    assert.equal(render('[**link**](' + href + ')', LegalInline), '<strong>link</strong>');
  }
});
