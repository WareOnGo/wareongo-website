// Shared by listing metadata and build-time route enumeration. The API owns
// actual search results; these helpers mirror its exact geography/type rules.
const CITY_ALIASES = {
  bangalore: 'Bengaluru', bombay: 'Mumbai', calcutta: 'Kolkata',
  madras: 'Chennai', gurgaon: 'Gurugram',
};

export function canonicalListingLocation(raw, type) {
  const lower = String(raw ?? '').trim().toLowerCase();
  if (!lower) return null;
  if (type === 'city' && CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  return lower.split(/\s+/).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

// A single type filter has always been a case-insensitive contains match in
// the API: a PEB + RCC building belongs in either type's listing results.
export const matchesListingType = (raw, type) => String(raw ?? '').toUpperCase().includes(type.toUpperCase());

export const countListingTypes = warehouses => ({
  PEB: warehouses.filter(w => matchesListingType(w.warehouseType, 'PEB')).length,
  RCC: warehouses.filter(w => matchesListingType(w.warehouseType, 'RCC')).length,
});
