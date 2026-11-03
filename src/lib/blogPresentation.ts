import type { Blog, BlogBlock } from '@/data/blogs';
import type { BlogSummary } from '@/data/blogSummaries';
import { plainInlineText } from './inline-format';

// Editorial groupings use published slugs. New posts remain discoverable under
// Guides until assigned a topic; never infer a category from incidental words.
const TOPICS: Record<string, string> = {
  'peb-vs-rcc-warehouse': 'Warehousing',
  'grade-a-warehouse-india': 'Warehousing',
  'warehouse-compliance-checklist-india': 'Compliance',
  'warehouse-rent-india-guide': 'Leasing',
  'carpet-area-vs-built-up-area-warehouse': 'Leasing',
  'dabaspet-multimodal-logistics-park': 'Market Insights',
  'bangalore-warehousing-market': 'Market Insights',
  'built-to-suit-warehouse-india': 'Leasing',
  'vizhinjam-exim-port-warehouse': 'Market Insights',
};

export const blogTopic = (slug: string): string => Object.prototype.hasOwnProperty.call(TOPICS, slug) ? TOPICS[slug] : 'Guides';

export const STARTER_GUIDES = [
  { slug: 'carpet-area-vs-built-up-area-warehouse', label: "Know What You're Renting" },
  { slug: 'warehouse-rent-india-guide', label: 'Understand the Costs' },
  { slug: 'warehouse-compliance-checklist-india', label: 'Check the Paperwork' },
];

const timestamp = (date: string) => Number.isFinite(Date.parse(date)) ? Date.parse(date) : 0;
export const newestBlogs = (entries: BlogSummary[]): BlogSummary[] =>
  [...entries].sort((a, b) => timestamp(b.updated) - timestamp(a.updated) || a.slug.localeCompare(b.slug));

export const filterBlogs = (entries: BlogSummary[], query: string, topic: string): BlogSummary[] => {
  const words = query.trim().toLocaleLowerCase('en-IN').split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    if (topic !== 'All' && blogTopic(entry.slug) !== topic) return false;
    const text = `${entry.title} ${entry.description} ${blogTopic(entry.slug)}`.toLocaleLowerCase('en-IN');
    return words.every(word => text.includes(word));
  });
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});
export const blogDate = (date: string): string | null =>
  Number.isFinite(Date.parse(date)) ? dateFormatter.format(new Date(date)) : null;

export interface BlogHeading { id: string; text: string; index: number; level: 'h2' | 'h3' }

/** Deterministic anchors for SSR, CMS previews, duplicate and non-Latin headings. */
export const blogHeadings = (blocks: BlogBlock[]): BlogHeading[] => {
  const used = new Set<string>();
  return blocks.flatMap((block, index) => {
    if (block.kind !== 'h2' && block.kind !== 'h3') return [];
    const text = plainInlineText(block.text).trim();
    const base = `blog-section-${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'heading'}`;
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return [{ id, text, index, level: block.kind }];
  });
};

// Keep the visible reading estimate and Article.wordCount on the same text.
export const blogWordCount = (blog: Blog): number => {
  const texts = [blog.summary];
  for (const block of blog.blocks) {
    if (block.kind === 'p' || block.kind === 'h2' || block.kind === 'h3') texts.push(block.text);
    else if (block.kind === 'ul' || block.kind === 'ol') texts.push(...block.items);
    else if (block.kind === 'table') texts.push(...block.table.headers, ...block.table.rows.flat());
    else if (block.kind === 'images' && block.caption) texts.push(block.caption);
  }
  for (const faq of blog.faqs) texts.push(faq.q, faq.a);
  return texts.map(plainInlineText).join(' ').split(/\s+/).filter(Boolean).length;
};
