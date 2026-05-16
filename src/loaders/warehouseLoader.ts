import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, transformWarehouseDetailData, WarehouseAPIError } from '@/services/warehouseAPI';

export type WarehouseLoaderData = ReturnType<typeof transformWarehouseDetailData>;
export type ListingsLoaderData = {
  warehouses: ReturnType<typeof transformWarehouseData>[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
};

// Default page-1 fetch baked into /listings at SSG time so crawlers see real cards
// (and users get faster first paint). Filter/pagination changes still re-fetch client-side.
const LISTINGS_DEFAULT_PAGE_SIZE = 20;

export async function listingsLoader(): Promise<ListingsLoaderData | null> {
  try {
    const resp = await warehouseAPI.getWarehouses(1, LISTINGS_DEFAULT_PAGE_SIZE);
    return {
      warehouses: resp.data.map(transformWarehouseData),
      pagination: resp.pagination,
    };
  } catch (err) {
    // Don't fail the whole build if the backend is briefly unreachable —
    // the client will retry on hydration.
    console.warn('[listingsLoader] failed to seed /listings:', err);
    return null;
  }
}

export async function warehouseLoader({ params }: LoaderFunctionArgs): Promise<WarehouseLoaderData | null> {
  const id = params.id;
  if (!id) return null;
  try {
    const warehouse = await warehouseAPI.getWarehouseById(id);
    return transformWarehouseDetailData(warehouse);
  } catch (err) {
    if (err instanceof WarehouseAPIError && (err.code === 'WAREHOUSE_NOT_FOUND' || err.code === 'INVALID_ID')) {
      return null;
    }
    throw err;
  }
}

// Enumerate every warehouse id by paginating the public listings endpoint.
// Runs once per build; failures here abort the build deliberately so we never ship a stale URL set.
export async function warehouseStaticPaths(): Promise<string[]> {
  const pageSize = 50;
  const paths: string[] = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await warehouseAPI.getWarehouses(page, pageSize);
    for (const w of resp.data) {
      paths.push(`/warehouse/${w.id}`);
    }
    if (page >= resp.pagination.totalPages || resp.data.length === 0) break;
    page += 1;
  }
  return paths;
}
