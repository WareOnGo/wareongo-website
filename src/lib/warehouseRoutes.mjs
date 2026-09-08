// Shared by the browser, build script and request handler. Only published
// paths go in this index: mutable API fields must not invent redirect targets.
export function warehouseIdFromPath(pathname) {
  const match = /^\/warehouse\/(?:[a-z0-9][a-z0-9-]*-)?([1-9]\d*)\/?$/i.exec(pathname);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
}

export function indexWarehousePaths(paths) {
  const index = Object.create(null);
  for (const pathname of paths) {
    if (!pathname.startsWith('/warehouse/')) continue;
    const id = warehouseIdFromPath(pathname);
    if (id === null) throw new Error(`Invalid published warehouse path: ${pathname}`);
    if (index[id] && index[id] !== pathname) {
      throw new Error(`Multiple published paths for warehouse ${id}`);
    }
    index[id] = pathname;
  }
  return index;
}

export function warehouseRedirect(request, index) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return;
  const url = new URL(request.url);
  const id = warehouseIdFromPath(url.pathname);
  const destination = id === null ? undefined : index[id];
  // Unknown IDs continue to the site's actual HTTP 404. A valid canonical
  // request continues to its static file without another network request.
  if (!destination || destination === url.pathname) return;

  return new Response(null, {
    status: 308,
    headers: {
      Location: destination + url.search,
      // Sizes can be corrected again, including back to an earlier value.
      // Do not persist A -> B in a browser and later create a B -> A loop.
      'Cache-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
    },
  });
}
