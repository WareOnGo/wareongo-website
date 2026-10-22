import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { listingsQueryOptions, type ListingsFilters } from '@/lib/listingsQuery';
import type { ListingsLoaderData } from '@/loaders/warehouseLoader';

/** Append pages while sharing the existing next-page preload and its request. */
export function useInfiniteListings({ page, pageSize, filters, hydrated, seed }: {
  page: number;
  pageSize: number;
  filters: ListingsFilters;
  hydrated: boolean;
  seed?: ListingsLoaderData;
}) {
  const client = useQueryClient();
  const location = useLocation();
  const savedStart = hydrated ? location.state?.listingStartPage : undefined;
  const keyFor = (start: number) => ['listing-feed', location.pathname, listingsQueryOptions(start, pageSize, filters).queryKey];
  // history.state survives a reload; the in-memory feed does not. A fresh
  // document must begin at its own URL/HTML batch, never replay earlier pages.
  const startPage = Number.isSafeInteger(savedStart) && savedStart > 0 && savedStart <= page
    && client.getQueryData(keyFor(savedStart)) ? savedStart : page;
  const queryKey = keyFor(startPage);
  const cached = client.getQueryData(queryKey);
  const initial = seed?.pagination.currentPage === startPage ? seed : undefined;
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: startPage,
    queryFn: async ({ pageParam, signal }) => {
      const options = listingsQueryOptions(pageParam, pageSize, filters);
      // fetchQuery adopts a speculative request. Cancelling a discarded feed
      // must also release its otherwise unobserved page request.
      const abort = () => { void client.cancelQueries({ queryKey: options.queryKey, exact: true, type: 'inactive' }); };
      signal.throwIfAborted();
      signal.addEventListener('abort', abort, { once: true });
      try { return await client.fetchQuery(options); }
      finally { signal.removeEventListener('abort', abort); }
    },
    getNextPageParam: last => last.warehouses.length && last.pagination.currentPage < last.pagination.totalPages
      ? last.pagination.currentPage + 1 : undefined,
    enabled: hydrated,
    initialData: initial ? { pages: [{ warehouses: initial.warehouses, pagination: initial.pagination }], pageParams: [startPage] } : undefined,
    initialDataUpdatedAt: startPage > 1 ? 0 : initial?.fetchedAt ?? 0,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 60_000,
    gcTime: typeof window === 'undefined' ? Infinity : 30 * 60_000,
    // Returning from a property restores the same list and position. Avoid a
    // multi-page refresh moving cards underneath the reader on focus/return.
    refetchOnMount: !cached,
    refetchOnWindowFocus: false,
  });
  return { ...query, startPage };
}
