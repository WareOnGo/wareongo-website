import { ArrowRight } from 'lucide-react';
import type { MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import type { NavigationLocation } from '@/lib/locationNavigation';

export type NavigateFromHeader = (label: string, href: string) => void;

// Only same-tab activation closes navigation. Leave native new-tab/window and
// download gestures alone so they do not unmount the link or reset the menu.
function navigateInCurrentTab(event: MouseEvent<HTMLAnchorElement>, onNavigate: NavigateFromHeader | undefined, label: string, href: string) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    || (event.currentTarget.target && event.currentTarget.target !== '_self') || event.currentTarget.hasAttribute('download')) return;
  onNavigate?.(label, href);
}

export function NavigationBrand({ onNavigate }: { onNavigate?: NavigateFromHeader }) {
  return <NavLink to="/" aria-label="WareOnGo home" className="wog-nav-brand" onClick={event => navigateInCurrentTab(event, onNavigate, 'Home', '/')}>
    <img src="/logo_transparent.webp" alt="" width="120" height="85" />
    <span>WAREONGO</span>
  </NavLink>;
}

export function HeaderLink({ label, href, className = '', arrow = false, onNavigate }: {
  label: string; href: string; className?: string; arrow?: boolean; onNavigate: NavigateFromHeader;
}) {
  return <NavLink to={href} className={className} onClick={event => navigateInCurrentTab(event, onNavigate, label, href)}>
    <span>{label}</span>{arrow && <ArrowRight aria-hidden="true" size={17} />}
  </NavLink>;
}

export function LocationLinks({ locations, onNavigate }: { locations: NavigationLocation[]; onNavigate: NavigateFromHeader }) {
  return <ul className="wog-nav-places">
    {locations.map(place => <li key={place.id}>
      <NavLink to={place.href} end className="wog-nav-place" onClick={event => navigateInCurrentTab(event, onNavigate, place.label, place.href)}>
        <span><span className="wog-nav-place-name">{place.label}</span>
          {place.parentLabel && <span className="wog-nav-place-parent">{place.parentLabel}</span>}
        </span>
        <ArrowRight aria-hidden="true" size={16} />
      </NavLink>
    </li>)}
  </ul>;
}
