import { claimReloadAttempt } from './staleDeployReload';

export async function restoreCatalogueHydration(document: Document, fetcher: typeof fetch = fetch, timeoutMs = 15_000) {
  const marker = document.getElementById('catalogue-hydration');
  if (!marker) return undefined;
  const { src, routeId, seedSearch } = JSON.parse(marker.textContent ?? '{}');
  if (typeof src !== 'string' || !/^\/static-loader-data\/catalogue\/[a-z0-9]+\.json$/.test(src)
    || typeof routeId !== 'string' || typeof seedSearch !== 'string' || !/^(?:page=[1-9]\d*)?$/.test(seedSearch)) {
    throw new Error('Invalid catalogue hydration reference');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let loaderData;
  try {
    const response = await fetcher(src, { signal: controller.signal });
    if (!response.ok) throw Object.assign(new Error('Catalogue data unavailable'), { status: response.status });
    loaderData = await response.json();
  } finally { clearTimeout(timeout); }
  const data = loaderData?.[routeId];
  if (!Array.isArray(data?.warehouses) || !data.warehouses.length) throw new Error('Invalid catalogue snapshot');
  return { loaderData: { ...loaderData, [routeId]: { ...data, seedSearch } }, actionData: null, errors: null };
}

/** Wait for data before creating the router, so its very first render matches. */
export async function startWebsite(start: () => unknown) {
  if (document.readyState === 'loading') await new Promise<void>(resolve => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
  // The ad's headline and enquiry are already in HTML. Give the browser a paint
  // before React walks the long page. This yields one frame, without waiting for
  // interaction or imposing a timer on when the form becomes usable.
  if (document.getElementById('bangalore-title') && document.visibilityState === 'visible') {
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }
  try {
    const hydration = await restoreCatalogueHydration(document);
    if (hydration) Object.assign(window, { __staticRouterHydrationData: hydration });
    document.getElementById('catalogue-retry')?.remove();
    start();
  } catch (error) {
    // An old document can reference a file removed by a newer deployment.
    // Reuse the existing one-reload guard; offline/5xx failures stay readable.
    if ((error?.status === 404 || error?.status === 410) && claimReloadAttempt(`catalogue:${location.pathname}`)) {
      location.reload();
      return;
    }
    if (document.getElementById('catalogue-retry')) return;
    const notice = document.createElement('div');
    notice.id = 'catalogue-retry';
    notice.setAttribute('role', 'alert');
    notice.className = 'fixed bottom-4 left-4 right-4 z-[80] rounded-lg bg-white p-4 shadow-lg text-wareongo-blue';
    notice.append('Some controls could not load. ');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Retry';
    button.className = 'underline font-semibold';
    button.onclick = () => {
      notice.remove();
      void startWebsite(start);
    };
    notice.append(button);
    // Keep the React root intact while the static links remain usable.
    document.body.append(notice);
  }
}
