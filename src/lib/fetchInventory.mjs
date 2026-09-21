import { fetchRead } from './fetchRead.mjs';

/**
 * Fresh builds bypass HTTP and backend Redis caches. Browser requests keep the
 * normal cached path. The backend acknowledges the bypass so an older deploy
 * cannot silently feed stale inventory into a supposedly fresh build.
 * @param {string | URL} url
 * @param {RequestInit} [init]
 * @param {boolean} [fresh]
 * @returns {Promise<Response>}
 */
export async function fetchInventory(url, init = {}, fresh = false) {
  if (!fresh) return fetchRead(url, init);
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-cache, no-store');
  const response = await fetchRead(url, { ...init, headers, cache: 'no-store' });
  if (response.ok && response.headers.get('X-Wareongo-Cache') !== 'bypass') {
    await response.body?.cancel().catch(() => {});
    throw new Error(`Backend did not confirm fresh inventory for ${new URL(url).pathname}. Deploy the backend cache-bypass change before rebuilding the website.`);
  }
  if (response.ok && new URL(url).pathname.endsWith('/warehouses') && response.headers.get('X-Wareongo-Listing-Filters') !== '1') {
    await response.body?.cancel().catch(() => {});
    throw new Error('Deploy the backend listing-filter change before rebuilding the website. Native area, micromarket and exact-location filtering was not confirmed.');
  }
  return response;
}
