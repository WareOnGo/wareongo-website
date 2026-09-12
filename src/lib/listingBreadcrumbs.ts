import type { BreadcrumbItem } from '../components/Breadcrumbs';
import type { LocationStats } from '../services/locationsAPI';
import type { Micromarket } from '../services/micromarketsAPI';

type Place = Pick<LocationStats, 'name' | 'slug' | 'stateSlug' | 'listingIds'>;
type Market = Pick<Micromarket, 'name' | 'slug' | 'citySlug' | 'stateSlug' | 'listingIds' | 'listings' | 'hasPage'>;
type Route = { canonical: string; slug: string; count: number };

/** Only link inventory routes enumerated by the listing loaders. */
export function createListingBreadcrumbs(
  locations: { cities: Place[]; states: Place[] },
  markets: Market[],
  routes: { cities: Route[]; states: Route[] },
) {
  const cities = new Map(routes.cities.filter(p => p.count > 0).map(p => [p.slug, p]));
  const states = new Map(routes.states.filter(p => p.count > 0).map(p => [p.slug, p]));
  // The API validates the outer arrays, but a partial/older response can still
  // contain malformed rows. Auxiliary metadata must not break warehouse pages.
  const hasMembership = (place: Place) => typeof place?.slug === 'string' && Array.isArray(place.listingIds);
  const validCities = locations.cities.filter(hasMembership);
  const validStates = locations.states.filter(hasMembership);
  const validMarkets = markets.filter(m => m && typeof m.name === 'string' && m.name.trim()
    && typeof m.slug === 'string' && Array.isArray(m.listingIds) && Number.isFinite(m.listings));
  const cityMetadata = new Map(validCities.map(p => [p.slug, p]));
  const stateItem = (slug: string | null | undefined): BreadcrumbItem[] => {
    const place = states.get(slug ?? '');
    return place ? [{ label: place.canonical, path: `/listings/state/${place.slug}` }] : [];
  };
  const cityItem = (slug: string): BreadcrumbItem[] => {
    const place = cities.get(slug);
    return place ? [{ label: place.canonical, path: `/listings/city/${place.slug}` }] : [];
  };

  // Membership comes from the backend's canonical groups, which already merge
  // aliases (Bangalore/Bengaluru, Gurgaon/Gurugram, etc.). Do not guess URLs
  // from free-text city names, addresses or micromarket tags.
  const stateByListing = new Map<number, Place>();
  const cityByListing = new Map<number, Place>();
  for (const state of validStates) {
    if (states.has(state.slug)) for (const id of state.listingIds) stateByListing.set(id, state);
  }
  for (const city of validCities) {
    if (cities.has(city.slug)) for (const id of city.listingIds) cityByListing.set(id, city);
  }
  const marketsByListing = new Map<number, Market[]>();
  for (const market of validMarkets) {
    // PEB/RCC occupy the same URL slot and take precedence over locality names.
    if (!market.hasPage || !market.citySlug || !cities.has(market.citySlug)
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(market.slug)
      || ['peb', 'rcc'].includes(market.slug) || market.listings <= 0) continue;
    for (const id of market.listingIds) {
      const list = marketsByListing.get(id) ?? [];
      list.push(market);
      marketsByListing.set(id, list);
    }
  }

  return {
    city(slug: string): BreadcrumbItem[] {
      return stateItem(cityMetadata.get(slug)?.stateSlug);
    },
    micromarket(citySlug: string, slug: string, name: string): BreadcrumbItem[] {
      const market = validMarkets.find(m => m.citySlug === citySlug && m.slug === slug);
      return [
        ...stateItem(market?.stateSlug ?? cityMetadata.get(citySlug)?.stateSlug),
        ...(cities.get(citySlug)?.canonical === name ? [] : cityItem(citySlug)),
      ];
    },
    warehouse(id: number): BreadcrumbItem[] {
      const state = stateByListing.get(id);
      const city = cityByListing.get(id);
      // A city group can contain outlier listings in a different state. Keep
      // the listing's verified state instead of presenting a false hierarchy.
      const matchingCity = city && (!state || !city.stateSlug || city.stateSlug === state.slug) ? city : undefined;
      const market = matchingCity ? (marketsByListing.get(id) ?? [])
        .filter(m => m.citySlug === matchingCity.slug && (!state || !m.stateSlug || m.stateSlug === state.slug))
        .sort((a, b) => b.listings - a.listings || a.slug.localeCompare(b.slug))[0] : undefined;
      return [
        ...stateItem(state?.slug ?? matchingCity?.stateSlug),
        ...(matchingCity ? cityItem(matchingCity.slug) : []),
        ...(market && market.name !== cities.get(matchingCity!.slug)?.canonical
          ? [{ label: market.name, path: `/listings/city/${market.citySlug}/${market.slug}` }] : []),
      ];
    },
  };
}
