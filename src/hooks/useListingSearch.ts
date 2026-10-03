import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listingSearchHref, type WarehouseFilters } from '@/lib/listingSearch';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function useListingSearch(preset?: WarehouseFilters, seedSearch = '') {
  const location = useLocation();
  const navigate = useNavigate();
  // The first React render must match the explicit page baked into this HTML.
  // Filtered/legacy URLs can still receive page one and adopt their URL after
  // hydration. Never infer a static seed from an arbitrary browser query.
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const searchParams = useMemo(() => new URLSearchParams(hydrated ? location.search : seedSearch), [hydrated, location.search, seedSearch]);
  const hash = hydrated ? location.hash : '';
  const hrefFor = useCallback((next: URLSearchParams) => {
    if (preset) return listingSearchHref(location.pathname, next, hash, preset);
    const search = next.toString();
    return `${location.pathname}${search ? `?${search}` : ''}${hash}`;
  }, [location.pathname, hash, preset]);
  const setSearchParams = useCallback((next: URLSearchParams, options: { replace?: boolean } = {}) => {
    const href = hrefFor(next);
    if (href === `${location.pathname}${location.search}${location.hash}`) return;
    // User paging used to be a discrete local-state update. Keep that commit
    // priority: a router transition otherwise adds a frame to cached clicks.
    // Canonical replacements run in effects and must not force a sync flush.
    navigate(href, { ...options, preventScrollReset: true, flushSync: !options.replace });
  }, [hrefFor, location.pathname, location.search, location.hash, navigate]);
  return { searchParams, hydrated, setSearchParams, hrefFor };
}
