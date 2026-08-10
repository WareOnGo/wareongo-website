// Shared backend API base for the build-time generators.
//
// Override to generate against a local backend (e.g. when a new field hasn't
// shipped to production yet): WAREONGO_API_BASE=http://localhost:3000 npm run build
export const API_BASE = process.env.WAREONGO_API_BASE || 'https://wareongo-website-backend.onrender.com';

/**
 * PUBLISHED guides, in the order the CMS sorts them. The order matters: it
 * drives the ItemList JSON-LD positions on /guides.
 *
 * Throws rather than returning [] — an empty result would silently delete five
 * indexed pages from the build and the sitemap, which is far worse than a
 * failed deploy.
 */
export async function fetchGuides() {
  const resp = await fetch(`${API_BASE}/guides`);
  if (!resp.ok) throw new Error(`Failed to fetch guides: ${resp.status} ${resp.statusText}`);
  const json = await resp.json();
  const guides = json.data;
  if (!Array.isArray(guides) || guides.length === 0) {
    throw new Error('Guides endpoint returned no guides — refusing to build a site with zero guide pages.');
  }
  return guides;
}
