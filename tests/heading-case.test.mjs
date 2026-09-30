import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await fs.readFile(new URL('../src/lib/headingCase.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { titleCase, normalizeHeadingCase } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

test('heading case handles minor words, contractions, compounds and subtitle boundaries', () => {
  assert.equal(titleCase('find the perfect space'), 'Find the Perfect Space');
  assert.equal(titleCase("what you'll find in a built-to-suit warehouse"), "What You'll Find in a Built-to-Suit Warehouse");
  assert.equal(titleCase('the warehouse to move into'), 'The Warehouse to Move Into');
  assert.equal(titleCase('warehouse choices: a guide for tenants'), 'Warehouse Choices: A Guide for Tenants');
  assert.equal(titleCase('warehouse choices - a guide for tenants'), 'Warehouse Choices - A Guide for Tenants');
  assert.equal(titleCase('spaces below the market rate'), 'Spaces below the Market Rate');
});

test('brands, grades, acronyms and units keep their meaning and authored spelling', () => {
  assert.equal(titleCase('why WareOnGo works for 3PLs and SMEs'), 'Why WareOnGo Works for 3PLs and SMEs');
  assert.equal(titleCase('PEB vs RCC: fire NOCs and FSSAI'), 'PEB vs RCC: Fire NOCs and FSSAI');
  assert.equal(titleCase('what is a grade a warehouse?'), 'What Is a Grade A Warehouse?');
  assert.equal(titleCase('50,000 sqft at ₹18.5/sqft with 250 kVA power'), '50,000 sqft at ₹18.5/sqft with 250 kVA Power');
  assert.equal(titleCase('PEB at 40 ft clear height'), 'PEB at 40 ft Clear Height');
});

test('inline emphasis and links survive casing without rewriting destinations', () => {
  const input = '**warehouse** and *lease* guide: [a checklist](/guides/peb-vs-rcc?area=sqft)';
  assert.equal(titleCase(input), '**Warehouse** and *Lease* Guide: [A Checklist](/guides/peb-vs-rcc?area=sqft)');
  assert.equal(titleCase('read https://example.com/a-guide?units=kVA and learn more'), 'Read https://example.com/a-guide?units=kVA and Learn More');
  assert.equal(titleCase('PEB &amp; RCC: `warehouse_id` reference'), 'PEB &amp; RCC: `warehouse_id` Reference');
  assert.equal(titleCase(titleCase(input)), titleCase(input));
});

test('only heading fields change; paragraphs, FAQ questions, URLs and IDs stay intact', () => {
  const input = {
    slug: 'warehouse-rent-in-bangalore', title: 'warehouse rent in Bangalore', seoTitle: 'warehouse rent | WareOnGo',
    h1: 'warehouse rent in Bangalore', copy: { heroHeading: 'warehouses for rent', heroAccent: 'in Bangalore', enquirySubmit: 'Get in touch' },
    description: 'One expert: from search to handover',
    blocks: [{ kind: 'h2', text: 'the typical specification' }, { kind: 'h3', text: 'what PEB offers' }, { kind: 'p', text: 'We find land and build to your specs' }, { kind: 'table', table: { headers: ['Unit size'], rows: [['50,000 sqft']] } }],
    images: [{ url: '/warehouse-pics/peb.webp', alt: 'View inside the warehouse' }],
    faqs: [{ q: 'What is the rent in Bangalore?', a: 'Rent varies by area and size.' }],
  };
  const original = structuredClone(input);
  const result = normalizeHeadingCase(input);
  assert.equal(result.title, 'Warehouse Rent in Bangalore');
  assert.equal(result.copy.heroHeading, 'Warehouses for Rent');
  assert.equal(result.copy.heroAccent, 'in Bangalore');
  assert.equal(result.copy.enquirySubmit, 'Get in touch');
  assert.deepEqual(result.blocks.slice(0, 2), [{ kind: 'h2', text: 'The Typical Specification' }, { kind: 'h3', text: 'What PEB Offers' }]);
  for (const key of ['slug', 'description', 'images', 'faqs']) assert.deepEqual(result[key], input[key]);
  assert.deepEqual(result.blocks.slice(2), input.blocks.slice(2));
  assert.deepEqual(input, original);
  assert.deepEqual(normalizeHeadingCase(result), result);
});

test('published blog headings and index titles stay consistent without changing article prose', async () => {
  const generated = await fs.readFile(new URL('../src/data/blogs.generated.ts', import.meta.url), 'utf8');
  const raw = JSON.parse(generated.slice(generated.indexOf('= [') + 2).trim().replace(/;$/, ''));
  const output = await build({ absWorkingDir: root, stdin: { contents: "export { blogs } from './src/data/blogs'; export { blogSummaries } from './src/data/blogSummaries'; export { normalizeContentPunctuation } from './src/lib/contentPunctuation';", resolveDir: root }, bundle: true, write: false, format: 'esm', platform: 'node' });
  const { blogs, blogSummaries, normalizeContentPunctuation } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
  assert.equal(blogs.length, raw.length);
  for (const blog of blogs) {
    assert.equal(blog.title, blogSummaries.find(item => item.slug === blog.slug).title);
    // Punctuation already has its own site-wide normalization; this checks
    // casing alone without treating those existing differences as new edits.
    const stored = normalizeContentPunctuation(raw.find(item => item.slug === blog.slug));
    assert.equal(blog.description, stored.description);
    assert.equal(blog.summary, stored.summary);
    assert.deepEqual(blog.faqs, stored.faqs);
    const nonHeadings = blocks => blocks.filter(block => block.kind !== 'h2' && block.kind !== 'h3');
    assert.deepEqual(nonHeadings(blog.blocks), nonHeadings(stored.blocks));
  }
  assert.equal(blogs[0].blocks.find(block => block.kind === 'h2').text, 'What Is a PEB Warehouse?');
});
