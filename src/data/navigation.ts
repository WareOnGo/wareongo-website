import { CITIES, STATES, MICROMARKETS, CITY_MIN_LISTINGS, POPULAR_LOCATION_IDS } from './locations.generated';
import { createLocationCatalogue, featuredLocations } from '@/lib/locationNavigation';

// The same build snapshot and visibility gates used by the footer and sitemap.
// A future search control can import this without fetching the full inventory.
export const locationCatalogue = createLocationCatalogue({
  cities: CITIES, states: STATES, micromarkets: MICROMARKETS, cityMinListings: CITY_MIN_LISTINGS,
});

// API popularity and ordering are computed in generate-locations.mjs.
export const popularLocations = {
  states: featuredLocations(locationCatalogue, 'states', POPULAR_LOCATION_IDS.states),
  cities: featuredLocations(locationCatalogue, 'cities', POPULAR_LOCATION_IDS.cities),
  micromarkets: featuredLocations(locationCatalogue, 'micromarkets', POPULAR_LOCATION_IDS.micromarkets),
};

export const PRIMARY_LINKS = [
  { label: 'Listings', href: '/listings' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'About Us', href: '/about-us' },
] as const;

export const WAREHOUSE_REQUEST = { label: 'Request a Warehouse', href: '/request-warehouse' };

// Keep in sync with the single desktop/mobile boundary in navigation.css.
export const NAVIGATION_DESKTOP_QUERY = '(min-width: 1280px)';
