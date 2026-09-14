import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function useListingSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  // A built document contains the default page. Its first React render must
  // match that HTML; later client navigations can use the URL immediately.
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const searchParams = useMemo(() => new URLSearchParams(hydrated ? location.search : ''), [hydrated, location.search]);
  const hash = hydrated ? location.hash : '';
  const hrefFor = useCallback((next: URLSearchParams) => {
    const search = next.toString();
    return `${location.pathname}${search ? `?${search}` : ''}${hash}`;
  }, [location.pathname, hash]);
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
