import { blogSummaries as generated } from './blogSummaries.generated';
import { normalizeHeadingCase } from '@/lib/headingCase';

// Keep index cards and related links consistent with the full article title.
export const blogSummaries = normalizeHeadingCase(generated);
