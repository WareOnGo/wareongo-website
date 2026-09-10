/**
 * The content shape behind every editorial overview page, whatever its scope.
 *
 * One wireframe serves micromarkets, cities and states, so one content
 * interface serves all three: the CMS form, its preview and the site template
 * are shared rather than triplicated. The scopes differ only in how a page is
 * addressed — a micromarket by (citySlug, slug), a city or state by (kind,
 * slug) — so that part lives on the interfaces that extend this one.
 *
 * Nothing here carries a number. Counts, rent and size ranges, the construction
 * mix, compliance counts and the peer rent chart are all derived from live
 * inventory by the backend, so authored copy can never contradict the listings
 * sitting underneath it on the same page.
 */

export interface EditorialImage {
  /** Absolute URL on the R2 public host — uploaded through the CMS. */
  url: string;
  alt: string;
  /** Intrinsic size of the stored file, so the img reserves its box before loading. */
  width: number;
  height: number;
}

export interface EditorialFaq {
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
export interface StatOverrides {
  rent?: { min?: number | null; median?: number | null; max?: number | null };
  size?: { min?: number | null; median?: number | null; max?: number | null };
  clearHeight?: { min?: number | null; median?: number | null; max?: number | null };
  docksMedian?: number | null;
  fireNoc?: number | null;
  commercialClu?: number | null;
}

export interface EditorialContent {
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
  heroImage?: EditorialImage;
  /** Section headings. Absent falls back to a default built from the place name. */
  marketHeading?: string;
  marketProse?: string;
  marketImage?: EditorialImage;
  rentsHeading?: string;
  rentsProse?: string;
  specHeading?: string;
  specProse?: string;
  inventoryHeading?: string;
  /** Rendered as an accordion and emitted as FAQPage LD from the same array. */
  faqs: EditorialFaq[];
  /** Slugs of blogs to cross-link in the page footer. Unresolvable ones are dropped. */
  relatedBlogs: string[];
  /** Absent when an editor has corrected nothing, which is the normal case. */
  statOverrides?: StatOverrides;
}
