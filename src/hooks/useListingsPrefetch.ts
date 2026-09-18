import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { hashKey, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from 'react-router-dom';
import { listingsQueryOptions, type ListingsFilters, type ListingsQueryData } from '@/lib/listingsQuery';

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

function usePrefetchPolicy() {
  const [policy, setPolicy] = useState({ allowed: false, columns: 1 });
  useEffect(() => {
    const network = connection();
    const update = () => {
      const allowed = document.visibilityState === 'visible' && navigator.onLine !== false &&
        !network?.saveData && !/(^|-)2g$/.test(network?.effectiveType ?? '');
      const columns = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      setPolicy(previous => previous.allowed === allowed && previous.columns === columns ? previous : { allowed, columns });
    };
    update();
    document.addEventListener('visibilitychange', update);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    window.addEventListener('resize', update);
    network?.addEventListener?.('change', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      window.removeEventListener('resize', update);
      network?.removeEventListener?.('change', update);
    };
  }, []);
  return policy;
}

/** Give the current render a head start; every scheduled callback can be cancelled. */
function defer(work: () => void) {
  let idle: number | undefined;
  const timer = window.setTimeout(() => {
    if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(work, { timeout: 1000 });
    else work();
  }, 200);
  return () => {
    window.clearTimeout(timer);
    if (idle !== undefined) window.cancelIdleCallback(idle);
  };
}

function createPhotoBatch(key: string) {
  const attempted = new Set<string>();
  const pending = new Map<string, HTMLImageElement>();
  return {
    key,
    preload(url: string) {
      if (attempted.has(url)) return;
      attempted.add(url);
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = 'low';
      // Release decoded objects. Keep only the small set of attempted URLs.
      image.onload = image.onerror = () => { pending.delete(url); };
      pending.set(url, image);
      image.src = url;
    },
    cancel() {
      for (const [url, image] of pending) {
        image.onload = image.onerror = null;
        image.removeAttribute('src');
        attempted.delete(url);
      }
      pending.clear();
    },
  };
}

/** One next-page query; one row of photos only when the pager approaches. */
export function useListingsPrefetch({ page, pageSize, filters, totalPages, ready, resultsRef }: {
  page: number;
  pageSize: number;
  filters: ListingsFilters;
  totalPages: number;
  ready: boolean;
  resultsRef: RefObject<HTMLElement>;
}) {
  const client = useQueryClient();
  const navigation = useNavigation();
  const policy = usePrefetchPolicy();
  const pagerRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => listingsQueryOptions(page + 1, pageSize, filters, client), [page, pageSize, filters, client]);
  const targetKey = hashKey(options.queryKey);
  const currentKey = useRef('');
  currentKey.current = hashKey(listingsQueryOptions(page, pageSize, filters, client).queryKey);
  const enabled = ready && page < totalPages && policy.allowed && navigation.state === 'idle';
  const [prefetched, setPrefetched] = useState<{ key: string; data: ListingsQueryData } | null>(null);
  const [near, setNear] = useState<{ key: string; value: boolean } | null>(null);
  const photos = useMemo(() => createPhotoBatch(targetKey), [targetKey]);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const cancel = defer(() => {
      void client.prefetchQuery(options).then(() => {
        if (disposed) return;
        const state = client.getQueryState(options.queryKey);
        const data = client.getQueryData(options.queryKey);
        if (state?.status === 'success' && data) setPrefetched({ key: targetKey, data });
      });
    });
    return () => {
      disposed = true;
      cancel();
      // Next may have promoted this very request to the visible query. Passive
      // cleanup must not abort it while React is subscribing its new observer.
      if (currentKey.current !== targetKey) {
        void client.cancelQueries({ queryKey: options.queryKey, exact: true, type: 'inactive' });
      }
    };
  }, [client, enabled, options, targetKey]);

  useEffect(() => {
    const node = pagerRef.current;
    if (!enabled || !node) return;
    const update = (value: boolean) => setNear(previous => previous?.key === targetKey && previous.value === value ? previous : { key: targetKey, value });
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(([entry]) => update(entry.isIntersecting), { rootMargin: '800px 0px', threshold: 0 });
      observer.observe(node);
      return () => observer.disconnect();
    }
    const measure = () => {
      const rect = node.getBoundingClientRect();
      update(rect.top <= window.innerHeight + 800 && rect.bottom >= -800);
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => { window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [enabled, targetKey]);

  useEffect(() => () => {
    // Let a promoted row finish warming the browser cache for its visible cards.
    if (currentKey.current !== targetKey) photos.cancel();
  }, [photos, enabled, targetKey]);

  useEffect(() => {
    const results = resultsRef.current;
    if (!enabled || !results || near?.key !== targetKey || !near.value || prefetched?.key !== targetKey) return;
    const urls = [...new Set(prefetched.data.warehouses.slice(0, policy.columns)
      .map(warehouse => warehouse.images[0] ?? warehouse.image).filter(Boolean))];
    let cancel: (() => void) | undefined;
    const schedule = () => {
      if (cancel) return;
      cancel = defer(() => {
        cancel = undefined;
        const visiblePending = [...results.querySelectorAll('img')].some(image => {
          const rect = image.getBoundingClientRect();
          return !image.complete && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        });
        if (!visiblePending) urls.forEach(url => photos.preload(url));
      });
    };
    schedule();
    // Image events do not bubble. Capture them before scheduling an idle check
    // so React's normal load/fallback state can settle first.
    results.addEventListener('load', schedule, true);
    results.addEventListener('error', schedule, true);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancel?.();
      results.removeEventListener('load', schedule, true);
      results.removeEventListener('error', schedule, true);
      window.removeEventListener('scroll', schedule);
    };
  }, [enabled, near, photos, policy.columns, prefetched, resultsRef, targetKey]);

  return pagerRef;
}
