import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: ['src/lib/blogPresentation.ts'], bundle: true, write: false, platform: 'node', format: 'esm',
});
const { newestBlogs, filterBlogs, blogTopic, blogHeadings, blogWordCount, blogDate } =
  await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));

const posts = [
  { slug: 'warehouse-rent-india-guide', title: 'Warehouse Rent', description: 'Deposits and lease terms', updated: '2026-07-03' },
  { slug: 'warehouse-compliance-checklist-india', title: 'Warehouse Compliance', description: 'Fire NOC and paperwork', updated: '2026-06-05' },
  { slug: 'new-guide', title: 'New Guide', description: 'New content', updated: '2026-10-30' },
];

test('sorting uses real updates, does not mutate CMS order and tolerates missing dates', () => {
  const input = [...posts, { ...posts[2], slug: 'unfinished', updated: '' }];
  assert.deepEqual(newestBlogs(input).map(post => post.slug), ['new-guide', 'warehouse-rent-india-guide', 'warehouse-compliance-checklist-india', 'unfinished']);
  assert.equal(input[0].slug, 'warehouse-rent-india-guide');
  assert.equal(blogDate(''), null);
  assert.match(blogDate('2026-07-03'), /3 Jul 2026/);
});

test('search combines words and topics, and unknown posts remain discoverable', () => {
  assert.deepEqual(filterBlogs(posts, '  NOC  fire ', 'All').map(post => post.slug), ['warehouse-compliance-checklist-india']);
  assert.equal(filterBlogs(posts, 'fire', 'Leasing').length, 0);
  assert.equal(filterBlogs(posts, '', 'All').length, 3);
  assert.equal(filterBlogs(posts, '', 'Guides')[0].slug, 'new-guide');
  assert.equal(blogTopic('constructor'), 'Guides');
  assert.equal(blogTopic('unpublished-category'), 'Guides');
});

test('contents anchors stay unique across punctuation, duplicate headings and non-Latin text', () => {
  const blocks = [
    { kind: 'p', text: 'Introduction' },
    { kind: 'h2', text: '**Lease** costs' },
    { kind: 'h3', text: 'Lease costs' },
    { kind: 'h2', text: 'Lease costs 2' },
    { kind: 'h2', text: 'गोदाम' },
    { kind: 'h2', text: '!!!' },
  ];
  const headings = blogHeadings(blocks);
  assert.equal(headings.length, 5);
  assert.equal(new Set(headings.map(heading => heading.id)).size, 5);
  assert.equal(headings[0].text, 'Lease costs');
  assert.equal(headings[0].index, 1);
  assert.equal(headings[1].level, 'h3');
  assert.deepEqual(headings, blogHeadings(blocks));
  assert.deepEqual(blogHeadings([]), []);
});

test('reading estimates count visible prose, tables and captions without image alt text', () => {
  const blog = { summary: '**Two words**', blocks: [
    { kind: 'h2', text: 'Heading' }, { kind: 'ul', items: ['First item', 'Second item'] },
    { kind: 'table', table: { headers: ['City'], rows: [['Bengaluru']] } },
    { kind: 'images', images: [{ alt: 'These words must not count' }], caption: 'Warehouse exterior' },
  ], faqs: [{ q: 'Question?', a: 'Answer.' }] };
  assert.equal(blogWordCount(blog), 13);
});
