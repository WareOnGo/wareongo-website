import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildBlogSummaries } from '../scripts/lib/blog-summaries.mjs';

const image = (name) => ({ url: `https://images.example/${name}.webp`, alt: name, width: 1200, height: 800 });
const articleImage = image('article');
const thumbnail = image('thumbnail');
const blog = (overrides = {}) => ({
  slug: 'warehouse-guide', title: 'Warehouse guide', description: 'Guide description', updated: '2026-10-06',
  blocks: [{ kind: 'p', text: 'Article body' }], ...overrides,
});

test('an uploaded thumbnail wins without including article bodies in the index', () => {
  const [summary] = buildBlogSummaries([blog({ thumbnail, blocks: [{ kind: 'images', images: [articleImage] }] })]);
  assert.deepEqual(summary, {
    slug: 'warehouse-guide', title: 'Warehouse guide', description: 'Guide description', updated: '2026-10-06', thumbnail,
  });
});

test('older articles use their first image and text-only posts share a blog photo', () => {
  const articles = [blog(), blog({ blocks: [{ kind: 'images', images: [] }, { kind: 'images', images: [articleImage, thumbnail] }] })];
  assert.deepEqual(buildBlogSummaries(articles, []).map((summary) => summary.thumbnail), [articleImage, articleImage]);
  assert.equal(articles[0].thumbnail, undefined, 'Fallbacks must not change saved content');
});

test('article photos remain a fallback when the warehouse selection is empty', () => {
  assert.deepEqual(buildBlogSummaries([blog({ thumbnail: null, blocks: [{ kind: 'images', images: [articleImage] }] })], [])[0].thumbnail, articleImage);
  assert.equal(buildBlogSummaries([blog()], [])[0].thumbnail, undefined);
  assert.deepEqual(buildBlogSummaries([]), []);
});

test('temporary T1 photos vary across posts, remain stable, and yield to CMS uploads', () => {
  const posts = Array.from({ length: 6 }, (_, index) => blog({ slug: `guide-${index}` }));
  const summaries = buildBlogSummaries(posts);
  assert.equal(new Set(summaries.map((summary) => summary.thumbnail.url)).size, 6);
  assert.deepEqual(buildBlogSummaries(posts), summaries);
  const [custom, cleared] = buildBlogSummaries([blog({ thumbnail }), blog({ thumbnail: null })]);
  assert.deepEqual(custom.thumbnail, thumbnail);
  assert.match(cleared.thumbnail.url, /^\/blog-thumbnails\//);
});
