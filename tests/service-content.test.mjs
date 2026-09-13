import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateServicePages } from '../scripts/lib/service-content.mjs';

const page = () => ({ slug: 'warehouse-search', title: 'Search', seoTitle: 'Search | WareOnGo', description: 'Description',
  summary: 'Introduction', keywords: [], blocks: [{ kind: 'p', text: 'Written service copy' }], faqs: [] });

test('an empty approved collection is valid and emits no pages', () => assert.deepEqual(validateServicePages([]), []));
test('only service fields enter generated data', () => assert.deepEqual(validateServicePages([{ ...page(), author: 'Byline', updated: '2026-09-13', related: ['blog'] }]), [page()]));
for (const blocks of [[], [{ kind: 'h2', text: 'Title' }], [{ kind: 'p', text: ' ' }], [{ kind: 'images', images: [], caption: 'Caption' }]]) {
  test(`no public route for unwritten content ${JSON.stringify(blocks)}`, () => assert.deepEqual(validateServicePages([{ ...page(), blocks }]), []));
}
for (const [name, input] of [
  ['bad envelope', {}], ['unknown URL', [{ ...page(), slug: 'manpower-services' }]], ['duplicate', [page(), page()]],
  ['missing metadata', [{ ...page(), seoTitle: '' }]],
  ['bad block', [{ ...page(), blocks: [...page().blocks, { kind: 'html', text: '<script>bad()</script>' }] }]],
  ['broken table', [{ ...page(), blocks: [{ kind: 'table', table: { headers: ['A', 'B'], rows: [['One']] } }] }]],
  ['unsafe image', [{ ...page(), blocks: [...page().blocks, { kind: 'images', images: [{ url: 'javascript:alert(1)', alt: 'Alt', width: 1, height: 1 }] }] }]],
  ['empty FAQ', [{ ...page(), faqs: [{ q: 'Q', a: '' }] }]],
]) test(`${name} stops the build`, () => assert.throws(() => validateServicePages(input)));
