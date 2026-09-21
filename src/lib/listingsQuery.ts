import { queryOptions } from '@tanstack/react-query';
import { warehouseAPI, transformWarehouseData } from '@/services/warehouseAPI';

export type ListingsFilters = NonNullable<Parameters<typeof warehouseAPI.getWarehouses>[2]>;

/** Visible results and preloads share one paginated API request and cache key. */
export function listingsQueryOptions(page: number, pageSize: number, filters: ListingsFilters) {
  return queryOptions({
    queryKey: ['warehouses', filters, page, pageSize] as const,
    queryFn: async ({ signal }) => {
      signal.throwIfAborted();
      const response = await warehouseAPI.getWarehouses(page, pageSize, filters, signal);
      return { warehouses: response.data.map(transformWarehouseData), pagination: response.pagination };
    },
    // The transport already retries transient reads.
    retry: false,
    staleTime: 60_000,
  });
}

export type ListingsQueryData = Awaited<ReturnType<ReturnType<typeof listingsQueryOptions>['queryFn']>>;
