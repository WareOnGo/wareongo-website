// Informational guides — deliberately "hidden": not linked from the navbar or
// footer, but present in sitemap.xml and llms.txt so search engines and AI
// assistants can find and cite them. Each guide targets informational queries
// (e.g. "PEB vs RCC warehouse") that transactional listing pages can't rank for.
//
// Content is structured (blocks + FAQs) so the renderer stays simple and the
// FAQPage JSON-LD is generated from the same source of truth as the visible Q&A.
//
// The guides themselves now live in the CMS (Guide table) and are pulled at
// build time into ./guides.generated.ts by scripts/generate-guides.mjs. This
// module keeps the types and re-exports that data, so importers are unchanged.

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideTable {
  headers: string[];
  rows: string[][];
}

export type GuideBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; table: GuideTable };

export interface Guide {
  slug: string;
  /** On-page H1 */
  title: string;
  /** <title> tag */
  seoTitle: string;
  /** Meta description */
  description: string;
  /** Direct answer shown in the "In short" callout — first thing AI engines extract. */
  summary: string;
  /** ISO date — rendered on page and used as Article dateModified. */
  updated: string;
  /** ISO date first published — defaults to `updated` in the Article LD when absent. */
  published?: string;
  /** Keyword phrases for the Article JSON-LD (joined comma-separated). */
  keywords?: string[];
  blocks: GuideBlock[];
  faqs: GuideFaq[];
  /** Slugs of related guides, rendered as cross-links. */
  related: string[];
}

export { guides } from './guides.generated';

import { guides as allGuides } from './guides.generated';

export const getGuideBySlug = (slug: string): Guide | undefined =>
  allGuides.find((g) => g.slug === slug);
