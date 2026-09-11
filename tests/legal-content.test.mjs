import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateLegalPages } from '../scripts/lib/legal-content.mjs';

const pages = () => ['privacy-policy', 'terms-of-service'].map(slug => ({ slug,
  title: 'Policy', seoTitle: 'Policy | WareOnGo', description: 'Description',
  effectiveDate: '2025-11-01', updated: '2025-11-22', notice: '',
  blocks: [{ kind: 'p', text: 'Published copy' }],
}));

test('valid legal pages retain headings, links, dates and content', () => {
  const p = pages(); p[0].blocks.push({ kind: 'ul', items: ['**Contact:** [Email](mailto:sales@wareongo.com)'] });
  assert.deepEqual(validateLegalPages(p), p);
});

for (const [label, mutate] of [
  ['missing page', p => p.pop()],
  ['duplicate URL', p => { p[1].slug = p[0].slug; }],
  ['unexpected URL', p => { p[0].slug = 'other'; }],
  ['blank body', p => { p[0].blocks = []; }],
  ['unknown block', p => { p[0].blocks = [{ kind: 'html', text: '<script>x()</script>' }]; }],
  ['blank list item', p => { p[0].blocks = [{ kind: 'ul', items: [''] }]; }],
  ['impossible date', p => { p[0].effectiveDate = '2025-02-31'; }],
  ['backwards dates', p => { p[0].updated = '2024-11-01'; }],
]) test(`refuses ${label} before replacing build content`, () => {
  const p = pages(); mutate(p); assert.throws(() => validateLegalPages(p));
});
