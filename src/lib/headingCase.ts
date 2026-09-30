// Title case for headings only. Prose, FAQ questions, names, and units retain
// their authored spelling; do not apply CSS capitalize to whole sections.
const MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'as', 'at', 'by', 'in', 'of', 'on', 'per', 'to', 'via', 'vs',
  'above', 'across', 'after', 'against', 'along', 'among', 'around', 'before',
  'behind', 'below', 'between', 'beyond', 'during', 'from', 'inside', 'into',
  'like', 'near', 'onto', 'outside', 'over', 'through', 'throughout',
  'toward', 'towards', 'under', 'until', 'upon', 'with', 'within', 'without',
]);
const UNITS = new Set(['sq', 'ft', 'sqft', 'sqm', 'm', 'mm', 'cm', 'km', 'kg', 'kva', 'kw', 'mw']);

// Protect Markdown destinations, literal URLs, code, and entities. Emphasis
// markers stay in place while their visible words take part in the full title.
const TOKENS = /\]\([^)]*\)|(?:https?:\/\/|mailto:|tel:)[^\s<>]+|`[^`]*`|&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);|([\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*)/gu;

export function titleCase(text: string): string {
  const words = [...text.matchAll(TOKENS)].filter(match => match[1]);
  let index = 0;
  return text.replace(TOKENS, (match, word: string | undefined, offset: number) => {
    if (!word) return match;
    const previous = words[index - 1];
    const gap = previous ? text.slice(previous.index! + previous[0].length, offset) : '';
    const boundary = index === 0 || index === words.length - 1
      || /(?:[:.!?|]|\s[-\u2013\u2014])[\s"'“”‘’*_[(]*$/u.test(gap);
    index += 1;
    const lower = word.toLowerCase();
    if (lower === 'a' && previous?.[1].toLowerCase() === 'grade') return 'A';
    // Keep WareOnGo, 3PLs, PEB, NOCs, ₹/sqft, kVA and Grade A intact.
    if (UNITS.has(lower) || /^\d/u.test(word) || /[\p{Ll}\p{N}]\p{Lu}/u.test(word)
      || /^\p{Lu}{2,}/u.test(word)) return word;
    if (!boundary && MINOR_WORDS.has(lower)) return lower;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

/** Apply casing at the CMS read boundary, before rendering and structured data. */
export function normalizeHeadingCase<T>(content: T): T {
  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    const headingBlock = 'kind' in value && (value.kind === 'h2' || value.kind === 'h3');
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
      const heading = key === 'title' || key === 'seoTitle' || key === 'h1'
        || key.endsWith('Heading') || (headingBlock && key === 'text');
      return [key, heading && typeof child === 'string' ? titleCase(child) : visit(child)];
    }));
  }
  return visit(content) as T;
}
