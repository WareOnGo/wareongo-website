import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import './AdFooter.css';

const LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Login', href: '/login' },
];

/** Compact footer shared by city and micromarket ad pages. */
export default function AdFooter() {
  return (
    <footer className="ad-footer">
      <div className="ad-footer__inner">
        <div className="ad-footer__brand">
          <p className="ad-footer__name">WareOnGo</p>
        </div>
        <nav aria-label="Footer">
          <ul className="ad-footer__links">
            {LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link to={href} onClick={() => trackEvent('nav_click', { label, destination: href, position: 'footer' })}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="ad-footer__copyright">
          <span>© {new Date().getFullYear()} Neuroware Technologies Private Limited.</span>{' '}
          <span>All rights reserved.</span>
        </p>
      </div>
    </footer>
  );
}
