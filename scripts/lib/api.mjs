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
