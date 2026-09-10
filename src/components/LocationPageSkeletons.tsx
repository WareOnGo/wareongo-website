import { BreadcrumbTrail } from './Breadcrumbs';
import { WarehouseGridSkeleton } from './PageSkeletons';
import { Skeleton } from './ui/skeleton';
import MicromarketHero from './micromarket/MicromarketHero';
import SectionHeading from './micromarket/SectionHeading';
import { SECTION_RULE } from './micromarket/tokens';
import { useListingsPerPage } from './micromarket/useListingsPerPage';
import { CITIES, STATES, MICROMARKETS, CITIES_BY_TYPE, STATES_BY_TYPE } from '@/data/locations.generated';
import { getLocationPageContent } from '@/data/locationPages';
import { getMicromarketContent } from '@/data/micromarkets';

const nameFromSlug = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const cityName = (slug: string) => CITIES.find(c => c.slug === slug)?.canonical ?? nameFromSlug(slug);
const stateName = (slug: string) => STATES.find(s => s.slug === slug)?.canonical ?? nameFromSlug(slug);
const trailStart = [{ label: 'Home' }, { label: 'Listings' }];

export function LocationListingsSkeleton({ pathname }: { pathname: string }) {
  const pageSize = useListingsPerPage();
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
  const scope = isMicro ? 'Micro-market' : kind === 'state' ? 'State' : 'City';
  const chips = warehouseType || isMicro ? [] : (['PEB', 'RCC'] as const).filter(t => types[t].some(p => p.slug === slug));
  const hasStats = (summary?.count ?? 5) >= 5;
  const hasMix = !warehouseType && (isMicro || chips.length === 2);
  const mobileLines = hasStats ? hasMix ? 5 : 4 : 3;
  const desktopLines = hasStats && hasMix ? 3 : 2;
  const hasOverview = !warehouseType && (isMicro
    ? getMicromarketContent(slug, variant)
    : getLocationPageContent(kind === 'state' ? 'STATE' : 'CITY', slug));

  return <main className="flex-grow" data-testid="location-listings-skeleton">
    <div className="section-container px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <BreadcrumbTrail className="mb-4 sm:mb-6" items={[
        ...trailStart,
        ...(isMicro && canonical !== parent ? [{ label: parent }] : []),
        { label: canonical },
        ...(warehouseType ? [{ label: `${warehouseType} warehouses` }] : []),
      ]} />
      <header className="mb-8 sm:mb-10 max-w-3xl">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
          {warehouseType ? `${warehouseType} · ${scope}` : scope}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-3 leading-tight">
          {warehouseType ? `${warehouseType} Warehouses` : 'Warehouses'} for Rent in {place}
        </h1>
        {/* The inventory-dependent lead is unknown until the loader completes.
            Reserve text lines at the actual paragraph's responsive line height. */}
        <div>
          {Array.from({ length: mobileLines }, (_, i) => <div key={i}
            className={`h-[26px] sm:h-7 flex items-center ${i >= desktopLines ? 'sm:hidden' : ''}`}>
            <Skeleton className={`h-4 ${i === mobileLines - 1 ? 'w-2/3' : 'w-full'}`} />
          </div>)}
        </div>
        {hasOverview && <span className="mt-4 inline-block text-sm text-wareongo-blue">Read the {canonical} overview →</span>}
        {(chips.length > 0 || (isMicro && canonical !== parent)) && <div className="mt-5 flex flex-wrap gap-2">
          {isMicro ? <span className="inline-flex px-3 py-1.5 rounded-full border border-wareongo-blue/30 text-sm">All warehouses in {parent}</span>
            : chips.map(t => <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-wareongo-blue/30 text-sm text-wareongo-blue">
              {t} warehouses <Skeleton className="h-3 w-6" />
            </span>)}
        </div>}
      </header>
      <Skeleton className="mb-5 h-5 w-52" />
      <div className="mb-10"><WarehouseGridSkeleton count={Math.min(pageSize, summary?.count || pageSize)} /></div>
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

  return <main className="flex-grow" data-testid="overview-skeleton">
    <div className="section-container px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <BreadcrumbTrail className="mb-4 sm:mb-6" items={[
        ...trailStart,
        ...(city ? [{ label: stateName(state) }] : []),
        ...(micro && cityName(city) !== name ? [{ label: cityName(city) }] : []),
        { label: name },
      ]} />
      {content ? <MicromarketHero content={content} place={place} onBrowse="#listings" loading /> : <header className="max-w-3xl">
        <Skeleton className="mb-3 h-[15px] w-48" />
        <h1 className="mb-4 text-3xl font-bold leading-tight text-wareongo-blue sm:text-4xl md:text-5xl">Warehouses for rent in {name}</h1>
        <Skeleton className="h-24 w-full" />
      </header>}
      <section className={SECTION_RULE}>
        <SectionHeading index={1} eyebrow="Inventory">{content?.inventoryHeading ?? `Warehouses for rent in ${name}`}</SectionHeading>
        <Skeleton className="mb-5 h-5 w-52" />
        <WarehouseGridSkeleton count={pageSize} />
      </section>
    </div>
  </main>;
}
