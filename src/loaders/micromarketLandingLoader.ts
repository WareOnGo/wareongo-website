import type { LoaderFunctionArgs } from 'react-router-dom';
import { AD_MIN_SIZE, getMicromarketAdPage, type MicromarketAdPage, type AdLandingWarehouse, type MicromarketLandingData, type AdInventoryRule } from '@/data/micromarketAdPages';
import { getMicromarkets, fetchMicromarkets } from '@/services/micromarketsAPI';
import { warehouseAPI, transformWarehouseData, parseRatePerSqft, type Warehouse } from '@/services/warehouseAPI';

const isBuilt = (warehouse: Warehouse) => !/\b(land|plot|bts)\b|build[\s-]*to[\s-]*suit/i.test(warehouse.warehouseType ?? '');

/** Full inventory, including every page: a six-card sample cannot define rents. */
export async function readMarketInventory(city: string, market?: string, signal?: AbortSignal) {
  const filters = { city, ...(market ? { micromarket: market.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : {}), locationMatch: 'exact' as const };
  const first = await warehouseAPI.getWarehouses(1, 100, filters, signal, 'live');
  const warehouses = [...first.data];
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const next = await warehouseAPI.getWarehouses(page, 100, filters, signal, 'live');
    warehouses.push(...next.data);
  }
  if (new Set(warehouses.map(item => item.id)).size !== first.pagination.totalItems) {
    throw new Error(`Incomplete inventory for ${market ?? city}. Please retry.`);
  }
  return warehouses;
}

const tagKey = (tag: string) => tag.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
/** Include the union once, then remove neighboring tags before counting or pricing. */
export function selectAdInventory(warehouses: Warehouse[], rule: AdInventoryRule): Warehouse[] {
  const unique = new Map<number, Warehouse>();
  for (const warehouse of warehouses) {
    const tags = new Set((warehouse.micromarket ?? []).map(tagKey));
    if (rule.includeAny?.length && !rule.includeAny.some(tag => tags.has(tagKey(tag)))) continue;
    if (rule.includeAll?.some(tag => !tags.has(tagKey(tag)))) continue;
    if (rule.exclude?.some(tag => tags.has(tagKey(tag)))) continue;
    unique.set(warehouse.id, warehouse);
  }
  return [...unique.values()];
}

/** All measured asking rents, BTS excluded; whole rupees match the sample. */
export function marketRentRange(warehouses: Warehouse[], floor = 0) {
  const rates = warehouses.filter(isBuilt).map(item => parseRatePerSqft(item.ratePerSqft))
    .filter((rate): rate is number => rate !== null);
  if (rates.length < 10) return null;
  const min = Math.max(floor, Math.floor(Math.min(...rates) * 110 / 100));
  const max = Math.floor(Math.max(...rates) * 115 / 100);
  return max >= min ? { min, max, label: `₹${min} to ₹${max}` } : null;
}

export function marketListings(warehouses: Warehouse[], name: string, policy?: MicromarketAdPage['listingPolicy'], page?: MicromarketAdPage): AdLandingWarehouse[] {
  const addressPattern = policy?.addressTerm ? new RegExp('\\b' + policy.addressTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i') : null;
  return warehouses.filter(isBuilt).filter(warehouse => !addressPattern || addressPattern.test(warehouse.address ?? '')).map(warehouse => {
    const card = transformWarehouseData(warehouse);
    const tags = new Set((warehouse.micromarket ?? []).map(tagKey));
    const locality = page && page.slug !== 'peenya'
      ? ['Chokkahalli', 'Soukya Road', 'Ekarajapura', 'Budihal', 'T Begur', 'Kelamangalam', 'Uddanapalli', 'Jigani', 'Bommasandra', 'Hosur Road'].find(tag => tags.has(tagKey(tag))) ?? name : name;
    return { id: card.id, locality, address: card.address, city: page?.city, state: page?.state, region: page?.citySlug === 'hosur' ? 'Tamil Nadu' : page?.city,
      size: card.size, price: card.price,
      ceilingHeight: card.ceilingHeight, warehouseType: card.warehouseType, numberOfDocks: card.numberOfDocks,
      fireCompliance: card.fireCompliance, image: card.image, imageFallback: card.imageFallbacks[0] ?? null };
  }).filter(card => card.size > 0 && (!policy || (card.price !== null && card.price >= policy.minimumRent))).sort((a, b) =>
    Number(/shed/i.test(b.warehouseType ?? '')) - Number(/shed/i.test(a.warehouseType ?? ''))
    || Number(Boolean(b.image)) - Number(Boolean(a.image)) || b.id - a.id);
}

export function featuredMarketListings(listings: AdLandingWarehouse[], floor: number): AdLandingWarehouse[] {
  const eligible = listings.filter(item => item.price !== null && item.price >= floor && item.image);
  // Same bands as the /bangalore featured cards; empty bands fill in listing order.
  const selected = [[5000, 15000], [15000, 30000], [50000, Infinity]].flatMap(([min, max]) => {
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
  const page = getMicromarketAdPage(params.micromarket ?? '', params.citySlug ?? 'bengaluru');
  if (!page) throw new Response('Not found', { status: 404 });
  return loadMicromarketAdInventory(page, request.signal);
}

export async function loadMicromarketAdInventory(page: MicromarketAdPage, signal?: AbortSignal, preview = false): Promise<MicromarketLandingData> {
  const sources = new Map<string, Promise<Warehouse[]>>();
  const read = async (rule: AdInventoryRule) => {
    const city = rule.city ?? page.city;
    const key = JSON.stringify([city, rule.market]);
    if (!sources.has(key)) sources.set(key, readMarketInventory(city, rule.market, signal));
    return selectAdInventory(await sources.get(key), rule);
  };
  const [markets, own, inventories, mapStock] = await Promise.all([
    preview ? fetchMicromarkets(signal) : getMicromarkets(),
    read(page.inventory),
    Promise.all(page.rentGuide.markets.map(async market => ({
      ...market, warehouses: await read(market.inventory ?? { market: market.name }),
    }))),
    Promise.all(page.mapLocations.filter(location => location.inventory).map(async location => ({ slug: location.slug, warehouses: await read(location.inventory) }))),
  ]);
  const ownRange = marketRentRange(own, page.rentFloor);
  const floor = Math.max(page.listingPolicy?.minimumRent ?? 0, ownRange?.min ?? page.rentFloor);
  // Counts and rents use the full inventory; the cards stop at the ad pages' size floor.
  const listings = marketListings(own, page.name, { ...page.listingPolicy, minimumRent: floor }, page).filter(listing => listing.size >= AD_MIN_SIZE);
  return {
    slug: page.slug, citySlug: page.citySlug, listings, featured: featuredMarketListings(listings, floor),
    listingCount: own.length,
    marketCounts: { ...Object.fromEntries(markets.filter(market => market.citySlug === page.citySlug).map(market => [market.slug, market.listings])),
      ...Object.fromEntries(mapStock.map(market => [market.slug, market.warehouses.length])), [page.slug]: own.length,
      ...(page.slug === 'electronic-city-jigani-bommasandra' ? { 'hosur-road': own.length } : {}),
    },
    marketImages: Object.fromEntries(mapStock.flatMap(market => {
      const listing = marketListings(market.warehouses, market.slug).find(listing => listing.image);
      return listing ? [[market.slug, { url: listing.image, fallback: listing.imageFallback ?? null }]] : [];
    })),
    rentRows: inventories.flatMap(market => {
      const range = marketRentRange(market.warehouses, market.floor);
      return range ? [{ area: market.label, rent: range.label }] : [];
    }),
    rentRange: ownRange?.label ?? null,
  };
}
