import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EYEBROW, PANEL } from '../micromarket/tokens';
import { formatRentRange, formatSqft } from '@/lib/micromarketStats';
import { fallbackToRaw } from '@/lib/imageOpt';
import { Skeleton } from '@/components/ui/skeleton';
import type { CityOverviewStats, CityStockStats } from '@/services/cityOverview';
import type { EditorialImageVariant } from '@/data/editorial';
import type { StateCity } from '@/loaders/locationLoader';

// Mirrored in the CMS preview. Values arrive computed by the backend; these
// components only format them. Each table keeps real headings on a phone.
const CELL = 'px-4 py-3 align-top';
const HEAD = `${CELL} text-xs font-medium text-wareongo-slate`;
const money = (value: number | undefined) => value === undefined ? '—' : `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const mixText = (entries: CityStockStats['construction']) => entries.map(e => `${e.label} ${e.share}%`).join(' · ') || '—';

export function CorridorPanel({ data }: { data: CityOverviewStats }) {
  return <div className="city-corridor-panel space-y-6">
    <div className="city-corridor-segments grid gap-4 sm:grid-cols-2">
      {([
        ['20,000 sq ft and up', data.segments.large],
        ['Under 20,000 sq ft', data.segments.small],
      ] as const).filter(([, stats]) => stats.listings > 0).map(([label, stats]) => <div key={label} className={`city-corridor-segment ${PANEL} p-5`}>
        <p className={`${EYEBROW} text-wareongo-slate`}>{label}</p>
        <p className="my-3 ui-metric text-wareongo-blue">{money(stats.rent?.median)}<span className="ml-2 text-xs font-normal text-wareongo-slate">/ sq ft / month</span></p>
        <p className="text-sm text-wareongo-slate">{stats.rent ? formatRentRange(stats.rent) : 'Rent not recorded'} · {stats.listings} listings</p>
        <p className="mt-1 text-xs text-wareongo-slate">{mixText(stats.construction)}</p>
      </div>)}
    </div>
    <div className={`city-corridor-table overflow-hidden ${PANEL}`}>
      <div className="overflow-x-auto" role="region" aria-label="Warehouse locations comparison" tabIndex={0}>
        <table className="ui-table min-w-[700px] text-left">
          <caption className="sr-only">{data.corridorMode === 'corridors' ? 'Corridors' : 'Localities'} compared by listing count, asking rent, unit size and construction</caption>
          <thead><tr>{[data.corridorMode === 'corridors' ? 'Corridor' : 'Locality', 'Listings', 'Median Rent', 'Rent Range', 'Median Size', 'Main Build'].map(label => <th key={label} scope="col" className={HEAD}>{label}</th>)}</tr></thead>
          <tbody>{data.corridors.map(c => <tr key={c.slug} className="border-t border-ui-line">
            <th scope="row" className={`${CELL} font-medium text-wareongo-blue`}>{c.name}{c.direction && <span className="mt-1 block text-xs font-normal text-wareongo-slate">{c.direction}</span>}</th>
            <td className={`${CELL} tabular-nums`}>{c.listings}</td><td className={`${CELL} whitespace-nowrap tabular-nums`}>{money(c.rent?.median)}</td>
            <td className={`${CELL} whitespace-nowrap tabular-nums`}>{c.rent ? formatRentRange(c.rent) : '—'}</td>
            <td className={`${CELL} whitespace-nowrap tabular-nums`}>{c.size ? formatSqft(c.size.median) : '—'}</td><td className={CELL}><span className="city-corridor-build">{c.construction[0]?.label ?? '—'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
    <p className="text-xs leading-relaxed text-wareongo-slate">Rents are asking rates per sq ft per month; sizes are in sq ft. Each listing is counted once in this table. Unmapped or overlapping locations appear in the unassigned row. Construction shares use listings with a recorded construction type.</p>
  </div>;
}

/** A row's key: our city's slug, else its name, which is unique in the list. */
const cityKey = (c: StateCity) => c.slug ?? `name:${c.name.toLowerCase()}`;

/**
 * State overview: its cities with the figures each one's own page shows. A city
 * outside our listings has a plain name and dashes.
 */
export function StateCitiesTable({ cities, place, loading = false }: { cities: StateCity[]; place: string; loading?: boolean }) {
  // Loading keeps each of our cities' cells at its one-line box, so the rows
  // match the loaded table. A city outside our listings is all dashes either way.
  const figure = (c: StateCity, value: React.ReactNode) => loading && c.slug
    ? <span className="relative inline-block"><span className="invisible">00,000</span><Skeleton className="absolute inset-0 rounded-sm" aria-hidden="true" /></span>
    : value;
  const name = (c: StateCity) => !c.path ? c.name
    : loading ? <span className="text-wareongo-blue">{c.name}</span>
    : <Link to={c.path} className="text-wareongo-blue hover:underline">{c.name}</Link>;
  return <>
    {/* The panel is the scroll region itself: a clipping wrapper around it
        would hide the region's keyboard focus ring. */}
    <div className={`overflow-x-auto ${PANEL}`} role="region" aria-label={`Warehouse cities in ${place}`} tabIndex={0}>
        <table className="ui-table min-w-[560px] text-left">
          <caption className="sr-only">Cities in {place} compared by spaces, asking rent, median unit size and main build</caption>
          <thead><tr>{['City', 'Spaces', 'Rent Range', 'Median Unit', 'Main Build'].map(label => <th key={label} scope="col" className={HEAD}>{label}</th>)}</tr></thead>
          <tbody>{cities.map(c => <tr key={cityKey(c)} className="border-t border-ui-line">
            <th scope="row" className={`${CELL} font-medium`}>{name(c)}</th>
            <td className={`${CELL} whitespace-nowrap tabular-nums`}>{figure(c, c.listings ?? '—')}</td>
            <td className={`${CELL} whitespace-nowrap tabular-nums`}>{figure(c, c.rent ? formatRentRange(c.rent) : '—')}</td>
            <td className={`${CELL} whitespace-nowrap tabular-nums`}>{figure(c, c.sizeMedian === null ? '—' : `${formatSqft(c.sizeMedian)} sq ft`)}</td>
            <td className={CELL}>{figure(c, c.build ?? '—')}</td>
          </tr>)}</tbody>
        </table>
    </div>
    <p className="mt-4 text-xs leading-relaxed text-wareongo-slate">Rents are asking rates per sq ft per month; sizes are in sq ft. Figures match each city page.</p>
  </>;
}

// Two columns from 640px: half the 1400px content width, less the 16px gap.
const PHOTO_CARD_SIZES = '(min-width: 1464px) 692px, (min-width: 640px) 50vw, 100vw';

function PhotoCardImage({ image, variants }: { image: NonNullable<StateCity['image']>; variants?: EditorialImageVariant[] }) {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A missing static asset can fail before hydration attaches onError.
    const img = imageRef.current;
    if (img?.complete && img.naturalWidth === 0) fallbackToRaw(img);
  }, [image.url]);
  // A listing photo's WebP falls back to the original upload.
  return <img ref={imageRef} src={variants?.at(-1)?.src ?? image.url} srcSet={variants?.map(v => `${v.src} ${v.width}w`).join(', ') || undefined}
    sizes={variants ? PHOTO_CARD_SIZES : undefined} data-raw={image.fallback ?? image.url} alt={image.alt} loading="lazy" decoding="async"
    onError={event => fallbackToRaw(event.currentTarget)} className="ui-photo-card__img" />;
}

/** Where a card leads, in its meta line. */
const cardMeta = (c: StateCity) => !c.path ? 'No listings yet'
  : c.overview ? `${c.name} warehousing overview →` : `Warehouses in ${c.name} →`;

/**
 * One photo card per city row, linked as its name is in the table. A city
 * without any photo keeps the ink surface; one outside our listings is a
 * plain card with no hover.
 */
export function StateCityCards({ cities, imageVariants, loading = false }: { cities: StateCity[]; imageVariants?: Record<string, EditorialImageVariant[]>; loading?: boolean }) {
  return <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
    {cities.map(c => {
      // Loading draws the photo-less card: the same box, not yet a link.
      const photo = !loading && c.image && <PhotoCardImage image={c.image} variants={imageVariants?.[c.image.url]} />;
      const body = <div className="ui-photo-card__body">
        <h3 className="ui-photo-card__title">{c.name}</h3>
        <p className="ui-photo-card__meta">{cardMeta(c)}</p>
      </div>;
      return <li key={cityKey(c)} className="min-w-0">
        {c.path && !loading
          ? <Link to={c.path} className="ui-photo-card">{photo}{body}</Link>
          : <div className="ui-photo-card ui-photo-card--static">{photo}{body}</div>}
      </li>;
    })}
  </ul>;
}

/** "A", "A and B", "A, B and C". */
const listText = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names.join('');

/** The state's other cities with listing pages, outside its list. Plain text, busiest first. */
export function OtherCities({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return <p className="mt-6 text-sm text-wareongo-slate">Other cities with listings: {listText(names)}.</p>;
}

export function RentBySize({ bands }: { bands: CityOverviewStats['rentBySize'] }) {
  return <div className={`city-rent-table overflow-hidden ${PANEL}`}>
    <table className="ui-table text-left">
      <caption className="px-4 py-4 text-left font-semibold text-wareongo-blue">Median Asking Rent by Unit Size</caption>
      <thead><tr><th scope="col" className={HEAD}>Unit Size</th><th scope="col" className={HEAD}>₹ / sq ft / mo</th><th scope="col" className={`${HEAD} hidden sm:table-cell`}>Priced Listings</th></tr></thead>
      <tbody>{bands.map(b => <tr key={b.slug} className="border-t border-ui-line">
        <th scope="row" className={`${CELL} font-medium`}>{b.label}</th><td className={`${CELL} whitespace-nowrap tabular-nums`}>{money(b.rent?.median)}<span className="mt-1 block text-xs text-wareongo-slate sm:hidden">{b.samples.rent} priced listings</span></td><td className={`${CELL} hidden tabular-nums sm:table-cell`}>{b.samples.rent}</td>
      </tr>)}</tbody>
    </table>
    <p className="border-t border-ui-line px-4 py-3 text-xs text-wareongo-slate">Each band includes its lower bound and excludes its upper bound. A dash means no recorded rent.</p>
  </div>;
}

export function SpecSizeComparison({ cohorts }: { cohorts: CityOverviewStats['specsBySize'] }) {
  if (cohorts.large.listings === 0 && cohorts.small.listings === 0) return null;
  const comparison: [string, (s: CityStockStats) => string][] = [
    ['Clear height, median', s => s.clearHeight ? `${s.clearHeight.median} ft` : '—'],
    ['Docks, median per site', s => s.docksMedian === null ? '—' : String(s.docksMedian)],
    ['Construction type', s => mixText(s.construction)],
    ['VDF or FM2 flooring', s => s.engineeredFloorShare === null ? '—' : `${s.engineeredFloorShare}%`],
  ];
  return <div className={`city-spec-comparison mt-6 overflow-hidden ${PANEL}`}>
      <div className="overflow-x-auto" role="region" aria-label="Specification by unit size" tabIndex={0}><table className="ui-table min-w-[480px] text-left">
        <caption className="px-4 py-4 text-left font-semibold text-wareongo-blue">Specification by Unit Size</caption>
        <thead><tr><th scope="col" className={HEAD}>Specification</th>{(['large', 'small'] as const).map(key => <th key={key} scope="col" className={HEAD}>{key === 'large' ? '50,000 sq ft and up' : 'Under 20,000 sq ft'}<span className="mt-1 block normal-case tracking-normal">{cohorts[key].listings} listings</span></th>)}</tr></thead>
        <tbody>{comparison.map(([label, value]) => <tr key={label} className="border-t border-ui-line"><th scope="row" className={`${CELL} font-medium`}>{label}</th><td className={CELL}>{value(cohorts.large)}</td><td className={CELL}>{value(cohorts.small)}</td></tr>)}</tbody>
      </table></div>
    </div>;
}
