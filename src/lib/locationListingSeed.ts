import type { LocationListingSeed, LocationListingsLoaderData } from '@/loaders/locationLoader';
import type { ListingsLoaderData } from '@/loaders/warehouseLoader';
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE, type WarehouseFilters } from './listingSearch';
import { canonicalListingLocation, countListingTypes, matchesListingType } from './listingLocation.mjs';

export const locationListingPreset = (data: LocationListingsLoaderData): WarehouseFilters => ({
  ...DEFAULT_FILTERS,
  state: data.type === 'state' ? data.canonical : '',
  city: data.type === 'city' ? data.canonical : data.parentCity?.canonical ?? '',
  micromarket: data.type === 'micromarket' ? data.slug : '',
  warehouseTypes: data.warehouseType ? [data.warehouseType] : [],
});

/** Grid-only metadata. Overview inventories and their statistics stay intact. */
export function createLocationListingSeed(data: LocationListingsLoaderData, page?: ListingsLoaderData): LocationListingSeed {
  const filters = locationListingPreset(data);
  const inventory = data.warehouses.filter(w =>
    (!filters.city || canonicalListingLocation(w.location.city, 'city') === filters.city) &&
    (!filters.state || canonicalListingLocation(w.location.state, 'state') === filters.state) &&
    (!filters.warehouseTypes.length || filters.warehouseTypes.some(type => matchesListingType(w.warehouseType, type))),
  );
  const sizes = inventory.map(w => w.size).filter(size => typeof size === 'number' && size > 0);
  return {
    ...data, filters,
    typeCounts: countListingTypes(inventory),
    // Older cached loader payloads contain the entire inventory. Paint their
    // first page immediately, then refresh against the API (timestamp zero).
    ...(page ?? {
      warehouses: inventory.sort((a, b) => b.id - a.id).slice(0, DEFAULT_PAGE_SIZE),
      pagination: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE, totalItems: inventory.length,
        totalPages: Math.ceil(inventory.length / DEFAULT_PAGE_SIZE) },
      fetchedAt: 0,
    }),
    summary: {
      minSize: sizes.length ? Math.min(...sizes) : null,
      maxSize: sizes.length ? Math.max(...sizes) : null,
      cities: [...new Set<string>(inventory.map(w => canonicalListingLocation(w.location.city, 'city'))
        .filter((city): city is string => !!city && city.length > 2 && !city.includes(',')))].slice(0, 15),
    },
  };
}

export function readLocationListingSeed(data: LocationListingSeed | LocationListingsLoaderData): LocationListingSeed {
  if ('filters' in data && 'pagination' in data && 'summary' in data) return data;
  return createLocationListingSeed(data);
}
