// Shared backend API base for the build-time generators.
//
// Override to generate against a local backend (e.g. when a new field hasn't
// shipped to production yet): WAREONGO_API_BASE=http://localhost:3000 npm run build
import { fetchRead } from '../../src/lib/fetchRead.mjs';

export const API_BASE = process.env.WAREONGO_API_BASE || 'https://wareongo-website-backend.onrender.com';

/**
 * PUBLISHED blogs, in the order the CMS sorts them. The order matters: it
 * drives the ItemList JSON-LD positions on /blogs.
 *
 * Throws rather than returning [] — an empty result would silently delete five
 * indexed pages from the build and the sitemap, which is far worse than a
 * failed deploy.
 */
export async function fetchBlogs() {
  // /guides is the pre-rename name of this endpoint, still mounted on the
  // backend as an alias. Falling back to it means a build can't fail just
  // because it ran before the backend finished deploying. Delete both halves
  // once the rename has been live for a while.
  let resp = await fetchRead(`${API_BASE}/blogs`);
  if (resp.status === 404) {
    console.warn('[blogs] /blogs not found on the backend yet — falling back to /guides');
    resp = await fetchRead(`${API_BASE}/guides`);
  }
  if (!resp.ok) throw new Error(`Failed to fetch blogs: ${resp.status} ${resp.statusText}`);
  const json = await resp.json();
  const blogs = json.data;
  if (!Array.isArray(blogs) || blogs.length === 0) {
    throw new Error('Blogs endpoint returned no blogs — refusing to build a site with zero blog pages.');
  }
  return blogs;
}

/**
 * PUBLISHED micromarket pages, keyed by (citySlug, slug).
 *
 * An empty published collection is valid. A failed fetch is not: silently
 * replacing it with [] would remove every published /overview page.
 */
export async function fetchMicromarketPages() {
  const resp = await fetchRead(`${API_BASE}/micromarket-pages`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch micromarket pages: ${resp.status} ${resp.statusText}`);
  }
  const json = await resp.json();
  if (!Array.isArray(json?.data)) throw new Error('Micromarket pages endpoint returned an unexpected shape');
  return json.data;
}

/**
 * Derived micromarket data: which micromarkets exist, which earn a page, and
 * every figure computed from their inventory.
 *
 * The backend owns that derivation (services/micromarketService.js). It used to
 * be reimplemented here and in src/loaders/locationLoader.ts, with the CMS
 * carrying a third copy — three sets of parsing rules for the same free-text
 * columns, and nothing to say when they diverged.
 *
 * Throws rather than returning []: an empty list would silently drop forty-odd
 * indexed pages from the sitemap and the footer, which is worse than a failed
 * deploy. Same reasoning as fetchBlogs.
 */
/** Published city/state overviews. Empty is valid; outages must stop the build. */
export async function fetchLocationPages() {
  const resp = await fetchRead(`${API_BASE}/location-pages`);
  if (!resp.ok) throw new Error(`Failed to fetch location pages: ${resp.status} ${resp.statusText}`);
  const json = await resp.json();
  if (!Array.isArray(json?.data)) throw new Error('Location pages endpoint returned an unexpected shape');
  return json.data;
}

export async function fetchMicromarkets() {
  const resp = await fetchRead(`${API_BASE}/micromarkets`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch micromarkets: ${resp.status} ${resp.statusText}`);
  }
  const json = await resp.json();
  if (!Array.isArray(json?.data)) {
    throw new Error('Micromarkets endpoint returned an unexpected shape');
  }
  return json.data;
}
