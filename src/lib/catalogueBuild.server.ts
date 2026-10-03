import { warehouseAPI, transformWarehouseData } from '@/services/warehouseAPI';
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE, toApiFilters, type WarehouseFilters } from '@/lib/listingSearch';

/** Reuse the real matching endpoint; never duplicate its filtering in the build. */
export async function fetchCataloguePage(page: number, filters: WarehouseFilters = DEFAULT_FILTERS) {
  const response = await warehouseAPI.getWarehouses(page, DEFAULT_PAGE_SIZE, toApiFilters(filters));
  return { warehouses: response.data.map(transformWarehouseData), pagination: response.pagination, fetchedAt: Date.now() };
}
