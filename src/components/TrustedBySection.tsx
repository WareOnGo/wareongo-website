import React from 'react';

const SCROLL_SECONDS = 35;
const BG = 'transparent';
const FADE_COLOR = '#F5F1EB';

const COMPANY_LOGOS = [
  { src: '/company_logos/reliance_digital.webp', alt: 'Reliance Digital', width: 360, height: 99 },
  { src: '/company_logos/hero_motorcorp.webp', alt: 'Hero MotoCorp', width: 160, height: 180 },
  { src: '/company_logos/cadbury.webp', alt: 'Cadbury', width: 360, height: 134 },
  { src: '/company_logos/mars.webp', alt: 'Mars', width: 360, height: 128 },
  { src: '/company_logos/mumbai_pav_company.webp', alt: 'Mumbai Pav Company', grayscaleOnly: true, width: 222, height: 180 },
  { src: '/company_logos/increff.webp', alt: 'Increff', width: 360, height: 108 },
  { src: '/company_logos/renew_power.webp', alt: 'ReNew Power', width: 360, height: 117 },
  { src: '/company_logos/rentomojo.webp', alt: 'Rentomojo', width: 180, height: 180 },
  { src: '/company_logos/pioneer.webp', alt: 'Pioneer', grayscaleOnly: true, width: 360, height: 110 },
  { src: '/company_logos/symphony.webp', alt: 'Symphony', grayscaleOnly: true, width: 360, height: 150 },
  { src: '/company_logos/holisol.webp', alt: 'Holisol', width: 200, height: 71 },
  { src: '/company_logos/alienkind.webp', alt: 'Alienkind', width: 360, height: 91 },
  { src: '/company_logos/slikk_logo.webp', alt: 'Slikk', width: 320, height: 180 },
  { src: '/company_logos/Mamaearth-Logo-Vector.svg-.webp', alt: 'Mamaearth', width: 360, height: 47 },
];

const TrustedBySection = () => {
  const Track = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div className="trusted-track" aria-hidden={ariaHidden}>
      {COMPANY_LOGOS.map((logo) => (
        <div className="trusted-item" key={logo.src}>
          <img
            src={logo.src}
            alt={ariaHidden ? '' : logo.alt}
            width={logo.width}
            height={logo.height}
            loading="eager"
            decoding="async"
            className={logo.grayscaleOnly ? "grayscale" : "brightness-0"}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-wareongo-ivory pt-16 pb-10 md:pt-24 md:pb-16">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-wareongo-slate">
          Trusted by
        </p>
      </div>

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
      `}</style>
    </section>
  );
};

export default TrustedBySection;
