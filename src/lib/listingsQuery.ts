import { queryOptions, QueryObserver, type QueryClient, type QueryObserverResult } from '@tanstack/react-query';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';
import { fetchMicromarkets } from '@/services/micromarketsAPI';

export type ListingsFilters = NonNullable<Parameters<typeof warehouseAPI.getWarehouses>[2]> & { micromarket?: string };

/** Share reads through Query's cache; its last observer leaving aborts the read. */
function readCached<T>(client: QueryClient, queryKey: readonly unknown[], queryFn: ({ signal }: { signal: AbortSignal }) => Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  const observer = new QueryObserver(client, { queryKey, queryFn, staleTime: 60_000, retry: false });
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanUp = () => { settled = true; signal.removeEventListener('abort', abort); observer.destroy(); };
    const abort = () => { if (!settled) { cleanUp(); reject(signal.reason); } };
    const check = (result: QueryObserverResult<T>) => {
      if (settled || result.isFetching) return;
      if (result.isSuccess) { cleanUp(); resolve(result.data); }
      else if (result.isError) { cleanUp(); reject(result.error); }
    };
    signal.addEventListener('abort', abort, { once: true });
    observer.subscribe(check);
    check(observer.getCurrentResult());
  });
}

async function filteredInventoryResults(page: number, pageSize: number, filters: ListingsFilters, client: QueryClient, signal: AbortSignal) {
  signal.throwIfAborted();
  const { micromarket, minSpace, maxSpace, ...serverFilters } = filters;
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal.addEventListener('abort', abort, { once: true });
  try {
    // The API does not support micromarkets and applies area filters after an
    // incomplete page window. Fetch the scope once, then filter before paging.
    const [warehouses, markets] = await Promise.all([
      readCached(client, ['listing-inventory', serverFilters], async ({ signal: sourceSignal }) => {
        const all = new Map<number, Warehouse>();
        for (let sourcePage = 1; ; sourcePage++) {
          const response = await warehouseAPI.getWarehouses(sourcePage, 500, serverFilters, sourceSignal);
          for (const warehouse of response.data) all.set(warehouse.id, warehouse);
          if (sourcePage >= response.pagination.totalPages) break;
          if (response.data.length === 0) throw new Error('Inventory ended before its final page');
        }
        return [...all.values()];
      }, controller.signal),
      micromarket ? readCached(client, ['micromarket-membership'], ({ signal: sourceSignal }) => fetchMicromarkets(sourceSignal), controller.signal) : null,
    ]);
    signal.throwIfAborted();
    const ids = markets ? new Set(markets.find(market => market.slug === micromarket)?.listingIds ?? []) : null;
    const cities = filters.city ? new Set(filters.city.split(',').map(city => city.trim().toLowerCase())) : null;
    const rows = warehouses.filter(warehouse => (!cities || cities.has(warehouse.city.trim().toLowerCase()))
      && (!ids || ids.has(warehouse.id))
      && (minSpace === undefined && maxSpace === undefined || warehouse.totalSpaceSqft.some(space =>
        (minSpace === undefined || space >= minSpace) && (maxSpace === undefined || space <= maxSpace))));
    return {
      data: rows.slice((page - 1) * pageSize, page * pageSize),
      pagination: { currentPage: page, pageSize, totalItems: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / pageSize)) },
    };
  } finally {
    signal.removeEventListener('abort', abort);
    controller.abort();
  }
}

/** Visible results and preloads must share both their identity and their data shape. */
export function listingsQueryOptions(page: number, pageSize: number, filters: ListingsFilters, client: QueryClient) {
  return queryOptions({
    queryKey: ['warehouses', filters, page, pageSize] as const,
    queryFn: async ({ signal }) => {
      const response = filters.city && filters.micromarket || filters.minSpace !== undefined || filters.maxSpace !== undefined
        ? await filteredInventoryResults(page, pageSize, filters, client, signal)
        : await warehouseAPI.getWarehouses(page, pageSize, filters, signal);
      return {
        warehouses: response.data.map(transformWarehouseData),
        pagination: response.pagination,
      };
    },
    // The API already retries transient reads. Do not multiply that budget.
    retry: false,
    staleTime: 60_000,
  });
}

export type ListingsQueryData = Awaited<ReturnType<ReturnType<typeof listingsQueryOptions>['queryFn']>>;
