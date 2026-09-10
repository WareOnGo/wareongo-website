/**
 * The figures an editorial listing page renders, whatever its scope.
 *
 * Derived by the backend from live inventory — services/micromarketService.js
 * for micromarkets, services/locationService.js for cities and states, the
 * second importing statsFor from the first. One derivation, so a city median and
 * a micromarket median inside it are computed by the same code and cannot drift.
 *
 * This module is types only, and exists so the page template, the formatters and
 * the override merge are written once against the shared shape rather than three
 * times against three near-identical ones.
 */

export interface Spread {
  min: number;
  median: number;
  max: number;
}

export interface MixEntry {
  label: string;
  count: number;
  /** Share of the measured set, 0–100, rounded. */
  share: number;
}

/** One bar of the peer rent chart. */
export interface PeerRent {
  name: string;
  slug: string;
  /**
   * Where the bar links. Supplied by the backend so a consumer never has to know
   * which scope it is looking at to build the href — a micromarket bar nests
   * under its city, a city bar does not, and a state bar lives elsewhere again.
   */
  path: string;
  /** Micromarket bars only, kept for consumers that already read it. */
  citySlug?: string | null;
  medianRent: number;
  /** The page's own location, highlighted in the chart. */
  isSelf: boolean;
}

/** Everything the shared template reads off a location, and nothing scope-specific. */
export interface DerivedStats {
  /** Everything in scope, land and build-to-suit included. */
  listings: number;
  /** Built stock only — what every figure below is computed from. */
  measured: number;
  /** Asking rent, ₹/sq ft/month, published min to max with no trimming. */
  rent: Spread | null;
  size: Spread | null;
  clearHeight: Spread | null;
  docksMedian: number | null;
  construction: MixEntry[];
  flooring: MixEntry[];
  fireNoc: number;
  commercialClu: number;
  /** Which warehouses are in scope, so the grid needs no name matching here. */
  listingIds: number[];
  peers: PeerRent[];
}
