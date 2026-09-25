/** Display rules for the compact listing card. Unknown facts stay unknown. */
const knownText = (value?: string | null): string => {
  const text = value?.trim() ?? '';
  return /^(?:n\/?a|none|null|undefined|unknown|not specified|not available|-)$/i.test(text) ? '' : text;
};

export function parseClearHeight(value?: string | null): number | null {
  const match = knownText(value).match(/^(?:clear\s+height[:\s]*)?(\d+(?:\.\d+)?)\s*(?:ft\.?|feet|foot|')?$/i);
  const number = match ? Number(match[1]) : NaN;
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function parseDockCount(value?: string | null): number | null {
  const match = knownText(value).match(/^(\d+)\s*(?:(?:loading\s+)?docks?)?$/i);
  const number = match ? Number(match[1]) : NaN;
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

export function cardConstructionLabel(value?: string | null): string | null {
  const text = knownText(value);
  if (/^(peb|rcc)$/i.test(text)) return text.toUpperCase();
  if (/^(bts|build[\s-]*to[\s-]*suit)$/i.test(text)) return 'Build to Suit';
  if (/^(land|open[\s-]*land|plot)$/i.test(text)) return 'Open land';
  // Preserve genuine combined types without mislabelling them as pure PEB/RCC.
  if (/^peb\s*(?:\+|\/|&|and)\s*rcc$/i.test(text)) return 'PEB + RCC';
  return null;
}

const CITY_NAMES: Record<string, string> = {
  bangalore: 'Bengaluru', bengaluru: 'Bengaluru', bombay: 'Mumbai',
  calcutta: 'Kolkata', madras: 'Chennai', gurgaon: 'Gurugram',
};

interface MarketCount { canonical: string; slug: string; parentCity: string; count: number }
const marketKey = (value: string) => value.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
const cityKey = (value: string) => (CITY_NAMES[value.trim().toLowerCase()] ?? value.trim()).toLowerCase();

export function cardLocation({ city, address, micromarket, postalCode, markets = [] }: {
  city?: string | null; address?: string | null;
  micromarket?: string[] | null; postalCode?: string | null;
  /** Full city-scoped counts, not just the current page or filtered results. */
  markets?: readonly MarketCount[];
}): { primary: string; city: string } | null {
  const rawCity = knownText(city);
  if (!rawCity) return null;
  const canonicalCity = CITY_NAMES[rawCity.toLowerCase()] ?? rawCity;
  const locality = (micromarket ?? []).map(knownText).filter(Boolean).map(name => {
    const mapped = markets.find(market => cityKey(market.parentCity) === cityKey(canonicalCity)
      && (marketKey(market.canonical) === marketKey(name) || market.slug === marketKey(name)));
    return { name: mapped?.canonical ?? name, count: mapped?.count ?? 0 };
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en-IN'))[0]?.name;
  return { primary: locality || knownText(address) || knownText(postalCode) || canonicalCity, city: canonicalCity };
}

const updateDate = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function cardUpdateLabel(value: string | null | undefined, now: number): string | null {
  const time = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(time) || time > now) return null;
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  return `${time >= cutoff.getTime() ? 'Updated' : 'Last updated'} ${updateDate.format(time)}`;
}
