import { blogSummaries as generated } from './blogSummaries.generated';
import { normalizeHeadingCase } from '@/lib/headingCase';
import type { Blog } from './blogs';

export type BlogSummary = Pick<Blog, 'slug' | 'title' | 'description' | 'updated' | 'thumbnail'>;

// Keep index cards and related links consistent with the full article title.
export const blogSummaries = normalizeHeadingCase(generated);
