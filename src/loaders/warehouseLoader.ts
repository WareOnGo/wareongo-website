import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, transformWarehouseDetailData, WarehouseAPIError } from '@/services/warehouseAPI';
import { warehouseSlug, parseIdFromWarehouseSlug } from '@/lib/warehouseSlug';
import { getAllWarehouses } from './locationLoader';

type DetailData = ReturnType<typeof transformWarehouseDetailData>;
type CardData = ReturnType<typeof transformWarehouseData>;

export interface WarehouseLoaderData extends DetailData {
  related: CardData[];
}
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
// (and users get faster first paint). 21 = full 7 rows on the 3-col grid.
const LISTINGS_DEFAULT_PAGE_SIZE = 21;

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

async function findRelated(currentId: number, city: string | null | undefined, count = 6): Promise<CardData[]> {
  if (!city) return [];
  try {
    const all = await getAllWarehouses();
    const target = city.trim().toLowerCase();
    return all
      .filter((w) => w.id !== currentId && (w.city ?? '').trim().toLowerCase() === target)
      .slice(0, count)
      .map(transformWarehouseData);
  } catch {
    return [];
  }
}

export async function warehouseLoader({ params }: LoaderFunctionArgs): Promise<WarehouseLoaderData | null> {
  const slug = params.slug;
  if (!slug) return null;
  const id = parseIdFromWarehouseSlug(slug);
  if (id == null) return null;
  try {
    const warehouse = await warehouseAPI.getWarehouseById(id);
    const detail = transformWarehouseDetailData(warehouse);
    const related = await findRelated(detail.id, detail.specifications.location.city);
    return { ...detail, related };
  } catch (err) {
    if (err instanceof WarehouseAPIError && (err.code === 'WAREHOUSE_NOT_FOUND' || err.code === 'INVALID_ID')) {
      return null;
    }
    throw err;
  }
}

// Enumerate every warehouse as a SEO-friendly slug path. Runs once per build.
export async function warehouseStaticPaths(): Promise<string[]> {
  const pageSize = 50;
  const paths: string[] = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await warehouseAPI.getWarehouses(page, pageSize);
    for (const w of resp.data) {
      const sizes = w.totalSpaceSqft;
      const size = Array.isArray(sizes) ? sizes[0] : sizes;
      const slug = warehouseSlug({
        id: w.id,
        size: typeof size === 'number' ? size : null,
        warehouseType: w.warehouseType,
        city: w.city,
      });
      paths.push(`/warehouse/${slug}`);
    }
    if (page >= resp.pagination.totalPages || resp.data.length === 0) break;
    page += 1;
  }
  return paths;
}
