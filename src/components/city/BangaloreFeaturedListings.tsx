import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { useListingImpression, useListingResults } from '@/hooks/useListingAnalytics';
import type { AnalyticsParams } from '@/lib/analytics';
import type { AdPageContent } from '@/data/adPages';

interface BangaloreFeaturedListingsProps {
  content: AdPageContent;
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
}

// Curated from the public listing details. Image sources and listing IDs are
// recorded in public/bangalore/README.md, alongside the location card photos.
const FEATURED_LISTINGS = [
  { id: 967, locality: 'Hoskote', address: 'Karapanahalli, Hoskote-Chintamani Road', size: 189000, price: 28.5, ceilingHeight: 40, image: '/bangalore/hoskote.webp', imageAlt: 'Modern warehouse exterior on Hoskote-Chintamani Road' },
  { id: 408, locality: 'Devanahalli', address: 'Devanahalli', size: 100000, price: 33, ceilingHeight: 40, image: '/bangalore/featured-devanahalli.webp', imageAlt: 'Bright warehouse interior with a polished floor in Devanahalli' },
  { id: 1226, locality: 'Jigani', address: 'Jigani-Anekal Road', size: 100183, price: 30, ceilingHeight: 40, image: '/bangalore/jigani.webp', imageAlt: 'Aerial view of the warehouse on Jigani-Anekal Road' },
];

function FeaturedWarehouseCard({ listing, index, onContact, content }: BangaloreFeaturedListingsProps & { listing: (typeof FEATURED_LISTINGS)[number]; index: number }) {
  const image = content.images[`featured-${listing.id}`];
  const context = { list_id: 'bangalore_featured', placement: 'bangalore_featured', warehouse_id: listing.id, list_position: index + 1, page: 1, page_size: FEATURED_LISTINGS.length };
  const ref = useListingImpression<HTMLElement>(context);

  return (
    <article ref={ref} className="bangalore-landing__featured-card">
      <div className="bangalore-landing__featured-photo">
        <img src={image.url} alt={image.alt} width={image.width} height={image.height} decoding="async" />
      </div>
      <div className="bangalore-landing__featured-body">
        <h3>
          <button
            type="button"
            className="warehouse-card__link bangalore-landing__featured-trigger"
            aria-haspopup="dialog"
            aria-label={`Enquire about ${listing.size.toLocaleString('en-IN')} sq ft warehouse in ${listing.locality}, listing ${listing.id}`}
            onClick={event => onContact(event.currentTarget, { ...context, label: `Warehouse ${listing.id}`, source: `bangalore-landing-warehouse-${listing.id}`, size_sqft: listing.size, price_per_sqft: listing.price })}
          >
            <MapPin size={12} aria-hidden="true" />{listing.locality}
          </button>
        </h3>
        <p className="bangalore-landing__featured-area">{listing.size.toLocaleString('en-IN')} <span>sq ft</span></p>
        <p className="bangalore-landing__featured-specs">PEB <span aria-hidden="true">·</span> {listing.ceilingHeight} ft height</p>
        <div className="bangalore-landing__featured-footer">
          <p>₹{listing.price} <span>/ sq ft</span></p>
          <ArrowRight size={15} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

export default function BangaloreFeaturedListings({ onContact, content }: BangaloreFeaturedListingsProps) {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });
  useListingResults({ list_id: 'bangalore_featured', placement: 'bangalore_featured', page: 1, page_size: FEATURED_LISTINGS.length, result_count: FEATURED_LISTINGS.length, total_count: FEATURED_LISTINGS.length, result_status: 'success' });

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
      <div ref={track} id="bangalore-featured-grid" className="bangalore-landing__featured-grid" role="region" aria-label="Featured warehouses carousel" tabIndex={0}>
        {FEATURED_LISTINGS.map((listing, index) => <FeaturedWarehouseCard key={listing.id} listing={listing} index={index} onContact={onContact} content={content} />)}
      </div>
    </section>
  );
}
