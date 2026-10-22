import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import WarehouseCard from '@/components/WarehouseCard';
import { BANGALORE_ALL_SIZES_IDS, BANGALORE_AVAILABLE_WAREHOUSES } from '@/data/bangaloreAvailableWarehouses';
import { useListingResults } from '@/hooks/useListingAnalytics';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { warehousePath } from '@/lib/warehouseSlug';
import type { AdPageContent } from '@/data/adPages';
import { adImageSources, AVAILABLE_IMAGE_SIZES } from '@/lib/adImageSources';
import type { AdLandingWarehouse } from '@/data/micromarketAdPages';

// Labels follow the bands, so a chip always names the sizes it shows. Listings
// start at AD_MIN_SIZE (5,000 sq ft), so "All sizes" needs no lower bound.
const SIZE_BANDS = [[5000, 15000], [15000, 30000], [30000, 50000], [50000, Infinity]] as const;
const SIZE_FILTERS = [
  { id: 'all', min: 0, max: Infinity },
  ...SIZE_BANDS.map(([min, max]) => ({ id: `${min}-${Number.isFinite(max) ? max : 'plus'}`, min, max })),
];
const sqft = (value: number) => value.toLocaleString('en-IN');
const bandLabel = (min: number, max: number) => Number.isFinite(max) ? `${sqft(min)} to ${sqft(max)} sq ft` : `${sqft(min)} sq ft and up`;

export default function BangaloreAvailableListings({ onContact, totalListings, content, inventory, marketSlug }: {
  content: AdPageContent;
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
  totalListings?: number;
  inventory?: AdLandingWarehouse[];
  marketSlug?: string;
}) {
  const [filter, setFilter] = useState('all');
  const track = useRef<HTMLDivElement>(null);
  const copy = content.copy;
  const heading = copy.availableHeading;
  // Area pages offer only the bands their inventory has; /bangalore keeps every band.
  const sizeFilters = SIZE_FILTERS
    .filter(option => !inventory || option.id === 'all' || inventory.some(listing => listing.size >= option.min && listing.size < option.max))
    .map(option => ({ ...option, label: option.id === 'all' ? copy.filterAll : bandLabel(option.min, option.max) }));
  // A band can disappear with new inventory; fall back to "All sizes".
  const band = sizeFilters.find(option => option.id === filter) ?? sizeFilters[0];
  const listings = inventory ? inventory.filter(listing => listing.size >= band.min && listing.size < band.max).slice(0, 6) : filter === 'all'
    ? BANGALORE_ALL_SIZES_IDS.flatMap(id => BANGALORE_AVAILABLE_WAREHOUSES.filter(listing => listing.id === id))
    : BANGALORE_AVAILABLE_WAREHOUSES.filter(listing => listing.size >= band.min && listing.size < band.max);
  const listContext: AnalyticsParams = {
    list_id: 'bangalore_available', placement: 'bangalore_available', content_type: 'warehouse_size', content_id: filter,
    market_slug: marketSlug,
    page: 1, page_size: 6, min_sqft: band.min || undefined,
    max_sqft: Number.isFinite(band.max) ? band.max - 1 : undefined, filter_count: filter === 'all' ? 0 : 1,
  };
  useListingResults({ ...listContext, result_count: listings.length, total_count: inventory?.length ?? BANGALORE_AVAILABLE_WAREHOUSES.length, result_status: 'success' });

  return (
    <section className="bangalore-landing__available bangalore-landing__container" aria-labelledby="bangalore-available-title">
      <div className="bangalore-landing__section-heading">
        <h2 id="bangalore-available-title" className="bangalore-landing__section-title">{heading}</h2>
      </div>
      <div className="bangalore-landing__size-filters" role="group" aria-label="Filter warehouses by size">
        {sizeFilters.map(({ id, label, min, max }) => (
          <button
            key={id}
            type="button"
            className="bangalore-landing__size-filter"
            aria-pressed={band.id === id}
            aria-controls="bangalore-available-grid"
            onClick={() => {
              setFilter(id);
              if (track.current) track.current.scrollLeft = 0;
              trackEvent(id === 'all' ? 'filter_clear' : 'filter_apply', {
                ...listContext, content_id: id, label, min_sqft: min || undefined,
                max_sqft: Number.isFinite(max) ? max - 1 : undefined, filter_count: id === 'all' ? 0 : 1,
              });
            }}
          >{label}</button>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">Showing {listings.length} selected warehouses: {band.label}.</p>
      <div ref={track} id="bangalore-available-grid" className="bangalore-landing__available-grid" role="region" aria-labelledby="bangalore-available-title" tabIndex={0}>
        {listings.map((listing, index) => (
          <WarehouseCard
            key={`${filter}-${listing.id}`}
            id={listing.id}
            address={listing.address}
            location={{ city: listing.city ?? 'Bengaluru', state: listing.state ?? 'Karnataka' }}
            displayLocation={marketSlug ? { primary: listing.locality, city: listing.region ?? 'Bengaluru' } : undefined}
            micromarket={[listing.locality]}
            size={listing.size}
            price={listing.price}
            ceilingHeight={listing.ceilingHeight}
            warehouseType={listing.warehouseType}
            warehouseTypeLabel={marketSlug && /^shed$/i.test(listing.warehouseType ?? '') ? 'Shed' : undefined}
            numberOfDocks={listing.numberOfDocks}
            fireCompliance={listing.fireCompliance ?? null}
            image={content.images[`warehouse-${listing.id}`]?.url ?? listing.image}
            imageFallbacks={[listing.imageFallback ?? null]}
            imageAlt={content.images[`warehouse-${listing.id}`]?.alt ?? `Warehouse for rent in ${listing.locality}`}
            imageSrcSet={adImageSources(content.images[`warehouse-${listing.id}`]?.url ?? listing.image, AVAILABLE_IMAGE_SIZES).srcSet}
            imageSizes={AVAILABLE_IMAGE_SIZES}
            href={warehousePath({ ...listing, city: listing.city ?? 'Bengaluru' })}
            index={index}
            priority={false}
            analyticsContext={{ ...listContext, list_position: index + 1 }}
            onContact={onContact}
          />
        ))}
      </div>
      {!listings.length && <p>No spaces in this size band are currently listed. Tell us what you need and we’ll help you find a match.</p>}
      <div className="bangalore-landing__available-footer">
        <p>{copy.availableFooter.split('{listings}').join( totalListings ? `all ${totalListings.toLocaleString('en-IN')} listings` : 'Bangalore’s listings')}</p>
        <button
          type="button"
          className="bangalore-landing__button bangalore-landing__button--outline"
          aria-haspopup="dialog"
          onClick={event => onContact(event.currentTarget, { ...listContext, label: copy.availableCta, source: 'bangalore-available-requirements' })}
        >{copy.availableCta}<ArrowRight size={16} aria-hidden="true" /></button>
      </div>
    </section>
  );
}
