import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import WarehouseCard from '@/components/WarehouseCard';
import { BANGALORE_ALL_SIZES_IDS, BANGALORE_AVAILABLE_WAREHOUSES } from '@/data/bangaloreAvailableWarehouses';
import { useListingResults } from '@/hooks/useListingAnalytics';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { warehousePath } from '@/lib/warehouseSlug';
import type { AdPageContent } from '@/data/adPages';

const SIZE_FILTERS = [
  { id: 'all', labelKey: 'filterAll', min: 0, max: Infinity },
  { id: 'small', labelKey: 'filterSmall', min: 0, max: 5000 },
  { id: 'medium', labelKey: 'filterMedium', min: 5000, max: 20000 },
  { id: 'large', labelKey: 'filterLarge', min: 20000, max: Infinity },
] as const;
type SizeFilter = (typeof SIZE_FILTERS)[number]['id'];

export default function BangaloreAvailableListings({ onContact, totalListings, content }: {
  content: AdPageContent;
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
  totalListings?: number;
}) {
  const [filter, setFilter] = useState<SizeFilter>('all');
  const track = useRef<HTMLDivElement>(null);
  const copy = content.copy;
  // Keep older approved CMS revisions consistent with the current section title.
  const heading = copy.availableHeading === 'Warehouses and Godowns Available Now in Bangalore'
    ? 'Warehouses and Godowns in Bangalore'
    : copy.availableHeading;
  const sizeFilters = SIZE_FILTERS.map(option => ({ ...option, label: copy[option.labelKey] }));
  const band = sizeFilters.find(option => option.id === filter)!;
  const listings = filter === 'all'
    ? BANGALORE_ALL_SIZES_IDS.flatMap(id => BANGALORE_AVAILABLE_WAREHOUSES.filter(listing => listing.id === id))
    : BANGALORE_AVAILABLE_WAREHOUSES.filter(listing => listing.size >= band.min && listing.size < band.max);
  const listContext: AnalyticsParams = {
    list_id: 'bangalore_available', placement: 'bangalore_available', content_type: 'warehouse_size', content_id: filter,
    page: 1, page_size: 6, min_sqft: band.min || undefined,
    max_sqft: Number.isFinite(band.max) ? band.max - 1 : undefined, filter_count: filter === 'all' ? 0 : 1,
  };
  useListingResults({ ...listContext, result_count: listings.length, total_count: BANGALORE_AVAILABLE_WAREHOUSES.length, result_status: 'success' });

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
            aria-pressed={filter === id}
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
            location={{ city: 'Bengaluru', state: 'Karnataka' }}
            micromarket={[listing.locality]}
            size={listing.size}
            price={listing.price}
            ceilingHeight={listing.ceilingHeight}
            warehouseType={listing.warehouseType}
            numberOfDocks={listing.numberOfDocks}
            fireCompliance={listing.fireCompliance}
            image={content.images[`warehouse-${listing.id}`].url}
            imageFallbacks={[listing.imageFallback]}
            imageAlt={content.images[`warehouse-${listing.id}`].alt}
            href={warehousePath({ ...listing, city: 'Bengaluru' })}
            index={index}
            priority={false}
            analyticsContext={{ ...listContext, list_position: index + 1 }}
            onContact={onContact}
          />
        ))}
      </div>
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
