import { queryOptions } from '@tanstack/react-query';
import { warehouseAPI, transformWarehouseData } from '@/services/warehouseAPI';

export type ListingsFilters = NonNullable<Parameters<typeof warehouseAPI.getWarehouses>[2]>;

/** Visible results and preloads must share both their identity and their data shape. */
export function listingsQueryOptions(page: number, pageSize: number, filters: ListingsFilters) {
  return queryOptions({
    queryKey: ['warehouses', filters, page, pageSize] as const,
    queryFn: async ({ signal }) => {
      const response = await warehouseAPI.getWarehouses(page, pageSize, filters, signal);
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
