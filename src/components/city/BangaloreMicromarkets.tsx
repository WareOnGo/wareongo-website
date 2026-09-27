import { useState, type CSSProperties, type HTMLAttributes } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { BANGALORE_MAP_AREAS, micromarketMapPoint, type MapView } from '@/data/bangaloreMicromarketMap';
import type { AnalyticsParams } from '@/lib/analytics';
import type { AdPageContent } from '@/data/adPages';

interface Location {
  slug: string;
  canonical: string;
  count: number;
}

export default function BangaloreMicromarkets({ locations, onContact, content }: {
  content: AdPageContent;
  locations: Location[];
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = hovered ?? focused;

  function highlightHandlers(slug: string): HTMLAttributes<HTMLElement> {
    return {
      onPointerEnter: event => { if (event.pointerType !== 'touch') setHovered(slug); },
      onPointerLeave: () => setHovered(current => current === slug ? null : current),
      onFocus: () => { setFocused(slug); setHovered(null); },
      onBlur: event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(current => current === slug ? null : current);
      },
    };
  }

  function enquire(trigger: HTMLButtonElement, location: Location, placement: 'bangalore_locations' | 'bangalore_location_map') {
    onContact(trigger, { placement, label: location.canonical, market_slug: location.slug, source: `bangalore-landing-${location.slug}` });
  }

  function connectors(view: MapView) {
    return (
      <svg className={`bangalore-landing__map-connectors bangalore-landing__map-connectors--${view}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {locations.map(({ slug }) => {
          const area = BANGALORE_MAP_AREAS[slug];
          if (!area) return null;
          const [x, y] = micromarketMapPoint(slug, view);
          const [labelX, labelY] = area.label[view];
          return (
            <g key={slug} data-market={slug} data-active={active === slug || undefined}>
              <line x1={x} y1={y} x2={labelX} y2={labelY} vectorEffect="non-scaling-stroke" />
              <circle className="bangalore-landing__map-point-halo" cx={x} cy={y} r={2} />
              <circle className="bangalore-landing__map-point" cx={x} cy={y} r={0.7} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <section id="locations" className="bangalore-landing__locations bangalore-landing__container" aria-labelledby="bangalore-locations-title">
      <div className="bangalore-landing__section-heading">
        <h2 id="bangalore-locations-title" className="bangalore-landing__section-title">{content.copy.locationsHeading}</h2>
      </div>
      <div className="bangalore-landing__location-layout">
        <div className="bangalore-landing__location-grid">
          {locations.map(location => (
            <article
              key={location.slug}
              className="warehouse-card bangalore-landing__location-card"
              data-market={location.slug}
              data-active={active === location.slug || undefined}
              {...highlightHandlers(location.slug)}
            >
              <div className="warehouse-card__photo bangalore-landing__location-image">
                <img src={content.images[`micromarket-${location.slug}`].url} alt={content.images[`micromarket-${location.slug}`].alt} width={800} height={450} loading="lazy" decoding="async" className="warehouse-card__image" />
                <span className="bangalore-landing__image-tag bangalore-landing__listing-count">
                  {location.count.toLocaleString('en-IN')} {location.count === 1 ? 'listing' : 'listings'}
                </span>
              </div>
              <div className="bangalore-landing__location-body">
                <h3>{location.canonical}</h3>
                <button
                  type="button"
                  className="warehouse-card__link bangalore-landing__location-link"
                  aria-haspopup="dialog"
                  aria-label={`Enquire about warehouses in ${location.canonical}`}
                  onClick={event => enquire(event.currentTarget, location, 'bangalore_locations')}
                >{content.copy.locationsCta} <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            </article>
          ))}
        </div>

        <figure className="bangalore-landing__location-map" aria-label="Warehouse listings by micromarket in Bangalore">
          <div className="bangalore-landing__map-stage">
            <picture>
              <source media="(max-width: 599px)" srcSet="/bangalore/micromarkets-map-mobile.webp" width={720} height={920} />
              <img src="/bangalore/micromarkets-map.webp" alt="Bangalore and its surrounding warehouse areas on a street map." width={1200} height={1200} loading="lazy" decoding="async" />
            </picture>
            <span className="bangalore-landing__image-tag"><MapPin size={14} aria-hidden="true" />{content.copy.mapLabel}</span>
            {connectors('desktop')}
            {connectors('mobile')}
            {locations.map(location => {
              const area = BANGALORE_MAP_AREAS[location.slug];
              if (!area) return null;
              const style = {
                '--map-x': `${area.label.desktop[0]}%`, '--map-y': `${area.label.desktop[1]}%`,
                '--map-mobile-x': `${area.label.mobile[0]}%`, '--map-mobile-y': `${area.label.mobile[1]}%`,
              } as CSSProperties;
              return (
                <button
                  key={location.slug}
                  type="button"
                  className="bangalore-landing__map-bubble"
                  style={style}
                  data-market={location.slug}
                  data-active={active === location.slug || undefined}
                  aria-label={`${location.canonical}: ${location.count} warehouse listings. Enquire now.`}
                  aria-haspopup="dialog"
                  onClick={event => enquire(event.currentTarget, location, 'bangalore_location_map')}
                  {...highlightHandlers(location.slug)}
                >
                  <span className="bangalore-landing__map-count">{location.count.toLocaleString('en-IN')}</span>
                  <span>{location.canonical}</span>
                </button>
              );
            })}
          </div>
          <figcaption className="bangalore-landing__map-caption"><span aria-hidden="true" />{content.copy.mapCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
