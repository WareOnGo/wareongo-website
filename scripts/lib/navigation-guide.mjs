/** Emit a small card, not the complete CMS article, into the shared header. */
export function selectNavigationGuide(pages, markets) {
  const segment = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  const eligible = markets.filter(m => m.hasPage && m.name && m.parentCity
    && [m.stateSlug, m.citySlug, m.slug].every(segment)
    && !['peb', 'rcc'].includes(m.slug)
    && pages.some(page => page.citySlug === m.citySlug && page.slug === m.slug));
  eligible.sort((a, b) => Number(b.citySlug === 'hyderabad' && b.slug === 'kompally')
    - Number(a.citySlug === 'hyderabad' && a.slug === 'kompally')
    || (b.listings ?? 0) - (a.listings ?? 0) || a.name.localeCompare(b.name, 'en'));
  const market = eligible[0];
  if (!market) return null;
  const page = pages.find(p => p.citySlug === market.citySlug && p.slug === market.slug);
  const image = page.heroImage;
  return {
    label: market.name,
    parentLabel: market.parentCity,
    href: `/overview/${market.stateSlug}/${market.citySlug}/${market.slug}`,
    ...(image?.url?.startsWith('https://') && image.alt ? { image: {
      url: image.url, alt: image.alt,
      ...(image.width > 0 ? { width: image.width } : {}),
      ...(image.height > 0 ? { height: image.height } : {}),
    } } : {}),
  };
}
