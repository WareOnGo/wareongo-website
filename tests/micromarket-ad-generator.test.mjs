import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transformSync } from 'esbuild';
import { generateMicromarketAdPages } from '../scripts/generate-micromarket-ad-pages.mjs';
const generated = fs.readFileSync(new URL('../src/data/micromarketAdPages.generated.ts', import.meta.url), 'utf8');
const { micromarketAdPages } = await import('data:text/javascript;base64,' + Buffer.from(transformSync(generated, { loader: 'ts', format: 'esm' }).code).toString('base64'));
const page = micromarketAdPages.find(page => page.slug === 'peenya');
test('new approved micromarkets generate their content and route allowlist without a code registration', async () => {
  const writes = [], calls = [];
  const newPage = { ...page, slug: 'hoskote', name: 'Hoskote' };
  const pages = await generateMicromarketAdPages({ base: 'https://example.test', read: async (...args) => { calls.push(args); return new Response(JSON.stringify({ data: [page, newPage] })); }, write: async (...args) => writes.push(args) });
  assert.equal(pages.length, 2); assert.equal(writes.length, 2);
  assert.match(writes[0][1], /Hoskote/); assert.match(writes[1][1], /\["\/bangalore\/peenya","\/bangalore\/hoskote"\]/);
  assert.equal(calls[0][0], 'https://example.test/ad-pages/micromarkets'); assert.equal(calls[0][1].cache, 'no-store');
});
test('approved Hosur generates its standalone route without a Bangalore alias', async () => {
  const writes = [];
  const hosur = micromarketAdPages.find(page => page.citySlug === 'hosur');
  await generateMicromarketAdPages({ read: async () => Response.json({ data: [page, hosur] }), write: async (...args) => writes.push(args) });
  assert.match(writes[1][1], /"\/hosur"/);
  assert.doesNotMatch(writes[1][1], /bangalore\/hosur/);
});
for (const [name, response] of [
  ['outage', new Response('', { status: 500 })],
  ['missing Peenya', Response.json({ data: [] })],
  ['bad local schema', Response.json({ data: [{ ...page, services: [] }] })],
  ['private/incomplete copy', Response.json({ data: [{ ...page, area: { whereItIs: '', whoItSuits: '' } }] })],
]) test(`${name} leaves the generated snapshot untouched and fails the build`, async () => {
  const writes = [];
  await assert.rejects(generateMicromarketAdPages({ read: async () => response, write: async (...args) => writes.push(args) }));
  assert.equal(writes.length, 0);
});
