// This module is used only by the build. The browser receives ordered IDs.
const LIMITS = { states: 6, cities: 6, micromarkets: 5 };
const validSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(value);

function listingCount(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid navigation listing count for ${label}`);
  }
  return value;
}

function rank(rows, limit) {
  return rows.sort((a, b) => b.count - a.count
    || a.label.localeCompare(b.label, 'en') || a.id.localeCompare(b.id, 'en'))
    .slice(0, limit).map(row => row.id);
}

/**
 * API counts determine popularity. Existing buildable listing routes determine
 * eligibility. Never advertise an API record whose listing page is not built.
 */
export function popularLocationIds({ cities, states, micromarkets }, aggregates, cityMinListings) {
  const result = { states: [], cities: [], micromarkets: [] };
  for (const [category, summaries, minimum] of [
    ['states', states, 1], ['cities', cities, cityMinListings],
  ]) {
    if (!Array.isArray(aggregates?.[category])) throw new Error(`Missing ${category} navigation counts`);
    const routes = new Map(summaries.filter(place => validSlug(place.slug) && place.count >= minimum)
      .map(place => [place.slug, place]));
    const seen = new Set();
    const rows = [];
    for (const place of aggregates[category]) {
      if (!place || !validSlug(place.slug)) throw new Error(`Invalid ${category} navigation record`);
      const count = listingCount(place.listings, `${category}/${place.slug}`);
      if (seen.has(place.slug)) throw new Error(`Duplicate ${category} navigation record: ${place.slug}`);
      seen.add(place.slug);
      const route = routes.get(place.slug);
      if (route && count >= minimum) rows.push({ id: `${category}/${place.slug}`, label: route.canonical, count });
    }
    if (routes.size > 0 && rows.length === 0) {
      throw new Error(`No eligible ${category} navigation counts for existing inventory`);
    }
    result[category] = rank(rows, LIMITS[category]);
  }

  // summarizeMicromarkets already reads /micromarkets and applies hasPage.
  const seen = new Set();
  const rows = [];
  for (const place of micromarkets) {
    const count = listingCount(place.count, `micromarkets/${place.citySlug}/${place.slug}`);
    if (!count || !validSlug(place.slug) || !validSlug(place.citySlug) || !place.parentCity
      || ['peb', 'rcc'].includes(place.slug)) continue;
    const id = `micromarkets/${place.citySlug}/${place.slug}`;
    if (seen.has(id)) throw new Error(`Duplicate micromarket navigation record: ${id}`);
    seen.add(id);
    rows.push({ id, label: place.canonical, count });
  }
  result.micromarkets = rank(rows, LIMITS.micromarkets);
  return result;
}
