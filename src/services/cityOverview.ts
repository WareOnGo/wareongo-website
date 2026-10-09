/** City overview analytics, computed once by the backend. */
import type { DerivedStats, Spread, PeerRent } from './derivedStats';
import type { EditorialImage } from '@/data/editorial';

export interface CityStockStats extends Omit<DerivedStats, 'listingIds' | 'peers'> {
  docks: Spread | null;
  engineeredFloorShare: number | null;
  samples: { rent: number; size: number; clearHeight: number; docks: number; construction: number; flooring: number };
}
export interface CityCorridor extends CityStockStats { slug: string; name: string; direction: string }
export interface CityOverviewStats {
  version: 1;
  summary: CityStockStats;
  excluded: { unbuilt: number; underConstruction: number };
  corridorMode: 'corridors' | 'localities';
  corridors: CityCorridor[];
  segments: { large: CityStockStats; small: CityStockStats };
  rentBySize: (CityStockStats & { slug: string; label: string; min: number; max: number | null })[];
  specsBySize: { large: CityStockStats; small: CityStockStats };
  micromarkets: { slug: string; name: string; listings: number; path: string | null }[];
  comparisonCities: PeerRent[];
  nearbyLabel: string;
  nearbyCities: { name: string; slug: string; path: string }[];
}
/**
 * One city an editor chose for a state page. `slug` names one of our cities in
 * that state; null (or a slug we no longer have) is a city outside our listings,
 * shown without figures or a link. `image` replaces the automatic listing photo.
 */
export interface StateCityEntry {
  name: string;
  slug: string | null;
  image: EditorialImage | null;
}
/** Optional overview slots by kind: corridors are city-only, cities state-only, compliance both. */
export interface CityOverviewContent {
  corridorHeading?: string | null;
  corridorProse?: string | null;
  complianceHeading?: string | null;
  complianceProse?: string | null;
  citiesHeading?: string | null;
  /** States: the cities section's list, in order. Absent or empty uses the four with the most listings. */
  stateCities?: StateCityEntry[] | null;
}
