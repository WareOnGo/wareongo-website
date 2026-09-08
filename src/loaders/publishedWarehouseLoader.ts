import { redirect, type LoaderFunction } from 'react-router-dom';
import { indexWarehousePaths, warehouseIdFromPath } from '@/lib/warehouseRoutes.mjs';

type Manifest = Record<string, string>;

const loadFailure = () => new Response('Warehouse details could not be loaded. Please retry.', { status: 503 });

async function readJSON(url: string, signal: AbortSignal): Promise<Record<string, unknown>> {
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw loadFailure();
  const data = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw loadFailure();
  return data;
}

export function publishedWarehouseLoader(routeId: string, navigationHash: () => string): LoaderFunction {
  return async ({ request }) => {
    const url = new URL(request.url);
    // React Router removes fragments from loader Requests. Keep the pending
    // location's fragment so a client redirect behaves like an HTTP redirect.
    const hash = navigationHash();
    const id = warehouseIdFromPath(url.pathname);
    if (id === null) return null;

    // One fresh-manifest retry repairs a tab that outlived a deployment. It is
    // bounded, and aborted navigations do not keep fetching in the background.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        let manifest = window.__VITE_REACT_SSG_STATIC_LOADER_MANIFEST__;
        if (!manifest || attempt > 0) {
          manifest = await readJSON('/static-loader-data-manifest-stable.json', request.signal) as Manifest;
          if (!Object.values(manifest).every((value) => typeof value === 'string')) throw loadFailure();
          window.__VITE_REACT_SSG_STATIC_LOADER_MANIFEST__ = manifest;
        }
        const canonical = indexWarehousePaths(Object.keys(manifest))[id];
        if (!canonical) {
          if (attempt === 0) continue; // A newly deployed listing may now exist.
          return null;
        }
        if (url.pathname !== canonical) return redirect(canonical + url.search + hash, 308);

        const dataPath = manifest[canonical];
        if (!dataPath.startsWith('static-loader-data/') || dataPath.includes('..')) throw loadFailure();
        const cache = window.__VITE_REACT_SSG_STATIC_LOADER_DATA__ ??= {};
        const payload = attempt === 0 && cache[canonical]
          ? cache[canonical]
          : await readJSON('/' + dataPath, request.signal);
        const detail = payload[routeId] as { id?: number } | null | undefined;
        if (detail === null) return null;
        if (!detail || detail.id !== id) throw loadFailure();
        cache[canonical] = payload;
        return detail;
      } catch {
        if (request.signal.aborted) throw request.signal.reason;
        if (attempt > 0) throw loadFailure();
      }
    }
    throw loadFailure();
  };
}
