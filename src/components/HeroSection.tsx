import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import heroImage from '@/assets/hero-image-1536.jpg';
import heroImageWide from '@/assets/hero-image-2560.jpg';
import heroImageRetina from '@/assets/hero-image-3840.jpg';
import heroImageMobile from '@/assets/hero-image-mobile.jpg';
import heroAvif from '@/assets/hero-image-1536.avif';
import heroAvifWide from '@/assets/hero-image-2560.avif';
import heroAvifRetina from '@/assets/hero-image-3840.avif';
import heroAvifMobile from '@/assets/hero-image-mobile.avif';
import './HeroSection.css';

// React 18 forwards this newer image hint as a lowercase HTML attribute.
const imagePriority = { fetchpriority: 'high' };

const HeroSection = () => (
  <section className="wog-hero" aria-labelledby="hero-heading" data-analytics-placement="hero">
    <picture>
      <source media="(max-width: 767px)" type="image/avif" srcSet={heroAvifMobile} />
      <source media="(max-width: 767px)" srcSet={heroImageMobile} />
      <source
        type="image/avif"
        srcSet={`${heroAvif} 1536w, ${heroAvifWide} 2560w, ${heroAvifRetina} 3840w`}
        sizes="100vw"
      />
      <img
        className="wog-hero-image"
        src={heroImage}
        srcSet={`${heroImage} 1536w, ${heroImageWide} 2560w, ${heroImageRetina} 3840w`}
        sizes="100vw"
        alt=""
        width="1536"
        height="2048"
        {...imagePriority}
        loading="eager"
        decoding="async"
      />
    </picture>
    <div className="wog-hero-shade" aria-hidden="true" />

    <div className="wog-hero-content">
      <ul className="wog-hero-categories" aria-label="Property types">
        <li>Warehousing</li>
        <li>Dark Stores</li>
        <li>Industrial</li>
      </ul>
      <h1 id="hero-heading" className="wog-hero-heading">
        Find Verified<br />Warehouses Faster
      </h1>
      <p className="wog-hero-description">Your Tech-First Warehousing Partner</p>
      <div className="wog-hero-actions">
        <a
          href="https://wa.me/917400184225"
          target="_blank"
          rel="noopener noreferrer"
          className="wog-hero-button wog-hero-contact"
          onClick={() => trackEvent('contact_click', {
            contact_method: 'whatsapp', contact_target: 'sales_whatsapp', placement: 'hero',
          })}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.52 3.48A11.91 11.91 0 0 0 12.04 0C5.43 0 .06 5.37.06 11.98c0 2.11.55 4.17 1.6 5.98L0 24l6.2-1.63a11.98 11.98 0 0 0 5.83 1.49h.01c6.6 0 11.97-5.37 11.98-11.98a11.9 11.9 0 0 0-3.5-8.4ZM12.04 21.84a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.68.97.98-3.59-.24-.37a9.91 9.91 0 0 1-1.52-5.28c0-5.49 4.46-9.96 9.95-9.96a9.9 9.9 0 0 1 7.05 2.93 9.89 9.89 0 0 1 2.91 7.05c0 5.49-4.47 9.96-9.96 9.96Zm5.46-7.46c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.49-.88-.79-1.48-1.77-1.65-2.07-.18-.3-.02-.46.13-.61.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51H7.8c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.52.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
          </svg>
          Get in Touch
        </a>
        <Link
          to="/request-warehouse"
          className="wog-hero-button wog-hero-request"
          onClick={() => trackEvent('cta_click', {
            label: 'Request a Warehouse', placement: 'hero', destination: '/request-warehouse',
          })}
        >
          Request a Warehouse
        </Link>
      </div>
    </div>
  </section>
);

export default HeroSection;
