import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await fs.readFile(path.join(root, 'src/lib/contentPunctuation.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { normalizeCopyText, normalizeContentPunctuation } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const emDash = '\u2014';

test('literal, encoded and paired em dashes use ordinary punctuation', () => {
  assert.equal(normalizeCopyText(`Warranties${emDash}express or implied${emDash}including exclusions`), 'Warranties, express or implied, including exclusions');
  for (const dash of [emDash, '&mdash;', '&#8212;', '&#x2014;']) {
    assert.equal(normalizeCopyText(`Verified ${dash} available`), 'Verified, available');
    assert.equal(normalizeCopyText(dash), 'Not specified');
  }
  assert.equal(normalizeCopyText('Rent: ₹18–22/sqft, 5–7 tonnes/sqm'), 'Rent: ₹18–22/sqft, 5–7 tonnes/sqm');
});

test('punctuation in prose never changes link destinations', () => {
  const url = `https://example.com/a${emDash}b`;
  assert.equal(normalizeCopyText(`[Market${emDash}guide](${url}) ${emDash} read more`), `[Market, guide](${url}), read more`);
  assert.equal(normalizeCopyText(`[More](/a${emDash}b) and ${url}`), `[More](/a${emDash}b) and ${url}`);
});

test('CMS copy is normalized without changing identifiers, links, dates, figures or its input', () => {
  const content = {
    slug: `a${emDash}b`, title: `Market ${emDash} guide`, published: '2026-09-12',
    related: [`a${emDash}b`], heroImage: { url: `/a${emDash}b.jpg`, alt: `View ${emDash} warehouse` },
    blocks: [{ kind: 'table', table: { headers: [`Rate ${emDash} monthly`], rows: [[`PEB ${emDash} RCC`, 12]] } }],
    faqs: [{ q: `Warehouse ${emDash} godown?`, a: `Yes ${emDash} same thing.` }],
  };
  const original = structuredClone(content);
  const normalized = normalizeContentPunctuation(content);
  assert.equal(normalized.title, 'Market: guide');
  assert.equal(normalized.heroImage.alt, 'View, warehouse');
  assert.equal(normalized.heroImage.url, content.heroImage.url);
  assert.equal(normalized.slug, content.slug);
  assert.deepEqual(normalized.related, content.related);
  assert.equal(normalized.published, content.published);
  assert.deepEqual(normalized.blocks[0].table.rows, [['PEB, RCC', 12]]);
  assert.equal(normalized.faqs[0].a, 'Yes, same thing.');
  assert.deepEqual(content, original);
  assert.deepEqual(normalizeContentPunctuation(normalized), normalized);
});

test('all current published CMS collections expose normalized copy to rendering and structured data', async () => {
  for (const [file, select] of [
    ['blogs', module => module.blogs],
    ['legalPages', module => [module.getLegalPage('privacy-policy'), module.getLegalPage('terms-of-service')]],
    ['locationPages', module => module.locationPages],
    ['micromarkets', module => module.micromarkets],
  ]) {
    const output = await build({ entryPoints: [path.join(root, 'src/data', `${file}.ts`)], bundle: true,
      write: false, format: 'esm', platform: 'node', define: { __DEV_SERVER__: 'false' } });
    const module = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
    assert.doesNotMatch(JSON.stringify(select(module)), /\u2014|&mdash;|&#8212;|&#x2014;/i, file);
  }
});

test('authored website text and public descriptions contain no em dashes', async () => {
  const offending = [];
  async function scan(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { await scan(file); continue; }
      if (!/\.[cm]?[tj]sx?$/.test(file) || file.includes('.generated.')) continue;
      const source = ts.createSourceFile(file, await fs.readFile(file, 'utf8'), ts.ScriptTarget.Latest, true);
      function visit(node) {
        if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node)
          || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node))
          && /\u2014|&mdash;|&#8212;|&#x2014;/i.test(node.text)) offending.push(path.relative(root, file));
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  await scan(path.join(root, 'src'));
  assert.deepEqual(offending, []);
  for (const file of ['index.html', 'public/llms.txt']) {
    const copy = (await fs.readFile(path.join(root, file), 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
    assert.doesNotMatch(copy, /\u2014|&mdash;|&#8212;|&#x2014;/i, file);
  }
});
