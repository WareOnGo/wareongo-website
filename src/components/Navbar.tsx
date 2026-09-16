import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, User } from 'lucide-react';
import { useLocation, useNavigation } from 'react-router-dom';
import ContactFormDialog from '@/components/ContactFormDialog';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/lib/analytics';
import type { LocationCategory } from '@/lib/locationNavigation';
import { NAVIGATION_DESKTOP_QUERY, PRIMARY_LINKS, WAREHOUSE_REQUEST } from '@/data/navigation';
import { HeaderLink, NavigationBrand } from './navigation/NavigationLinks';
import LocationsMenu from './navigation/LocationsMenu';
import NavigationDialog, { type NavigationView } from './navigation/NavigationDialog';
import './navigation/navigation.css';

type Variant = 'desktop' | 'mobile';
type Panel = 'locations' | 'account' | null;

const Navbar = () => {
  const id = useId();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigation = useNavigation();
  const [panel, setPanel] = useState<Panel>(null);
  const [view, setView] = useState<NavigationView>(null);
  const [category, setCategory] = useState<LocationCategory>('cities');
  const [variant, setVariant] = useState<Variant>('desktop');
  const [contactVariant, setContactVariant] = useState<Variant>('desktop');
  const [contactOpen, setContactOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const locationsButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const contactButton = useRef<HTMLButtonElement>(null);
  const transferringToContact = useRef(false);
  const followingLink = useRef(false);

  const account = isAuthenticated && user ? {
    name: user.name || user.email,
    label: user.role === 'admin' ? 'Admin Panel' : 'Dashboard',
    href: user.role === 'admin' ? '/admin-panel' : user.role === 'user' ? '/user-dashboard' : undefined,
  } : undefined;

  const focusVisibleTrigger = () => {
    (window.matchMedia(NAVIGATION_DESKTOP_QUERY).matches ? locationsButton.current : mobileButton.current)?.focus({ preventScroll: true });
  };

  const navigateFrom = (placement: Variant, label: string, href: string) => {
    trackEvent('nav_click', { label, destination: href, placement: 'header', navigation_variant: placement });
    followingLink.current = href.replace(/\/+$/, '') !== location.pathname.replace(/\/+$/, '');
    if (!followingLink.current && panel) {
      (panel === 'locations' ? locationsButton : accountButton).current?.focus({ preventScroll: true });
    }
    setPanel(null);
    setView(null);
  };
  const desktopNavigate = (label: string, href: string) => navigateFrom('desktop', label, href);

  const openDirectory = (nextCategory: LocationCategory) => {
    followingLink.current = false;
    setVariant('desktop');
    setCategory(nextCategory);
    setPanel(null);
    setView('directory');
  };

  const openContact = (placement: Variant) => {
    trackEvent('cta_click', { cta_id: 'contact_us', form_id: 'header_contact', lead_type: 'general_contact',
      label: 'Contact Us', placement: 'header', navigation_variant: placement });
    transferringToContact.current = true;
    setContactVariant(placement);
    setPanel(null);
    setView(null);
    setContactOpen(true);
  };

  const signOut = () => {
    logout();
    setPanel(null);
    setView(null);
    focusVisibleTrigger();
  };

  useEffect(() => {
    if (!panel) return;
    const region = panel === 'locations' ? locationsRef : accountRef;
    const dismissOutside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !region.current?.contains(event.target)) setPanel(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setPanel(null);
      (panel === 'locations' ? locationsButton : accountButton).current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [panel]);

  useEffect(() => {
    const media = window.matchMedia(NAVIGATION_DESKTOP_QUERY);
    const onChange = () => {
      // Hiding the desktop row can blur its trigger before this event fires.
      const active = document.activeElement;
      const hadFocus = (headerRef.current?.contains(active) && active instanceof HTMLElement && !active.getClientRects().length)
        || (active === document.body && panel !== null);
      setPanel(null);
      // Close a mobile menu on desktop; an open directory simply reflows.
      if (media.matches) {
        setView(current => current === 'menu' ? null : current);
        setVariant('desktop');
      }
      if (hadFocus) (media.matches ? locationsButton : mobileButton).current?.focus({ preventScroll: true });
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [panel]);

  useEffect(() => {
    // Also dismiss for history changes and navigation initiated outside this header.
    setPanel(null);
    setView(null);
  }, [location.pathname, location.search, navigation.location?.pathname]);

  return <header ref={headerRef} className="wog-nav-header wog-navigation" onBlurCapture={event => {
    // CSS can hide a focused control before matchMedia fires. Handle that blur
    // without moving focus away from a still-visible logo or page content.
    if (!event.relatedTarget && event.target instanceof HTMLElement
      && headerRef.current?.contains(event.target) && !event.target.getClientRects().length) focusVisibleTrigger();
  }}>
    {panel === 'locations' && <div className="wog-nav-scrim" aria-hidden="true" />}
    <div className="wog-nav-bar">
      <NavigationBrand onNavigate={(label, href) => navigateFrom(window.matchMedia(NAVIGATION_DESKTOP_QUERY).matches ? 'desktop' : 'mobile', label, href)} />
      <nav aria-label="Main navigation" className="wog-nav-desktop" data-analytics-placement="header_desktop">
        <div className="wog-nav-page-links">
        <HeaderLink {...PRIMARY_LINKS[0]} className="wog-nav-item" onNavigate={desktopNavigate} />
        <div ref={locationsRef} className="wog-nav-locations-disclosure">
          <button type="button" ref={locationsButton} className="wog-nav-item" aria-expanded={panel === 'locations'}
            aria-controls={`${id}-locations`} onClick={() => setPanel(panel === 'locations' ? null : 'locations')}>
            Locations <ChevronDown aria-hidden="true" size={14} />
          </button>
          <div id={`${id}-locations`} hidden={panel !== 'locations'} className="wog-nav-mega-container">
            {panel === 'locations' && <LocationsMenu onDirectory={openDirectory} onNavigate={desktopNavigate} />}
          </div>
        </div>
        {PRIMARY_LINKS.slice(1).map(link => <HeaderLink {...link} key={link.href} className="wog-nav-item" onNavigate={desktopNavigate} />)}
        </div>
        <div className="wog-nav-actions">
        <HeaderLink {...WAREHOUSE_REQUEST} className="wog-nav-request" onNavigate={desktopNavigate} />
        <button type="button" className="wog-nav-contact" ref={contactButton} onClick={() => openContact('desktop')}>Contact Us</button>
        {account && <div ref={accountRef} className="wog-nav-account">
          <button type="button" ref={accountButton} className="wog-nav-account-toggle" aria-label="Your account"
            aria-expanded={panel === 'account'} aria-controls={`${id}-account`} onClick={() => setPanel(panel === 'account' ? null : 'account')}>
            <User aria-hidden="true" size={19} />
          </button>
          <div id={`${id}-account`} hidden={panel !== 'account'} className="wog-nav-account-panel">
            {account.name && <p className="wog-nav-account-name">{account.name}</p>}
            {account.href && <HeaderLink label={account.label} href={account.href} className="wog-nav-item" onNavigate={desktopNavigate} />}
            <button type="button" className="wog-nav-item" onClick={signOut}><LogOut aria-hidden="true" size={16} /> Logout</button>
          </div>
        </div>}
        </div>
      </nav>
      <button type="button" className="wog-nav-mobile-toggle" ref={mobileButton} aria-label="Toggle menu"
        aria-haspopup="dialog" aria-expanded={view !== null && variant === 'mobile'} onClick={() => {
          trackEvent('menu_toggle', { placement: 'header', navigation_variant: 'mobile', expanded: true });
          followingLink.current = false;
          setVariant('mobile');
          setView('menu');
        }}><Menu aria-hidden="true" size={20} /></button>
    </div>
    <NavigationDialog view={view} category={category} mobileOrigin={variant === 'mobile'} account={account}
      onView={setView} onCategory={setCategory} onContact={() => openContact('mobile')} onLogout={signOut}
      onNavigate={(label, href) => navigateFrom(variant, label, href)} onCloseAutoFocus={event => {
        event.preventDefault();
        if (!transferringToContact.current && !followingLink.current) focusVisibleTrigger();
      }} />
    <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen}
      onCloseAutoFocus={event => {
        event.preventDefault();
        transferringToContact.current = false;
        (window.matchMedia(NAVIGATION_DESKTOP_QUERY).matches ? contactButton : mobileButton).current?.focus({ preventScroll: true });
      }} title="Contact Us" description="Share your details, and we'll get back to you!"
      successMessage="We will reach out within 2 hours." source="homepage" requireCompanyName
      analyticsContext={{ placement: 'header', navigation_variant: contactVariant }} />
  </header>;
};

export default Navbar;
