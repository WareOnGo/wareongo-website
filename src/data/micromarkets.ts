// Editorial content for micromarket listing pages, authored in the CMS
// (MicromarketPage table) and pulled into ./micromarkets.generated.ts at build
// time by scripts/generate-micromarkets.mjs. Same shape as ./blogs.ts — this
// module holds the types and re-exports the generated data, so importers never
// touch the generated file directly.
//
// This data is the switch behind the two micromarket page layouts:
//
//   * no PUBLISHED row for a micromarket  → the plain listing grid it has
//     always rendered (src/pages/LocationListings.tsx)
//   * a PUBLISHED row                     → the editorial template
//     (src/pages/MicromarketPage.tsx), rendered over the same live listings
//
// Nothing here carries a number. Counts, rent and size ranges, the construction
// mix, compliance counts and the peer rent chart are all computed from live
// inventory in src/lib/micromarketStats.ts, so authored copy can never
// contradict the listings sitting underneath it on the same page.

export interface MicromarketImage {
  /** Absolute URL on the R2 public host — uploaded through the CMS. */
  url: string;
  alt: string;
  /** Intrinsic size of the stored file, so the img reserves its box before loading. */
  width: number;
  height: number;
}

export interface MicromarketFaq {
  q: string;
  a: string;
}

/**
 * Manual corrections to the figures the site derives from live listings.
 *
 * Partial: any key left out stays computed. See applyStatOverrides in
 * src/lib/micromarketStats.ts for how they merge, and the CMS schema for why
 * the listing count, the construction mix and the peer chart are not in here.
 */
export interface MicromarketStatOverrides {
  rent?: { min?: number | null; median?: number | null; max?: number | null };
  size?: { min?: number | null; median?: number | null; max?: number | null };
  clearHeight?: { min?: number | null; median?: number | null; max?: number | null };
  docksMedian?: number | null;
  fireNoc?: number | null;
  commercialClu?: number | null;
}

export interface MicromarketContent {
  /** The {city} segment of /listings/city/{citySlug}/{slug}. */
  citySlug: string;
  /** The {micromarket} segment. Unique only within its parent city. */
  slug: string;
  /** <title> tag. */
  seoTitle: string;
  /** Meta description + CollectionPage.description. */
  metaDescription: string;
  /** On-page H1. */
  h1: string;
  /** Small uppercase line above the H1; falls back to a derived default. */
  heroEyebrow?: string;
  /** Lead paragraph. The one required prose slot. */
  heroProse: string;
  heroImage?: MicromarketImage;
  /** Section headings. Absent falls back to a default built from the place name. */
  marketHeading?: string;
  marketProse?: string;
  marketImage?: MicromarketImage;
  rentsHeading?: string;
  rentsProse?: string;
  specHeading?: string;
  specProse?: string;
  inventoryHeading?: string;
  /** Rendered as an accordion and emitted as FAQPage LD from the same array. */
  faqs: MicromarketFaq[];
  /** Slugs of blogs to cross-link in the page footer. Unresolvable ones are dropped. */
  relatedBlogs: string[];
  /** Absent when an editor has corrected nothing, which is the normal case. */
  statOverrides?: MicromarketStatOverrides;
}

import { micromarkets as generated } from './micromarkets.generated';
import { DEV_MICROMARKETS } from './micromarkets.dev';

/**
 * CMS content, plus the dev placeholders when running under `vite dev`.
 *
 * `__DEV_SERVER__` is `command === 'serve'` (vite.config.ts), so this is
 * statically `false` in `build` and `build:dev` alike — Rollup drops the branch
 * and tree-shakes ./micromarkets.dev out of the bundle. It is not
 * `import.meta.env.DEV`, which would be true for `build:dev` and let the
 * placeholders ship.
 *
 * Real content wins on a slug collision, so a placeholder can never shadow a
 * page someone has actually written.
 */
const all: MicromarketContent[] = __DEV_SERVER__
  ? [
      ...generated,
      ...DEV_MICROMARKETS.filter(
        (d) => !generated.some((g) => g.citySlug === d.citySlug && g.slug === d.slug),
      ),
    ]
  : generated;

export { all as micromarkets };

/**
 * A micromarket is keyed by (citySlug, slug): the same locality tag can exist
 * under two cities, and only the parent city's URL is the one that resolves.
 */
export const getMicromarketContent = (
  citySlug: string,
  slug: string,
): MicromarketContent | undefined =>
  all.find((m) => m.citySlug === citySlug && m.slug === slug);
