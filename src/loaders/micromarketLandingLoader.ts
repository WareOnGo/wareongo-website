import type { LoaderFunctionArgs } from 'react-router-dom';
import { getMicromarketAdPage, type AdLandingWarehouse, type MicromarketLandingData } from '@/data/micromarketAdPages';
import { getMicromarkets } from '@/services/micromarketsAPI';
import { warehouseAPI, transformWarehouseData, parseRatePerSqft, type Warehouse } from '@/services/warehouseAPI';

const isBuilt = (warehouse: Warehouse) => !/\b(land|plot|bts)\b|build[\s-]*to[\s-]*suit/i.test(warehouse.warehouseType ?? '');

/** Full inventory, including every page: a six-card sample cannot define rents. */
export async function readMarketInventory(city: string, market: string, signal?: AbortSignal) {
  const filters = { city, micromarket: market, locationMatch: 'exact' as const };
  const first = await warehouseAPI.getWarehouses(1, 100, filters, signal, 'live');
  const warehouses = [...first.data];
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const next = await warehouseAPI.getWarehouses(page, 100, filters, signal, 'live');
    warehouses.push(...next.data);
  }
  if (new Set(warehouses.map(item => item.id)).size !== first.pagination.totalItems) {
    throw new Error(`Incomplete inventory for ${market}. Please retry.`);
  }
  return warehouses;
}

/** All measured asking rents, BTS excluded; whole rupees match the sample. */
export function marketRentRange(warehouses: Warehouse[], floor = 0) {
  const rates = warehouses.filter(isBuilt).map(item => parseRatePerSqft(item.ratePerSqft))
    .filter((rate): rate is number => rate !== null);
  if (rates.length < 10) return null;
  const min = Math.max(floor, Math.floor(Math.min(...rates) * 1.1));
  const max = Math.floor(Math.max(...rates) * 1.15);
  return max >= min ? { min, max, label: `₹${min} to ₹${max}` } : null;
}

export function marketListings(warehouses: Warehouse[], name: string): AdLandingWarehouse[] {
  return warehouses.filter(isBuilt).map(warehouse => {
    const card = transformWarehouseData(warehouse);
    return { id: card.id, locality: name, address: card.address, size: card.size, price: card.price,
      ceilingHeight: card.ceilingHeight, warehouseType: card.warehouseType, numberOfDocks: card.numberOfDocks,
      fireCompliance: card.fireCompliance, image: card.image, imageFallback: card.imageFallbacks[0] ?? null };
  }).filter(card => card.size > 0).sort((a, b) =>
    Number(/shed/i.test(b.warehouseType ?? '')) - Number(/shed/i.test(a.warehouseType ?? ''))
    || Number(Boolean(b.image)) - Number(Boolean(a.image)) || b.id - a.id);
}

export function featuredMarketListings(listings: AdLandingWarehouse[], floor: number): AdLandingWarehouse[] {
  const eligible = listings.filter(item => item.price !== null && item.price >= floor && item.image);
  const selected = [[0, 5000], [5000, 20000], [20000, Infinity]].flatMap(([min, max]) => {
    const listing = eligible.find(item => item.size >= min && item.size < max);
    return listing ? [listing] : [];
  });
  for (const listing of eligible) {
    if (selected.length >= 3) break;
    if (!selected.some(item => item.id === listing.id)) selected.push(listing);
  }
  return selected;
}

export async function micromarketLandingLoader({ params, request }: LoaderFunctionArgs): Promise<MicromarketLandingData> {
  const page = getMicromarketAdPage(params.micromarket ?? '');
  if (!page) throw new Response('Not found', { status: 404 });
  const [markets, inventories] = await Promise.all([
    getMicromarkets(),
    Promise.all(page.rentGuide.markets.map(async market => ({
      ...market, warehouses: await readMarketInventory(page.city, market.name, request.signal),
    }))),
  ]);
  const own = inventories.find(market => market.slug === page.slug);
  if (!own) throw new Error(`Missing inventory configuration for ${page.name}.`);
  const ownRange = marketRentRange(own.warehouses, own.floor);
  const listings = marketListings(own.warehouses, page.name);
  return {
    slug: page.slug, listings, featured: featuredMarketListings(listings, ownRange?.min ?? own.floor ?? 0),
    listingCount: own.warehouses.length,
    marketCounts: { ...Object.fromEntries(markets.filter(market => market.citySlug === page.citySlug).map(market => [market.slug, market.listings])), [page.slug]: own.warehouses.length },
    rentRows: inventories.flatMap(market => {
      const range = marketRentRange(market.warehouses, market.floor);
      return range ? [{ area: market.label, rent: range.label }] : [];
    }),
    rentRange: ownRange?.label ?? null,
  };
}
