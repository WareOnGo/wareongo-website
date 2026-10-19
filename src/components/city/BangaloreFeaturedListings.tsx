import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import WarehouseCard from '@/components/WarehouseCard';
import { useListingResults } from '@/hooks/useListingAnalytics';
import type { AnalyticsParams } from '@/lib/analytics';
import { warehousePath } from '@/lib/warehouseSlug';
import type { AdPageContent } from '@/data/adPages';
import { adImageSources, FEATURED_IMAGE_SIZES } from '@/lib/adImageSources';
import type { AdLandingWarehouse } from '@/data/micromarketAdPages';
import { BANGALORE_FEATURED_LISTINGS as FEATURED_LISTINGS } from '@/data/bangaloreAvailableWarehouses';

interface BangaloreFeaturedListingsProps {
  content: AdPageContent;
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
  listings?: AdLandingWarehouse[];
  marketSlug?: string;
}

function FeaturedWarehouseCard({ listing, index, onContact, content, listings = FEATURED_LISTINGS, marketSlug }: BangaloreFeaturedListingsProps & { listing: AdLandingWarehouse; index: number }) {
  // CMS photos first, shared with the listing's grid card. Curated covers hosted on the site render the same way, without a loading state.
  const slot = content.images[`warehouse-${listing.id}`];
  const image = slot?.url ? slot
    : listing.image?.startsWith('/') ? { url: listing.image, alt: `Warehouse for rent in ${listing.locality}` } : undefined;
  const sources = adImageSources(image?.url ?? listing.image, FEATURED_IMAGE_SIZES);
  const context = { list_id: 'bangalore_featured', placement: 'bangalore_featured', market_slug: marketSlug, warehouse_id: listing.id, list_position: index + 1, page: 1, page_size: listings.length };
  return (
    <WarehouseCard
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
      fireCompliance={listing.fireCompliance ?? null}
      numberOfDocks={listing.numberOfDocks}
      authoredImage={image}
      image={sources.src}
      imageFallbacks={[listing.imageFallback ?? null]}
      imageAlt={image?.alt ?? `Warehouse for rent in ${listing.locality}`}
      imageSrcSet={sources.srcSet}
      imageSizes={sources.sizes}
      href={warehousePath({ ...listing, city: listing.city ?? 'Bengaluru' })}
      index={index}
      priority={index === 0}
      analyticsContext={context}
      onContact={(trigger, enquiry) => onContact(trigger, { ...enquiry, source: `bangalore-landing-warehouse-${listing.id}` })}
    />
  );
}

export default function BangaloreFeaturedListings({ onContact, content, listings = FEATURED_LISTINGS, marketSlug }: BangaloreFeaturedListingsProps) {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: true });
  useListingResults({ list_id: 'bangalore_featured', placement: 'bangalore_featured', market_slug: marketSlug, page: 1, page_size: listings.length, result_count: listings.length, total_count: listings.length, result_status: 'success' });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const start = element.scrollLeft <= 2;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
      setPosition(current => current.start === start && current.end === end ? current : { start, end });
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, []);

  function scroll(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  return (
    <section className="bangalore-landing__featured" aria-labelledby="bangalore-featured-title">
      <div className="bangalore-landing__featured-heading">
        <h2 id="bangalore-featured-title">{content.copy.featuredHeading}</h2>
        <div className="bangalore-landing__featured-controls">
          <button type="button" aria-label="Previous featured warehouses" aria-controls="bangalore-featured-grid" disabled={position.start} onClick={() => scroll(-1)}><ArrowLeft size={17} aria-hidden="true" /></button>
          <button type="button" aria-label="Next featured warehouses" aria-controls="bangalore-featured-grid" disabled={position.end} onClick={() => scroll(1)}><ArrowRight size={17} aria-hidden="true" /></button>
        </div>
      </div>
      <div ref={track} id="bangalore-featured-grid" className="bangalore-landing__featured-grid" role="region" aria-label="Featured warehouse cards" tabIndex={position.start && position.end ? undefined : 0}>
        {listings.map((listing, index) => <FeaturedWarehouseCard key={listing.id} listing={listing} listings={listings} index={index} onContact={onContact} content={content} marketSlug={marketSlug} />)}
      </div>
      {!listings.length && <p>Share your requirements for current spaces in {content.name}.</p>}
    </section>
  );
}
