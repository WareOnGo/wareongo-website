import React from 'react';
import { logoVariants } from '@/data/logoVariants.generated';

const BG = 'transparent';
const FADE_COLOR = '#F8F6F1'; // matches bg-wareongo-ivory

// Groups of three or four larger, established brands followed by one smaller brand.
// Company scale is approximate; keep the smaller brands spread throughout the loop.
const COMPANY_LOGOS = [
  { src: '/company_logos/apple.svg', alt: 'Apple', width: 140, height: 160 },
  { src: '/company_logos/siemens.svg', alt: 'Siemens', width: 1000, height: 159 },
  { src: '/company_logos/reliance_digital.webp', alt: 'Reliance Digital', width: 360, height: 99 },
  { src: '/company_logos/mars.webp', alt: 'Mars', width: 360, height: 128 },
  { src: '/company_logos/slikk_2026.webp', alt: 'Slikk', width: 92, height: 52 },

  { src: '/company_logos/cadbury.webp', alt: 'Cadbury', width: 360, height: 134 },
  { src: '/company_logos/flipkart.webp', alt: 'Flipkart', width: 363, height: 95 },
  { src: '/company_logos/tata_power_solar.webp', alt: 'Tata Power Solar', grayscaleOnly: true, width: 179, height: 23 },
  { src: '/company_logos/hero_motorcorp.webp', alt: 'Hero MotoCorp', width: 160, height: 180 },
  { src: '/company_logos/indus_valley.svg', alt: 'The Indus Valley', width: 627, height: 85 },

  { src: '/company_logos/royal_enfield.webp', alt: 'Royal Enfield', width: 400, height: 53 },
  { src: '/company_logos/franke_faber.webp', alt: 'Franke Faber', grayscaleOnly: true, width: 125, height: 19 },
  { src: '/company_logos/renew_power.webp', alt: 'ReNew Power', width: 360, height: 117 },
  { src: '/company_logos/eshopbox.svg', alt: 'Eshopbox', width: 205, height: 28 },

  { src: '/company_logos/steinweg.svg', alt: 'C. Steinweg Group', grayscaleOnly: true, width: 289, height: 72 },
  { src: '/company_logos/pioneer.webp', alt: 'Pioneer', grayscaleOnly: true, width: 360, height: 110 },
  { src: '/company_logos/tci.webp', alt: 'TCI', width: 400, height: 130 },
  { src: '/company_logos/bisleri.webp', alt: 'Bisleri', width: 168, height: 64 },
  { src: '/company_logos/yusuf_bhai.webp', alt: 'Yusuf Bhai Perfumes', width: 400, height: 28 },

  { src: '/company_logos/eureka_forbes.svg', alt: 'Eureka Forbes', width: 360, height: 80 },
  { src: '/company_logos/sunpure.webp', alt: 'Sunpure', grayscaleOnly: true, width: 100, height: 116 },
  { src: '/company_logos/Mamaearth-Logo-Vector.svg-.webp', alt: 'Mamaearth', width: 360, height: 47 },
  { src: '/company_logos/arasfirma.webp', alt: 'Arasfirma', width: 324, height: 180 },

  { src: '/company_logos/symphony.webp', alt: 'Symphony', grayscaleOnly: true, width: 360, height: 150 },
  { src: '/company_logos/snitch.svg', alt: 'Snitch', width: 3325, height: 518 },
  { src: '/company_logos/farmley.webp', alt: 'Farmley', grayscaleOnly: true, width: 140, height: 103 },
  { src: '/company_logos/mumbai_pav_company.webp', alt: 'Mumbai Pav Company', grayscaleOnly: true, width: 222, height: 180 },

  { src: '/company_logos/rentomojo.webp', alt: 'Rentomojo', width: 180, height: 180 },
  { src: '/company_logos/increff.webp', alt: 'Increff', width: 360, height: 108 },
  { src: '/company_logos/holisol.webp', alt: 'Holisol', width: 200, height: 71 },
  { src: '/company_logos/alienkind.webp', alt: 'Alienkind', width: 360, height: 91 },
];

// Keep the same pace as the original 14-logo, 35-second strip as the list grows.
const SCROLL_SECONDS = COMPANY_LOGOS.length * 2.5;

const TrustedBySection = () => {
  const Track = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div className="trusted-track" aria-hidden={ariaHidden}>
      {COMPANY_LOGOS.map((logo) => (
        <div className="trusted-item" key={logo.src}>
          <img
            src={logo.src}
            srcSet={logoVariants[logo.src]}
            sizes={`(min-width: 768px) ${Math.min(136, 64 * logo.width / logo.height)}px, ${Math.min(104, 52 * logo.width / logo.height)}px`}
            alt={ariaHidden ? '' : logo.alt}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            decoding="async"
            className={logo.grayscaleOnly ? "grayscale" : "brightness-0"}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="trusted-strip group">
        <div className="trusted-fade trusted-fade-left" />
        <div className="trusted-fade trusted-fade-right" />
        <div className="trusted-scroller">
          <Track />
          <Track ariaHidden />
        </div>
      </div>

      <style>{`
        .trusted-strip {
          position: relative;
          overflow: hidden;
          width: 100%;
          background: ${BG};
          padding: 1rem 0;
        }
        .trusted-scroller {
          display: flex;
          width: max-content;
          mix-blend-mode: multiply;
          animation: trusted-scroll ${SCROLL_SECONDS}s linear infinite;
        }
        .trusted-strip:hover .trusted-scroller {
          animation-play-state: paused;
        }
        .trusted-track {
          display: flex;
          flex-shrink: 0;
        }
        .trusted-item {
          flex-shrink: 0;
          width: 9.5rem;
          height: 3.25rem;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .trusted-item {
            width: 13rem;
            height: 4rem;
            padding: 0 2.25rem;
          }
        }
        .trusted-item img {
          display: block;
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          opacity: 0.72;
          transition: opacity 0.3s, transform 0.3s;
        }
        .trusted-item img:hover {
          opacity: 1;
          transform: translateY(-1px);
        }
        .trusted-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4rem;
          z-index: 10;
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .trusted-fade { width: 8rem; }
        }
        .trusted-fade-left {
          left: 0;
          background: linear-gradient(to right, ${FADE_COLOR}, transparent);
        }
        .trusted-fade-right {
          right: 0;
          background: linear-gradient(to left, ${FADE_COLOR}, transparent);
        }
        @keyframes trusted-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .trusted-strip { overflow-x: auto; }
          .trusted-scroller { animation: none; }
          .trusted-track[aria-hidden="true"], .trusted-fade { display: none; }
        }
      `}</style>
    </div>
  );
};

export default TrustedBySection;
