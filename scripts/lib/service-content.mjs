const SLUGS = ['warehouse-search', 'build-to-suit', 'lease-negotiation', 'compliance-procurement'];
const written = value => typeof value === 'string' && value.trim().length > 0;
export const hasServiceWriting = page => Array.isArray(page?.blocks) && page.blocks.some(b =>
  b?.kind === 'p' ? written(b.text)
    : b?.kind === 'ul' || b?.kind === 'ol' ? Array.isArray(b.items) && b.items.some(written)
      : b?.kind === 'table' ? Array.isArray(b.table?.rows) && b.table.rows.some(row => Array.isArray(row) && row.some(written)) : false,
);
const textList = list => Array.isArray(list) && list.length > 0 && list.every(written);
const httpsUrl = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
function validBlock(b) {
  if (!b || typeof b !== 'object') return false;
  switch (b.kind) {
    case 'h2': case 'h3': case 'p': return written(b.text);
    case 'ul': case 'ol': return textList(b.items);
    case 'table': return textList(b.table?.headers) && Array.isArray(b.table.rows) && b.table.rows.length > 0
      && b.table.rows.every(row => Array.isArray(row) && row.length === b.table.headers.length && row.every(cell => typeof cell === 'string'));
    case 'images': return Array.isArray(b.images) && b.images.length > 0 && b.images.length <= 4
      && b.images.every(img => img && httpsUrl(img.url) && written(img.alt) && Number.isInteger(img.width) && img.width > 0 && Number.isInteger(img.height) && img.height > 0)
      && (b.caption === undefined || typeof b.caption === 'string');
    default: return false;
  }
}

export function validateServicePages(input) {
  if (!Array.isArray(input)) throw new Error('Service pages endpoint returned an unexpected shape.');
  const seen = new Set();
  const pages = [];
  for (const p of input) {
    if (!p || !SLUGS.includes(p.slug) || seen.has(p.slug)) throw new Error('Unknown or duplicate service URL.');
    seen.add(p.slug);
    // Empty/heading-only/image-only pages must never get routes or links,
    // even if incorrectly approved outside the CMS.
    if (!hasServiceWriting(p)) continue;
    if (!['title', 'seoTitle', 'description', 'summary'].every(key => written(p[key]))
      || !p.blocks.every(validBlock) || !Array.isArray(p.faqs) || !p.faqs.every(f => f && written(f.q) && written(f.a))
      || !Array.isArray(p.keywords) || !p.keywords.every(written)) {
      throw new Error(`Invalid published service content: ${p.slug}`);
    }
    pages.push({ slug: p.slug, title: p.title, seoTitle: p.seoTitle, description: p.description,
      summary: p.summary, keywords: p.keywords, blocks: p.blocks, faqs: p.faqs });
  }
  return pages.sort((a, b) => SLUGS.indexOf(a.slug) - SLUGS.indexOf(b.slug));
}
