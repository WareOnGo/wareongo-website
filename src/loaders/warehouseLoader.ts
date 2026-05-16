import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseDetailData, WarehouseAPIError } from '@/services/warehouseAPI';

export type WarehouseLoaderData = ReturnType<typeof transformWarehouseDetailData>;

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
