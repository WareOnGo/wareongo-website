import ListingsHeader from './ListingsHeader';
import ListingFilterChips from './ListingFilterChips';
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE } from '@/lib/listingSearch';
import { BreadcrumbTrail } from './Breadcrumbs';
import { WarehouseGridSkeleton } from './PageSkeletons';
import { Skeleton } from './ui/skeleton';
import MicromarketHero from './micromarket/MicromarketHero';
import SectionHeading from './micromarket/SectionHeading';
import { PROSE, SECTION_RULE } from './micromarket/tokens';
import EditorialImage from './micromarket/EditorialImage';
import InlineText from './InlineText';
import { StateCitiesTable, StateCityCards, OtherCities } from './city/CityPanels';
import type { StateCity } from '@/loaders/locationLoader';
import { resolveStateCities } from '@/lib/stateCities';
import { locationOverviewPath, locationPath } from '@/services/locationsAPI';
import { useListingsPerPage } from './micromarket/useListingsPerPage';
import { CITIES, STATES, MICROMARKETS, CITIES_BY_TYPE, STATES_BY_TYPE, STATE_CITIES } from '@/data/locations.generated';
import { getLocationPageContent } from '@/data/locationPages';
import { getMicromarketContent } from '@/data/micromarkets';

const nameFromSlug = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const cityName = (slug: string) => CITIES.find(c => c.slug === slug)?.canonical ?? nameFromSlug(slug);
const stateName = (slug: string) => STATES.find(s => s.slug === slug)?.canonical ?? nameFromSlug(slug);
const trailStart = [{ label: 'Home' }, { label: 'Listings' }];

export function LocationListingsSkeleton({ pathname }: { pathname: string }) {
  const pageSize = DEFAULT_PAGE_SIZE;
  const [, , kind, slug = '', variant] = pathname.split('/');
  const warehouseType = variant === 'peb' || variant === 'rcc' ? variant.toUpperCase() as 'PEB' | 'RCC' : undefined;
  const isMicro = kind === 'city' && !!variant && !warehouseType;
  const types = kind === 'state' ? STATES_BY_TYPE : CITIES_BY_TYPE;
  const summary = isMicro
    ? MICROMARKETS.find(m => m.citySlug === slug && m.slug === variant)
    : (warehouseType ? types[warehouseType] : kind === 'state' ? STATES : CITIES).find(p => p.slug === slug);
  const canonical = summary?.canonical ?? nameFromSlug(isMicro ? variant : slug);
  const parent = cityName(slug);
  const place = isMicro && canonical !== parent ? `${canonical}, ${parent}` : canonical;
  const chips = warehouseType || isMicro ? [] : (['PEB', 'RCC'] as const).filter(t => types[t].some(p => p.slug === slug));
  const hasStats = (summary?.count ?? 5) >= 5;
  const hasMix = !warehouseType && (isMicro || chips.length === 2);
  const mobileLines = hasStats ? hasMix ? 5 : 4 : 3;
  const desktopLines = 2;
  const hasOverview = !warehouseType && (isMicro
    ? getMicromarketContent(slug, variant)
    : getLocationPageContent(kind === 'state' ? 'STATE' : 'CITY', slug));

  return <main className="flex-grow" data-testid="location-listings-skeleton">
    <div className="section-container page-content">
      <BreadcrumbTrail className="mb-4 sm:mb-6" pendingAncestorAt={kind === 'city' ? 2 : undefined} items={[
        ...trailStart,
        ...(isMicro && canonical !== parent ? [{ label: parent }] : []),
        { label: canonical },
        ...(warehouseType ? [{ label: `${warehouseType} warehouses` }] : []),
      ]} />
      <header className="mb-8 sm:mb-10 max-w-5xl">
        <h1 className="ui-page-title text-wareongo-blue mb-3">
          {warehouseType ? `${warehouseType} Warehouses` : 'Warehouses'} for Rent{' '}
          <span className="block">in {place}</span>
        </h1>
        {/* The inventory-dependent lead is unknown until the loader completes.
            Reserve text lines at the actual paragraph's responsive line height. */}
        <div className="max-w-3xl">
          {Array.from({ length: mobileLines }, (_, i) => <div key={i}
            className={`h-[21px] flex items-center ${i >= desktopLines ? 'sm:hidden' : ''}`}>
            <Skeleton className={`h-4 ${i === mobileLines - 1 ? 'w-2/3' : 'w-full'}`} />
          </div>)}
        </div>
        {hasOverview && <span className="mt-4 inline-block text-sm text-wareongo-blue">Read the {canonical} overview →</span>}
        {(chips.length > 0 || (isMicro && canonical !== parent)) && <div className="mt-5 flex flex-wrap gap-2">
          {isMicro ? <span className="inline-flex px-3 py-1.5 rounded-full border border-ui-outline text-sm">All warehouses in {parent}</span>
            : chips.map(t => <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ui-outline text-sm text-wareongo-blue">
              {t} warehouses <Skeleton className="h-3 w-6" />
            </span>)}
        </div>}
      </header>
      <ListingsHeader loading active heading={<></>} />
      <ListingFilterChips filters={{ ...DEFAULT_FILTERS, state: kind === 'state' ? canonical : '',
        city: kind === 'city' ? isMicro ? parent : canonical : '',
        micromarket: isMicro ? variant : '', warehouseTypes: warehouseType ? [warehouseType] : [] }} />
      <div className="mb-12"><WarehouseGridSkeleton count={Math.min(pageSize, summary?.count || pageSize)} /></div>
    </div>
  </main>;
}

export function OverviewSkeleton({ pathname }: { pathname: string }) {
  const pageSize = useListingsPerPage();
  const [, , state = '', city, micro] = pathname.split('/');
  const content = micro ? getMicromarketContent(city, micro)
    : getLocationPageContent(city ? 'CITY' : 'STATE', city ?? state);
  const name = micro ? MICROMARKETS.find(m => m.citySlug === city && m.slug === micro)?.canonical ?? nameFromSlug(micro)
    : city ? cityName(city) : stateName(state);
  const place = micro && cityName(city) !== name ? `${name}, ${cityName(city)}` : name;

  // A state introduces its market and its cities before the listings, as on the
  // loaded page. Both are known before the loader: the market copy and the
  // editor's city list are bundled, and the build's city list (STATE_CITIES)
  // resolves the default and each city's link the way the loader does.
  const stateContent = city ? undefined : getLocationPageContent('STATE', state);
  const { list, others } = stateContent ? resolveStateCities(stateContent.stateCities, STATE_CITIES[state] ?? []) : { list: [], others: [] };
  const cityRows = list.map((entry): StateCity => {
    const c = entry.city && { kind: 'CITY' as const, slug: entry.city.slug, stateSlug: state, hasPage: entry.city.hasPage };
    const overviewPath = c && getLocationPageContent('CITY', c.slug) ? locationOverviewPath(c) : null;
    return { name: entry.name, slug: c ? c.slug : null, path: c ? overviewPath ?? locationPath(c) : null, overview: Boolean(overviewPath),
      listings: null, rent: null, sizeMedian: null, build: null, image: null };
  });
  const hasMarket = Boolean(stateContent?.marketProse);
  const hasCities = cityRows.length > 0;
  const inventoryIndex = 1 + Number(hasMarket) + Number(hasCities);
  const stateIntro = stateContent && <>
    {hasMarket && <section className={SECTION_RULE}>
      <SectionHeading index={1} eyebrow="Market">{stateContent.marketHeading ?? `Why ${name} for Warehousing`}</SectionHeading>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-10">
        <p className={`max-w-2xl ${PROSE}`}><InlineText text={stateContent.marketProse ?? ''} /></p>
        {/* Without an upload the loader fills the slot with a listing photo. */}
        {stateContent.marketImage ? <EditorialImage image={stateContent.marketImage} />
          : <div className="aspect-[4/3] overflow-hidden rounded-xl border border-ui-outline bg-ui-tint" aria-hidden="true"><Skeleton className="h-full w-full rounded-none" /></div>}
      </div>
    </section>}
    {hasCities && <section className={SECTION_RULE}>
      <SectionHeading index={1 + Number(hasMarket)} eyebrow="Cities">{stateContent.citiesHeading ?? `Where Warehouse Stock Sits in ${name}`}</SectionHeading>
      <StateCitiesTable cities={cityRows} place={name} loading />
      <StateCityCards cities={cityRows} loading />
      <OtherCities names={others.map(c => c.name)} />
    </section>}
  </>;

  return <main className="flex-grow" data-testid="overview-skeleton">
    <div className="section-container page-content pb-6 sm:pb-10">
      <BreadcrumbTrail className="mb-4 sm:mb-6" items={[
        ...trailStart,
        ...(city ? [{ label: stateName(state) }] : []),
        ...(micro && cityName(city) !== name ? [{ label: cityName(city) }] : []),
        { label: name },
      ]} />
      {content ? <MicromarketHero content={content} place={place} onBrowse={micro ? '#listings' : undefined}
        listings={city ? undefined : { path: `/listings/state/${state}`, name }} loading /> : <header className="max-w-3xl">
        <Skeleton className="mb-3 h-[15px] w-48" />
        <h1 className="ui-page-title mb-4 text-wareongo-blue">Warehouses for Rent in {name}</h1>
        <Skeleton className="h-24 w-full" />
      </header>}
      {stateIntro}
      <section className={SECTION_RULE}>
        <SectionHeading index={inventoryIndex} eyebrow="Inventory">{content?.inventoryHeading ?? `Warehouses for Rent in ${name}`}</SectionHeading>
        <Skeleton className="mb-5 h-5 w-52" />
        <WarehouseGridSkeleton count={pageSize} />
      </section>
    </div>
  </main>;
}
