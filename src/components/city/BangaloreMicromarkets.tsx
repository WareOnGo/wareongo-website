import { useCallback, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { ArrowRight, MapPin, X } from 'lucide-react';
import { BANGALORE_MAP_VIEWS, type BangaloreMapArea, type BangaloreMapScope } from '@/data/bangaloreMicromarketMap';
import type { AnalyticsParams } from '@/lib/analytics';
import type { AdPageContent } from '@/data/adPages';

interface Location extends BangaloreMapArea {
  count: number | null;
}

export default function BangaloreMicromarkets({ locations, onContact, content, scope, onScopeChange }: {
  content: AdPageContent;
  locations: Location[];
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
  scope: BangaloreMapScope;
  onScopeChange: (scope: BangaloreMapScope) => void;
}) {
  const camera = BANGALORE_MAP_VIEWS[scope];
  const visibleLocations = locations.filter(location => location.scope === scope);
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const mapRef = useRef<HTMLElement>(null);
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileMarketsRef = useRef<HTMLDivElement>(null);
  const mobileCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const hasNudged = useRef(false);
  const cancelNudge = useRef<() => void>(() => {});
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const dismissedPreview = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    clearTimeout(hoverTimer.current);
    clearTimeout(leaveTimer.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);
  useEffect(() => () => cancelNudge.current(), [scope]);

  function showMobileLocation(slug: string) {
    cancelNudge.current();
    const track = mobileMarketsRef.current;
    const card = mobileCardRefs.current[slug];
    if (!track || !card) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    card.querySelector('button')?.focus({ preventScroll: true });
    card.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start', inline: 'start' });
    if (reducedMotion.matches || hasNudged.current) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    let frame = 0;
    const originalSnap = track.style.scrollSnapType;
    const cleanup = () => {
      clearTimeout(idleTimer);
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', waitForScroll, true);
      document.removeEventListener('pointerdown', cleanup);
      document.removeEventListener('wheel', cleanup);
      document.removeEventListener('keydown', cleanup);
      window.removeEventListener('resize', cleanup);
      reducedMotion.removeEventListener('change', cleanup);
      track.style.scrollSnapType = originalSnap;
    };
    const nudge = () => {
      document.removeEventListener('scroll', waitForScroll, true);
      const bounds = card.getBoundingClientRect();
      if (!track.clientWidth || bounds.bottom <= 0 || bounds.top >= window.innerHeight || reducedMotion.matches) {
        cleanup();
        return;
      }
      const start = track.scrollLeft;
      const remaining = track.scrollWidth - track.clientWidth - start;
      const distance = remaining >= 24 ? 24 : -Math.min(24, start);
      if (!distance) { cleanup(); return; }
      hasNudged.current = true;
      // Temporarily release snapping for one short out-and-back scroll.
      track.style.scrollSnapType = 'none';
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 600, 1);
        track.scrollLeft = start + distance * (1 - Math.cos(progress * Math.PI * 2)) / 2;
        if (progress < 1) frame = requestAnimationFrame(animate);
        else cleanup();
      };
      frame = requestAnimationFrame(animate);
    };
    // Wait for both the page and the horizontal cards to finish scrolling.
    const waitForScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(nudge, 140);
    };
    cancelNudge.current = cleanup;
    document.addEventListener('scroll', waitForScroll, true);
    document.addEventListener('pointerdown', cleanup, { passive: true });
    document.addEventListener('wheel', cleanup, { passive: true });
    document.addEventListener('keydown', cleanup);
    window.addEventListener('resize', cleanup);
    reducedMotion.addEventListener('change', cleanup);
    waitForScroll();
  }

  const dismiss = useCallback((slug: string, restoreFocus = false) => {
    clearTimers();
    dismissedPreview.current = slug;
    // Focus first, then collapse, so the marker's focus handler cannot reopen it.
    if (restoreFocus) markerRefs.current[slug]?.focus({ preventScroll: true });
    setActive(null);
    setPinned(null);
  }, [clearTimers]);

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!mapRef.current?.contains(event.target as Node)) dismiss(active);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      dismiss(active, mapRef.current?.contains(document.activeElement));
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, dismiss]);

  function previewHandlers(slug: string): HTMLAttributes<HTMLDivElement> {
    return {
      onPointerEnter: event => {
        if (event.pointerType === 'touch') return;
        clearTimers();
        if (active === slug || dismissedPreview.current === slug) return;
        hoverTimer.current = setTimeout(() => {
          setActive(slug);
          setPinned(null);
        }, 100);
      },
      onPointerLeave: event => {
        clearTimers();
        if (dismissedPreview.current === slug) dismissedPreview.current = null;
        if (active !== slug || pinned === slug || event.currentTarget.contains(document.activeElement)) return;
        leaveTimer.current = setTimeout(() => {
          setActive(current => current === slug ? null : current);
        }, 140);
      },
      onFocus: () => {
        clearTimers();
        setActive(slug);
      },
      onBlur: event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clearTimers();
          setActive(current => current === slug ? null : current);
          setPinned(current => current === slug ? null : current);
        }
      },
    };
  }

  function enquire(trigger: HTMLButtonElement, location: Location, placement: 'bangalore_location_map' | 'bangalore_locations' = 'bangalore_location_map') {
    dismiss(location.slug);
    // Return to the visible trigger: a desktop chip or a mobile card action.
    onContact(placement === 'bangalore_location_map' ? markerRefs.current[location.slug] ?? trigger : trigger, {
      placement, label: location.canonical,
      market_slug: location.slug, source: `bangalore-landing-${location.slug}`,
    });
  }

  return (
    <section id="locations" className="bangalore-landing__locations bangalore-landing__container" aria-labelledby="bangalore-locations-title">
      <div className="bangalore-landing__section-heading bangalore-landing__map-heading">
        <h2 id="bangalore-locations-title" className="bangalore-landing__section-title">{content.copy.locationsHeading}</h2>
        <div className="bangalore-landing__map-views" role="group" aria-label="Map area view">
          {(['belts', 'city'] as const).map(view => (
            <button key={view} type="button" aria-pressed={scope === view} aria-controls="bangalore-area-map bangalore-mobile-markets bangalore-area-fit" onClick={() => {
              clearTimers();
              setActive(null);
              setPinned(null);
              dismissedPreview.current = null;
              onScopeChange(view);
            }}>{view === 'belts' ? 'Warehouse Belts' : 'City Areas'}</button>
          ))}
        </div>
      </div>
      <figure id="bangalore-area-map" ref={mapRef} className="bangalore-landing__location-map" aria-label="Warehouse listings by micromarket in Bangalore">
        <div className="bangalore-landing__map-stage" data-scope={scope} onPointerDown={event => {
          if (active && !(event.target as Element).closest('.bangalore-landing__map-marker')) dismiss(active);
        }}>
          <picture key={scope}>
            <source media="(max-width: 599px)" srcSet={camera.mobile.src} width={camera.mobile.width * 2} height={camera.mobile.height * 2} />
            <source media="(max-width: 1199px)" srcSet={camera.tablet.src} width={camera.tablet.width * 2} height={camera.tablet.height * 2} />
            <img src={camera.desktop.src} alt={scope === 'belts' ? "Road map of Bangalore and its warehouse belts." : "Road map of Bangalore's city neighbourhoods."} width={camera.desktop.width * 2} height={camera.desktop.height * 2} loading="lazy" decoding="async" />
          </picture>
          <span className="bangalore-landing__image-tag"><MapPin size={14} aria-hidden="true" />{content.copy.mapLabel}</span>
          <div className="bangalore-landing__mobile-map-labels">
            {visibleLocations.map(location => (
              <button key={location.slug} type="button" className="bangalore-landing__mobile-map-chip" data-market={location.slug}
                aria-label={`Show ${location.canonical} warehouse card`} aria-controls={`bangalore-mobile-market-${location.slug}`}
                onClick={() => showMobileLocation(location.slug)} style={{
                '--label-x': `${location.label.mobile[0]}%`, '--label-y': `${location.label.mobile[1]}%`,
                '--label-wide-x': `${location.label.tablet[0]}%`, '--label-wide-y': `${location.label.tablet[1]}%`,
              } as CSSProperties}>{location.mobileLabel ?? location.title ?? location.canonical}</button>
            ))}
          </div>
          {visibleLocations.map(location => {
            const photo = location.imageSlot ? content.images[location.imageSlot] : location.image;
            const countLabel = location.count === null ? null : `${location.count.toLocaleString('en-IN')} ${location.count === 1 ? 'listing' : 'listings'}`;
            const chipCaption = location.chipCaption ?? countLabel ?? 'Explore spaces';
            const cardCaption = location.caption ?? countLabel ?? 'Enquire for availability';
            const expanded = active === location.slug;
            const cardId = `bangalore-map-card-${location.slug}`;
            const style = {
              '--map-x': `${location.label.desktop[0]}%`, '--map-y': `${location.label.desktop[1]}%`,
              '--map-tablet-x': `${location.label.tablet[0]}%`, '--map-tablet-y': `${location.label.tablet[1]}%`,
              '--map-mobile-x': `${location.label.mobile[0]}%`, '--map-mobile-y': `${location.label.mobile[1]}%`,
            } as CSSProperties;
            return (
              <div key={location.slug} className="bangalore-landing__map-marker" style={style} data-market={location.slug} data-wide-chip={location.wideChip || undefined} data-text-chip={location.textChip || undefined} data-active={expanded || undefined} {...previewHandlers(location.slug)}>
                <div className="bangalore-landing__map-surface">
                  <button
                    ref={node => { markerRefs.current[location.slug] = node; }}
                    type="button"
                    className="bangalore-landing__map-bubble"
                    aria-label={`${location.canonical}${countLabel ? `: ${countLabel}` : ''}. View area.`}
                    aria-expanded={expanded}
                    aria-controls={cardId}
                    onClick={() => {
                      clearTimers();
                      if (pinned === location.slug) dismiss(location.slug);
                      else { dismissedPreview.current = null; setActive(location.slug); setPinned(location.slug); }
                    }}
                  />
                  <article id={cardId} className="bangalore-landing__map-card" aria-labelledby={`${cardId}-title`} aria-hidden={!expanded}>
                    <img src={photo?.url} alt={photo?.alt ?? location.canonical} width={800} height={450} loading="lazy" decoding="async" className="bangalore-landing__map-card-image" />
                    <div className="bangalore-landing__map-card-body">
                      <h3 id={`${cardId}-title`}>{expanded ? location.title ?? location.canonical : location.chipLabel ?? location.canonical}</h3>
                      <p className="bangalore-landing__map-card-count">{expanded ? cardCaption : chipCaption}</p>
                    </div>
                    <button type="button" className="bangalore-landing__map-card-link" aria-haspopup="dialog" aria-label={`Enquire about warehouses in ${location.canonical}`} disabled={!expanded} onClick={event => enquire(event.currentTarget, location)}>
                      {content.copy.locationsCta}<ArrowRight size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="bangalore-landing__map-card-close" aria-label={`Close ${location.canonical} preview`} disabled={!expanded} onClick={() => dismiss(location.slug, true)}><X size={16} aria-hidden="true" /></button>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
        <figcaption className="bangalore-landing__map-caption">
          <span className="bangalore-landing__map-legend">{content.copy.mapCaption}</span>
          <span className="bangalore-landing__map-hint"><span>Hover or tap a location to explore</span><span>Tap a location to explore</span></span>
          <span className="bangalore-landing__map-mobile-hint">Tap a location or swipe the cards below</span>
        </figcaption>
      </figure>
      <div key={scope} ref={mobileMarketsRef} id="bangalore-mobile-markets" className="bangalore-landing__mobile-markets" role="region" aria-label={`${scope === 'belts' ? 'Warehouse belt' : 'City area'} cards`} tabIndex={0}>
        {visibleLocations.map(location => {
          const photo = location.imageSlot ? content.images[location.imageSlot] : location.image;
          return (
            <article key={location.slug} id={`bangalore-mobile-market-${location.slug}`} ref={node => { mobileCardRefs.current[location.slug] = node; }} className="bangalore-landing__mobile-market" data-market={location.slug}>
              <img src={photo?.url} alt={photo?.alt ?? location.canonical} width={800} height={450} loading="lazy" decoding="async" />
              {location.count !== null && <span className="bangalore-landing__image-tag bangalore-landing__listing-count">
                {location.count.toLocaleString('en-IN')} {location.count === 1 ? 'listing' : 'listings'}
              </span>}
              <div className="bangalore-landing__mobile-market-body">
                <h3>{location.title ?? location.canonical}</h3>
                {location.caption && <p>{location.caption}</p>}
              </div>
              <button type="button" className="bangalore-landing__mobile-market-link" aria-haspopup="dialog" aria-label={`Enquire about warehouses in ${location.canonical}`} onClick={event => enquire(event.currentTarget, location, 'bangalore_locations')}>
                <span>{content.copy.locationsCta}<ArrowRight size={16} aria-hidden="true" /></span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
