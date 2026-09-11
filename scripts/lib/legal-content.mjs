export const LEGAL_SLUGS = ['privacy-policy', 'terms-of-service'];
const text = (v, max = 20000) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
  && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

/** Validate before overwriting generated content or beginning SSG. */
export function validateLegalPages(pages) {
  if (!Array.isArray(pages) || pages.length !== LEGAL_SLUGS.length
    || LEGAL_SLUGS.some(slug => pages.filter(p => p?.slug === slug).length !== 1)) {
    throw new Error('Legal pages must contain exactly one privacy-policy and one terms-of-service.');
  }
  for (const p of pages) {
    if (!text(p.title, 300) || !text(p.seoTitle, 300) || !text(p.description, 1000)
      || !date(p.effectiveDate) || !date(p.updated) || p.updated < p.effectiveDate
      || typeof p.notice !== 'string' || p.notice.length > 20000
      || !Array.isArray(p.blocks) || !p.blocks.length || p.blocks.length > 300
      || p.blocks.some(b => !b || (
        ['h2', 'h3', 'p'].includes(b.kind) ? !text(b.text) || (b.compact !== undefined && typeof b.compact !== 'boolean')
          : ['ul', 'ol'].includes(b.kind) ? !Array.isArray(b.items) || !b.items.length || b.items.length > 100 || b.items.some(t => !text(t))
            : true))) {
      throw new Error(`Invalid legal content for ${p.slug}; refusing to replace the current pages.`);
    }
  }
  return pages;
}
