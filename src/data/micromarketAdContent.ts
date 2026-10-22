import type { AdPageCopy } from './adPages';

/** CMS-authored local copy. Shared sections and inventory are deliberately absent. */
export interface MicromarketAdContent {
  version: number;
  citySlug: string;
  slug: string;
  name: string;
  copy: Pick<AdPageCopy, 'heroHeading' | 'availableHeading' | 'locationsHeading' | 'areaHeading' | 'rentHeading' | 'seoTitle' | 'metaDescription'>;
  /** Without whoItSuits the page shows a single area card. */
  area: { whereItIs: string; whoItSuits?: string };
  mapBylines: { slug: string; byline: string }[];
  /** At least one of description or titled sections. */
  rentGuide: { intro: string; description?: string; sections?: { title: string; body: string }[] };
  faqs: { q: string; a: string }[];
}
