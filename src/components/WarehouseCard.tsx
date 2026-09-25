import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import ContactFormDialog from '@/components/ContactFormDialog';
import WarehousePhoto from '@/components/WarehousePhoto';
import { useWarehouseGallery } from '@/hooks/useWarehouseGallery';
import { useGallerySwipe } from '@/hooks/useGallerySwipe';
import WarehouseGalleryPreview from '@/components/WarehouseGalleryPreview';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { useListingImpression } from '@/hooks/useListingAnalytics';
import { cardConstructionLabel, cardLocation, cardUpdateLabel } from '@/lib/warehouseCardData';
import { FILTER_MICROMARKETS } from '@/data/locations.generated';
import './WarehouseCard.css';

interface WarehouseCardProps {
  id: number;
  image?: string | null;
  images?: string[];
  /** Original-image fallback for each preferred WebP. */
  imageFallbacks?: (string | null)[];
  coverImage?: string;
  address: string;
  location: { city: string; state: string };
  micromarket?: string[] | null;
  postalCode?: string | null;
  warehouseType?: string | null;
  updatedAt?: string | null;
  size: number;
  ceilingHeight: number | null;
  numberOfDocks?: number | null;
  price: number | null;
  fireCompliance: boolean | null;
  features?: string[];
  href: string;
  index?: number;
  /** Overview grids start below the hero; paging scrolls them into view. */
  priority?: boolean;
  analyticsContext?: AnalyticsParams;
}

const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

function UpdatedBadge({ updatedAt }: { updatedAt?: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  // Evaluate freshness at visit time, including on cached prerendered pages.
  // The overlay does not change card geometry when hydration adds it.
  useEffect(() => { setNow(Date.now()); }, [updatedAt]);
  const label = now === null ? null : cardUpdateLabel(updatedAt, now);
  return label ? <time className="warehouse-card__updated" dateTime={updatedAt}>{label}</time> : null;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  id, image, images = [], imageFallbacks = [], coverImage, address, location,
  micromarket, postalCode, warehouseType, updatedAt, size, ceilingHeight,
  numberOfDocks, price, fireCompliance, href, index = 0,
  priority = index === 0, analyticsContext = {},
}) => {
  const listingContext = { ...analyticsContext, warehouse_id: id, warehouse_city: location.city, warehouse_state: location.state, size_sqft: size, price_per_sqft: price ?? undefined };
  const impressionRef = useListingImpression(listingContext);
  const place = cardLocation({ ...location, address, micromarket, postalCode, markets: FILTER_MICROMARKETS });
  // Keep address fallbacks shorter than a full locality name. CSS ellipsis
  // still handles narrower cards; the title and accessible name retain it all.
  const placeLabel = place && place.primary === address?.trim() && place.primary.length > 28
    ? `${place.primary.slice(0, 27).trimEnd()}…` : place?.primary;
  const construction = cardConstructionLabel(warehouseType);
  const altText = `${number.format(size)} sqft warehouse${place ? ` in ${[place.city, location.state].filter(Boolean).join(', ')}` : ''}`;
  const [interacting, setInteracting] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const enquiryRef = useRef<HTMLButtonElement>(null);
  const enquirySource = `warehouse-card-${id}-callback`;
  const gallery = useWarehouseGallery(id, images.length ? images : (image ? [image] : []), imageFallbacks, interacting);
  const { index: currentImageIndex, previous: prevImageIndex, direction: slideDirection } = gallery.state;
  const frame = gallery.frames[currentImageIndex];
  const moveImage = (delta: 1 | -1, offset = 0) => {
    setInteracting(true);
    if (gallery.valid.length > 1 && !slideDirection) trackEvent('listing_gallery_interaction', { ...listingContext, placement: 'warehouse_card', action: delta === 1 ? 'next' : 'previous', image_index: ((gallery.position + delta + gallery.valid.length) % gallery.valid.length) + 1 });
    gallery.move(delta, offset);
  };
  const swipe = useGallerySwipe({
    viewport: imageRef, target: impressionRef, enabled: gallery.valid.length > 1, busy: !!slideDirection,
    resetKey: `${gallery.state.key}:${currentImageIndex}`, onSwipe: moveImage,
  });
  const hasHeight = Number.isFinite(ceilingHeight) && ceilingHeight > 0;
  const hasDocks = Number.isSafeInteger(numberOfDocks) && numberOfDocks >= 0;
  const hasRent = Number.isFinite(price) && price > 0;
  const hasSpecs = hasHeight || hasDocks || fireCompliance === true;

  // Carpet area is the primary listing fact; do not advertise an unknown size.
  if (!Number.isFinite(size) || size <= 0) return null;

  return (
    <>
      <div
        {...swipe.handlers}
        className="warehouse-card"
        ref={impressionRef}
        data-warehouse-card={id}
        onPointerEnter={() => setInteracting(true)}
        onFocusCapture={() => setInteracting(true)}
        onTouchStart={() => setInteracting(true)}
      >
        <div ref={imageRef} style={{ ...gallery.transitionStyle, ...swipe.photoStyle }} className="warehouse-card__photo">
          {gallery.valid.length === 0 ? (
            <div className="warehouse-card__empty">
              <ImageIcon aria-hidden="true" />
              <span>Images available on request</span>
            </div>
          ) : (
            <>
              <WarehouseGalleryPreview gallery={gallery} delta={swipe.preview} />
              {slideDirection && prevImageIndex !== currentImageIndex && gallery.source(prevImageIndex) && (
                <img
                  src={gallery.source(prevImageIndex)} alt="" aria-hidden="true" draggable={false}
                  width={640} height={360}
                  className={`warehouse-gallery-photo warehouse-card__image ${slideDirection === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right'}`}
                  onError={event => { event.currentTarget.style.display = 'none'; }}
                />
              )}
              <WarehousePhoto
                key={`${gallery.state.key}:${currentImageIndex}`}
                primary={frame.primary} initialSrc={gallery.source(currentImageIndex)}
                preview={currentImageIndex === 0 && (!gallery.state.resolved[0] || gallery.state.resolved[0] === coverImage) ? coverImage : undefined}
                fallback={frame.fallback} alt={altText} width={640} height={360} draggable={false}
                className={`warehouse-gallery-photo warehouse-card__image ${slideDirection === 'left' ? 'animate-slide-in-left' : slideDirection === 'right' ? 'animate-slide-in-right' : ''}`}
                onLoaded={url => gallery.loaded(currentImageIndex, url)}
                onFailed={() => gallery.failed(currentImageIndex)}
                loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'}
              />
              {gallery.valid.length > 1 && (
                <>
                  <button type="button" className="warehouse-card__arrow warehouse-card__arrow--previous" onClick={() => moveImage(-1)} aria-label="Previous image">
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button type="button" className="warehouse-card__arrow warehouse-card__arrow--next" onClick={() => moveImage(1)} aria-label="Next image">
                    <ChevronRight aria-hidden="true" />
                  </button>
                  <span className="sr-only" aria-live="polite" aria-atomic="true">Photo {gallery.position + 1} of {gallery.valid.length}</span>
                </>
              )}
            </>
          )}
          {construction && <span className="warehouse-card__type">{construction}</span>}
          <UpdatedBadge updatedAt={updatedAt} />
        </div>

        <div className="warehouse-card__body">
          <dl className="warehouse-card__metrics">
            <div className="warehouse-card__metric warehouse-card__area">
              <dt>Carpet area</dt>
              <dd><strong>{number.format(size)}</strong> <small>sqft</small></dd>
            </div>
            <div className="warehouse-card__metric warehouse-card__rent">
              <dt>Rent / month</dt>
              <dd>{hasRent ? <><strong>₹{number.format(price)}</strong> <small>/sqft</small></> : <strong className="warehouse-card__rent-request">Rent on request</strong>}</dd>
            </div>
          </dl>
          <div className={place ? 'warehouse-card__place' : 'warehouse-card__place warehouse-card__place--unknown'}>
            {place && <MapPin aria-hidden="true" />}
            <div className="warehouse-card__place-text">
              <h2 title={place ? `${place.primary}${place.primary !== place.city ? ` · ${place.city}` : ''}` : undefined}>
                {/* A native stretched link preserves new-tab and keyboard navigation. */}
                <Link
                  to={href}
                  aria-label={`View warehouse ${id}: ${[address, place?.city, location.state].filter(Boolean).join(', ')}`}
                  onClick={() => trackEvent('listing_open', listingContext)}
                  onAuxClick={event => { if (event.button === 1) trackEvent('listing_open', listingContext); }}
                  className="warehouse-card__link"
                >
                  <span className={place ? undefined : 'sr-only'}>{placeLabel ?? `View warehouse ${id}`}</span>
                </Link>
              </h2>
              {place && place.primary !== place.city && <p>{place.city}</p>}
            </div>
          </div>
          {hasSpecs && (
            <ul className="warehouse-card__specs" aria-label="Warehouse specifications">
              {hasHeight && <li className="warehouse-card__spec" data-spec="height">{number.format(ceilingHeight)} ft Clear Height</li>}
              {hasDocks && <li className="warehouse-card__spec" data-spec="docks">{numberOfDocks === 0 ? 'Grade level only' : `${number.format(numberOfDocks)} ${numberOfDocks === 1 ? 'Dock' : 'Docks'}`}</li>}
              {fireCompliance === true && <li className="warehouse-card__spec" data-spec="fire">Fire NOC: Yes</li>}
            </ul>
          )}
          <div className="warehouse-card__actions">
            <button
              ref={enquiryRef}
              type="button" aria-haspopup="dialog"
              onClick={event => {
                event.stopPropagation();
                trackEvent('cta_click', { ...listingContext, placement: 'warehouse_card', label: 'Raise Enquiry', action: 'open_enquiry_modal', warehouse_id: id, source: enquirySource });
                setIsEnquiryOpen(true);
              }}
              className="warehouse-card__enquiry"
            >Raise enquiry</button>
          </div>
        </div>
      </div>
      <ContactFormDialog
        open={isEnquiryOpen} onOpenChange={setIsEnquiryOpen} title="Raise Enquiry"
        description={`Interested in ${[address || place?.primary, place?.city].filter(Boolean).join(', ') || `warehouse ${id}`}? Leave your details and our team will get in touch about this warehouse.`}
        successMessage="Enquiry sent successfully! Our team will contact you soon."
        source={enquirySource} requireCompanyName
        onCloseAutoFocus={event => {
          event.preventDefault();
          enquiryRef.current?.focus({ preventScroll: true });
        }}
        analyticsContext={{ ...listingContext, placement: 'warehouse_card' }}
      />
    </>
  );
};

export default WarehouseCard;
