import React, { useState } from 'react';
import { Phone, Mail, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import {
  CITIES,
  STATES,
  CITIES_BY_TYPE,
  STATES_BY_TYPE,
  MICROMARKETS,
  CITY_MIN_LISTINGS,
  type LocationSummary,
} from '@/data/locations.generated';

// Footer link curation — concentrate link equity on (a) cities already surfacing
// in Search Console impressions and (b) deepest-inventory markets, instead of
// diluting ~300 links across the long tail.
const FOOTER_CITY_SLUGS = new Set([
  // Deepest inventory
  'bengaluru', 'gurugram', 'hyderabad', 'hosur', 'kolkata', 'ghaziabad',
  'ahmedabad', 'patna', 'noida', 'greater-noida', 'delhi',
  // Surfacing in Search Console impressions (as of June 2026).
  'mumbai', 'pune', 'chennai', 'goa', 'indore', 'okhla', 'kanpur',
  'jaipur', 'surat', 'aurangabad', 'guwahati', 'raipur', 'varanasi', 'kochi',
]);

// Whitelisted *and* past the inventory threshold. The second half is the
// delisting rule the sitemap applies too — footer-linking a near-empty page
// helps nobody, and linking one the sitemap omits sends mixed signals. A
// whitelisted city that falls below the bar drops out on its own and comes
// back when inventory grows, without a code change.
const listedCitySlugs = new Set(
  CITIES.filter((c) => c.count >= CITY_MIN_LISTINGS).map((c) => c.slug),
);
// Gated on the city's total inventory, not the per-type count in CITIES_BY_TYPE
// — a listed city's PEB split stays linked even if only one listing is PEB.
const curateCities = (items: LocationSummary[]) =>
  items.filter((c) => FOOTER_CITY_SLUGS.has(c.slug) && listedCitySlugs.has(c.slug));

interface LocationLinkGridProps<T extends LocationSummary = LocationSummary> {
  heading: string;
  basePath?: string;
  items: T[];
  /** Appended to each link's href (e.g. "/peb"). Leading slash required. */
  pathSuffix?: string;
  /** Prepended to each visible label (e.g. "PEB "). Trailing space if needed. */
  labelPrefix?: string;
  /** Overrides the basePath/pathSuffix href, for items that don't share one base. */
  hrefFor?: (loc: T) => string;
}

const LocationLinkGrid = <T extends LocationSummary>({
  heading,
  basePath = '',
  items,
  pathSuffix = '',
  labelPrefix = '',
  hrefFor,
}: LocationLinkGridProps<T>) => {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">{heading}</h4>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-sm">
        {items.map((loc) => {
          const href = hrefFor ? hrefFor(loc) : `${basePath}/${loc.slug}${pathSuffix}`;
          const label = `${labelPrefix}Spaces in ${loc.canonical}`;
          return (
            <li key={`${loc.slug}${pathSuffix}`} className="min-w-0">
              <Link
                to={href}
                title={label}
                onClick={() =>
                  trackEvent('nav_click', { label, destination: href, position: 'footer' })
                }
                className="block truncate text-gray-300 hover:text-white transition-colors"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ExploreSpacesSection = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/10 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left text-lg font-semibold mb-3 hover:text-wareongo-ivory transition-colors"
      >
        <span>Explore our spaces</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {/* Always rendered to DOM so crawlers can follow links — visually toggled via display class. */}
      <div aria-hidden={!open} className={open ? 'space-y-6' : 'hidden'}>
        <LocationLinkGrid heading="By City" basePath="/listings/city" items={curateCities(CITIES)} />
        {/* No curation needed — MICROMARKETS is already gated on a minimum
            listing count, so every entry is a page worth linking. Each nests
            under its own parent city, hence hrefFor rather than a shared base. */}
        <LocationLinkGrid
          heading="By Micro-market"
          items={MICROMARKETS}
          hrefFor={(m) => `/listings/city/${m.citySlug}/${m.slug}`}
        />
        <LocationLinkGrid heading="By State" basePath="/listings/state" items={STATES} />
        <LocationLinkGrid
          heading="PEB · By City"
          basePath="/listings/city"
          items={curateCities(CITIES_BY_TYPE.PEB)}
          pathSuffix="/peb"
          labelPrefix="PEB "
        />
        <LocationLinkGrid
          heading="RCC · By City"
          basePath="/listings/city"
          items={curateCities(CITIES_BY_TYPE.RCC)}
          pathSuffix="/rcc"
          labelPrefix="RCC "
        />
        <LocationLinkGrid
          heading="PEB · By State"
          basePath="/listings/state"
          items={STATES_BY_TYPE.PEB}
          pathSuffix="/peb"
          labelPrefix="PEB "
        />
        <LocationLinkGrid
          heading="RCC · By State"
          basePath="/listings/state"
          items={STATES_BY_TYPE.RCC}
          pathSuffix="/rcc"
          labelPrefix="RCC "
        />
      </div>
    </div>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFooterNav = (label: string, destination: string, action: () => void) => {
    trackEvent('nav_click', { label, destination, position: 'footer' });
    action();
  };

  const scrollToSection = (id: string) => {
    // If not on homepage, navigate to homepage first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Add a small delay to ensure navigation happens before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If already on homepage, just scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAboutUsClick = () => {
    // Navigate to About Us page
    if (location.pathname !== '/about-us') {
      navigate('/about-us');
    } else {
      // If already on About Us page, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-wareongo-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WareOnGo</h3>
            <p className="mb-4 text-gray-300">
              Find the Right Warehouse, Faster.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleFooterNav('Home', '/', () => navigate('/'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('How It Works', '#how-it-works', () => scrollToSection('how-it-works'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('Listings', '#listings', () => scrollToSection('listings'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Listings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('Request a Warehouse', '#request', () => scrollToSection('request'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Request a Warehouse
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('About Us', '/about-us', handleAboutUsClick)}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <Link
                  to="/casestudies"
                  title="Real warehouse deals we closed — costs, compliance and timelines"
                  onClick={() => trackEvent('nav_click', { label: 'Case Studies', destination: '/casestudies', position: 'footer' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Case Studies
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  title="Guides on leasing, compliance and warehouse rent in India"
                  onClick={() => trackEvent('nav_click', { label: 'Guides', destination: '/guides', position: 'footer' })}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Warehousing Guides
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Warehouse Search</li>
              <li className="text-gray-300">Build-To-Suit</li>
              <li className="text-gray-300">Lease Negotiation</li>
              <li className="text-gray-300">Compliance Procurement</li>
              <li className="text-gray-300">Manpower Services</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <a
                  href="tel:+917400184225"
                  onClick={() => trackEvent('contact_click', { contact_type: 'phone', value: '+917400184225', location: 'footer' })}
                  className="hover:text-wareongo-ivory transition-colors"
                >
                  (+91) 74001-84225
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <a
                  href="mailto:sales@wareongo.com"
                  onClick={() => trackEvent('contact_click', { contact_type: 'email', value: 'sales@wareongo.com', location: 'footer' })}
                  className="hover:text-wareongo-ivory transition-colors"
                >
                  sales@wareongo.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10">
          <ExploreSpacesSection />
        </div>

        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-400 text-sm">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
            <Link
              to="/privacy-policy"
              onClick={() => trackEvent('nav_click', { label: 'Privacy Policy', destination: '/privacy-policy', position: 'footer' })}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              to="/terms-of-service"
              onClick={() => trackEvent('nav_click', { label: 'Terms of Service', destination: '/terms-of-service', position: 'footer' })}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              to="/login"
              onClick={() => trackEvent('nav_click', { label: 'Login', destination: '/login', position: 'footer' })}
              className="text-gray-500 hover:text-white transition-colors text-xs"
            >
              Login
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Neuroware Technologies Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
