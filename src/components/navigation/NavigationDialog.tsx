import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, ChevronDown, LogOut, Search, X } from 'lucide-react';
import { locationCatalogue, popularLocations, PRIMARY_LINKS, WAREHOUSE_REQUEST, NAVIGATION_DESKTOP_QUERY } from '@/data/navigation';
import { LOCATION_CATEGORIES, searchLocations, type LocationCategory } from '@/lib/locationNavigation';
import { HeaderLink, LocationLinks, NavigationBrand, type NavigateFromHeader } from './NavigationLinks';

export type NavigationView = 'menu' | 'directory' | null;

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface Props {
  view: NavigationView;
  category: LocationCategory;
  mobileOrigin: boolean;
  account?: { label: string; href?: string; name?: string };
  onCategory: (category: LocationCategory) => void;
  onView: (view: NavigationView) => void;
  onCloseAutoFocus: (event: Event) => void;
  onContact: () => void;
  onLogout: () => void;
  onNavigate: NavigateFromHeader;
}

/** One modal owns both mobile browsing and the directory, so focus never crosses nested traps. */
export default function NavigationDialog({ view, category, mobileOrigin, account, onCategory, onView,
  onCloseAutoFocus, onContact, onLogout, onNavigate }: Props) {
  const id = useId();
  const [expanded, setExpanded] = useState<LocationCategory | null>(null);
  const [query, setQuery] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const previousView = useRef<NavigationView>(null);
  const results = searchLocations(locationCatalogue, query, category);
  const categoryInfo = LOCATION_CATEGORIES.find(item => item.key === category)!;
  const categoryLabel = categoryInfo.label;

  useBrowserLayoutEffect(() => {
    if (view === 'menu' && expanded) {
      // Collapsing the preceding section can move the new heading above the
      // scroll position. Keep that heading visible, including on short phones.
      document.getElementById(`${id}-${expanded}-trigger`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [expanded, view, id]);

  useEffect(() => {
    if (previousView.current === view) return;
    if (view === 'directory') {
      // Avoid opening the software keyboard before a mobile visitor chooses to search.
      (window.matchMedia(NAVIGATION_DESKTOP_QUERY).matches ? inputRef.current : titleRef.current)?.focus({ preventScroll: true });
    } else if (view === 'menu') {
      if (previousView.current === 'directory' && expanded) {
        document.getElementById(`${id}-${expanded}-trigger`)?.focus({ preventScroll: true });
      } else closeRef.current?.focus({ preventScroll: true });
    } else {
      setExpanded(null);
      setQuery('');
    }
    previousView.current = view;
  }, [view, id, expanded]);

  const openDirectory = (key: LocationCategory) => {
    setQuery('');
    onCategory(key);
    onView('directory');
  };

  const changeCategory = (key: LocationCategory) => {
    onCategory(key);
    bodyRef.current?.scrollTo({ top: 0 });
  };

  return <Dialog.Root open={view !== null} onOpenChange={open => { if (!open) onView(null); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="wog-nav-modal-overlay" />
      <Dialog.Content className={`wog-nav-modal wog-navigation ${view === 'menu' ? 'wog-nav-mobile-dialog' : 'wog-nav-directory'}`}
        data-navigation-view={view} aria-describedby={`${id}-description`}
        onOpenAutoFocus={event => {
          event.preventDefault();
          if (view === 'directory') {
            (window.matchMedia(NAVIGATION_DESKTOP_QUERY).matches ? inputRef.current : titleRef.current)?.focus({ preventScroll: true });
          } else closeRef.current?.focus({ preventScroll: true });
        }} onCloseAutoFocus={onCloseAutoFocus}>
        <div className="wog-nav-modal-head">
          {view === 'menu' ? <NavigationBrand onNavigate={onNavigate} /> : <div className="wog-nav-directory-heading">
            {mobileOrigin && <button type="button" className="wog-nav-back" onClick={() => onView('menu')}>
              <ArrowLeft aria-hidden="true" size={16} /> Back to menu
            </button>}
            <Dialog.Title ref={titleRef} tabIndex={-1}>All locations</Dialog.Title>
          </div>}
          {view === 'menu' && <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>}
          <Dialog.Close ref={closeRef} className="wog-nav-close" aria-label={view === 'menu' ? 'Close menu' : 'Close directory'}>
            <span>Close</span><X aria-hidden="true" size={20} />
          </Dialog.Close>
        </div>
        <Dialog.Description id={`${id}-description`} className={view === 'menu' ? 'sr-only' : 'wog-nav-directory-description'}>
          {view === 'menu' ? 'Browse warehouses, locations and company information.' : 'Choose a location to see available warehouses.'}
        </Dialog.Description>
        {view === 'menu' ? <>
          <div className="wog-nav-mobile-body">
            <nav aria-label="Mobile navigation">
              <HeaderLink {...PRIMARY_LINKS[0]} className="wog-nav-mobile-row" arrow onNavigate={onNavigate} />
              {LOCATION_CATEGORIES.map(item => <div className="wog-nav-accordion" key={item.key}>
                <button type="button" id={`${id}-${item.key}-trigger`} className="wog-nav-mobile-row"
                  aria-expanded={expanded === item.key} aria-controls={`${id}-${item.key}`}
                  onClick={() => setExpanded(expanded === item.key ? null : item.key)}>
                  {item.label}<ChevronDown aria-hidden="true" size={19} />
                </button>
                <div id={`${id}-${item.key}`} hidden={expanded !== item.key} className="wog-nav-accordion-panel">
                  <LocationLinks locations={popularLocations[item.key]} onNavigate={onNavigate} />
                  <button type="button" className="wog-nav-view-all" onClick={() => openDirectory(item.key)}>
                    View all {item.key}<ArrowRight aria-hidden="true" size={16} />
                  </button>
                </div>
              </div>)}
              <div className="wog-nav-mobile-secondary">
                {PRIMARY_LINKS.slice(1).map(link => <HeaderLink {...link} key={link.href}
                  className="wog-nav-mobile-row" arrow onNavigate={onNavigate} />)}
              </div>
              {account && <div className="wog-nav-mobile-account">
                <p className="wog-nav-eyebrow">Your account</p>
                {account.name && <p className="wog-nav-account-name">{account.name}</p>}
                {account.href && <HeaderLink label={account.label} href={account.href}
                  className="wog-nav-mobile-row" arrow onNavigate={onNavigate} />}
                <button type="button" className="wog-nav-mobile-row" onClick={onLogout}>Logout<LogOut aria-hidden="true" size={18} /></button>
              </div>}
            </nav>
          </div>
          <div className="wog-nav-mobile-footer">
            <button type="button" className="wog-nav-contact" onClick={onContact}>Contact Us</button>
            <HeaderLink {...WAREHOUSE_REQUEST} className="wog-nav-request" arrow onNavigate={onNavigate} />
          </div>
        </> : <>
          <div className="wog-nav-directory-controls">
            <div className="wog-nav-category-controls" role="group" aria-label="Location type">
              {LOCATION_CATEGORIES.map(item => <button type="button" key={item.key}
                aria-pressed={category === item.key} onClick={() => changeCategory(item.key)}>{item.label}</button>)}
            </div>
            <div className="wog-nav-search">
              <Search aria-hidden="true" size={19} />
              <label htmlFor={`${id}-filter`} className="sr-only">Filter locations</label>
              <input id={`${id}-filter`} ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); bodyRef.current?.scrollTo({ top: 0 }); }}
                placeholder={`Search ${categoryLabel.toLowerCase()}`} autoComplete="off" spellCheck={false} type="text" />
              {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X aria-hidden="true" size={18} /></button>}
            </div>
          </div>
          <div className="wog-nav-directory-count" role="status" aria-live="polite" aria-atomic="true">
            {results.length} {results.length === 1 ? categoryInfo.singular : categoryLabel.toLowerCase()}{query.trim() ? ' found' : ''}
          </div>
          <div className="wog-nav-directory-results" ref={bodyRef}>
            {results.length ? <LocationLinks locations={results} onNavigate={onNavigate} />
              : <div className="wog-nav-empty"><h3>No matching locations</h3>
                <p>Try another name or choose a different location type.</p>
                {query && <button type="button" className="wog-nav-view-all" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>Clear search</button>}
              </div>}
          </div>
          <div className="wog-nav-directory-footer">
            <HeaderLink label="Browse all listings" href="/listings" className="wog-nav-text-action" arrow onNavigate={onNavigate} />
          </div>
        </>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
