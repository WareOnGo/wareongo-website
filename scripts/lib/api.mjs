// Shared backend API base for the build-time generators.
//
// Override to generate against a local backend (e.g. when a new field hasn't
// shipped to production yet): WAREONGO_API_BASE=http://localhost:3000 npm run build
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
  let resp = await fetch(`${API_BASE}/blogs`);
  if (resp.status === 404) {
    console.warn('[blogs] /blogs not found on the backend yet — falling back to /guides');
    resp = await fetch(`${API_BASE}/guides`);
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
 * Returns [] rather than throwing, which is the opposite of fetchBlogs and
 * deliberate: these pages are an *upgrade* to a route that already renders
 * fine without them. An empty result means every micromarket keeps its plain
 * listing grid — the same thing the site did before this table existed — so
 * failing the build over it would trade a working deploy for nothing.
 *
 * A 404 is treated the same way, so the website can deploy before (or without)
 * the backend route being live.
 */
export async function fetchMicromarketPages() {
  let resp;
  try {
    resp = await fetch(`${API_BASE}/micromarket-pages`);
  } catch (err) {
    console.warn('[micromarkets] backend unreachable — building without editorial pages:', err.message);
    return [];
  }
  if (resp.status === 404) {
    console.warn('[micromarkets] /micromarket-pages not found on the backend yet — building without editorial pages');
    return [];
  }
  if (!resp.ok) {
    console.warn(`[micromarkets] backend returned ${resp.status} ${resp.statusText} — building without editorial pages`);
    return [];
  }
  const json = await resp.json();
  return Array.isArray(json?.data) ? json.data : [];
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
export async function fetchMicromarkets() {
  const resp = await fetch(`${API_BASE}/micromarkets`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch micromarkets: ${resp.status} ${resp.statusText}`);
  }
  const json = await resp.json();
  if (!Array.isArray(json?.data)) {
    throw new Error('Micromarkets endpoint returned an unexpected shape');
  }
  return json.data;
}
