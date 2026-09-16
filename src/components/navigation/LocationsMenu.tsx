import { useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { popularLocations, WAREHOUSE_REQUEST } from '@/data/navigation';
import { navigationGuide } from '@/data/navigation-guide.generated';
import { LOCATION_CATEGORIES, type LocationCategory } from '@/lib/locationNavigation';
import { HeaderLink, LocationLinks, type NavigateFromHeader } from './NavigationLinks';

export default function LocationsMenu({ onDirectory, onNavigate }: {
  onDirectory: (category: LocationCategory) => void;
  onNavigate: NavigateFromHeader;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return <div className="wog-nav-mega">
    <div className="wog-nav-mega-heading">
      <div><h2>Browse locations</h2><p>Find warehouses by state, city or micromarket.</p></div>
      <button type="button" className="wog-nav-text-action" onClick={() => onDirectory('cities')}>
        Explore every location <ArrowRight aria-hidden="true" size={16} />
      </button>
    </div>
    <div className="wog-nav-mega-grid">
      {LOCATION_CATEGORIES.map(category => <section key={category.key} aria-label={category.label}>
        <h3 className="wog-nav-column-title">{category.label}</h3>
        <LocationLinks locations={popularLocations[category.key]} onNavigate={onNavigate} />
        <button type="button" className="wog-nav-view-all" onClick={() => onDirectory(category.key)}>
          View all {category.key}
        </button>
      </section>)}
      <aside className="wog-nav-guide">
        {navigationGuide ? <>
          {navigationGuide.image && !imageFailed ? <img src={navigationGuide.image.url}
            alt={navigationGuide.image.alt} width={navigationGuide.image.width} height={navigationGuide.image.height}
            decoding="async" onError={() => setImageFailed(true)} />
            : <div className="wog-nav-guide-placeholder"><MapPin aria-hidden="true" size={32} /></div>}
          <div className="wog-nav-guide-copy">
            <p className="wog-nav-eyebrow">Market guide</p>
            <h3>{navigationGuide.label}<span>{navigationGuide.parentLabel}</span></h3>
            <p>Rents, warehouse specifications and local access.</p>
            <HeaderLink label="Read the market guide" href={navigationGuide.href} arrow onNavigate={onNavigate} />
          </div>
        </> : <div className="wog-nav-guide-copy wog-nav-guide-help">
          <MapPin aria-hidden="true" size={28} />
          <h3>Need help choosing a location?</h3>
          <p>Tell us where you need space. We'll help you compare your options.</p>
          <HeaderLink {...WAREHOUSE_REQUEST} arrow onNavigate={onNavigate} />
        </div>}
      </aside>
    </div>
    <div className="wog-nav-mega-footer">
      <p>Browse the full warehouse catalogue.</p>
      <HeaderLink label="Browse all listings" href="/listings" className="wog-nav-text-action" arrow onNavigate={onNavigate} />
    </div>
  </div>;
}
