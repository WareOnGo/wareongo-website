// Informational blogs — deliberately "hidden": not linked from the navbar or
// footer, but present in sitemap.xml and llms.txt so search engines and AI
// assistants can find and cite them. Each blog targets informational queries
// (e.g. "PEB vs RCC warehouse") that transactional listing pages can't rank for.
//
// Content is structured (blocks + FAQs) so the renderer stays simple and the
// FAQPage JSON-LD is generated from the same source of truth as the visible Q&A.
//
// The blogs themselves now live in the CMS (Blog table) and are pulled at
// build time into ./blogs.generated.ts by scripts/generate-blogs.mjs. This
// module keeps the types and re-exports that data, so importers are unchanged.

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogTable {
  headers: string[];
  rows: string[][];
}

export interface BlogImage {
  /** Absolute URL on the R2 public host — uploaded through the CMS. */
  url: string;
  alt: string;
  /** Intrinsic size of the stored file, so the img reserves its box before loading. */
  width: number;
  height: number;
}

export type BlogBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; table: BlogTable }
  /**
   * One to four images. The collage layout follows from the count — 1 full
   * width, 2 side by side, 3 in a row, 4 as a 2×2 — so there is no layout field
   * that could contradict the images. See the renderer in pages/BlogDetail.tsx.
   */
  | { kind: 'images'; images: BlogImage[]; caption?: string };

export interface Blog {
  slug: string;
  /** On-page H1 */
  title: string;
  /** <title> tag */
  seoTitle: string;
  /** Meta description */
  description: string;
  /** Direct answer shown in the "In short" callout — first thing AI engines extract. */
  summary: string;
  /**
   * Optional byline. Rendered under the H1 and emitted as an Article.author
   * Person; absent falls back to crediting the WareOnGo organisation.
   */
  author?: string;
  /** ISO date — rendered on page and used as Article dateModified. */
  updated: string;
  /** ISO date first published — defaults to `updated` in the Article LD when absent. */
  published?: string;
  /** Keyword phrases for the Article JSON-LD (joined comma-separated). */
  keywords?: string[];
  blocks: BlogBlock[];
  faqs: BlogFaq[];
  /** Slugs of related blogs, rendered as cross-links. */
  related: string[];
}

export { blogs } from './blogs.generated';

import { blogs as allBlogs } from './blogs.generated';

export const getBlogBySlug = (slug: string): Blog | undefined =>
  allBlogs.find((g) => g.slug === slug);
