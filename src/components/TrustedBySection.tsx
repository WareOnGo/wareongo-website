import React, { useEffect } from 'react';

const LOGO_SRC = '/logo_transparent.png';
const LOGO_COUNT = 8;
const SCROLL_SECONDS = 35;
const BG = 'transparent';
const FADE_COLOR = '#F5F1EB';

const TrustedBySection = () => {
  const items = Array.from({ length: LOGO_COUNT });

  useEffect(() => {
    const img = new Image();
    img.src = LOGO_SRC;
  }, []);

  const Track = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div className="trusted-track" aria-hidden={ariaHidden}>
      {items.map((_, i) => (
        <div className="trusted-item" key={i}>
          <img src={LOGO_SRC} alt="WareOnGo" loading="eager" decoding="async" />
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
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .trusted-item { padding: 0 5rem; }
        }
        .trusted-item img {
          height: 1.5rem;
          width: auto;
          object-fit: contain;
          filter: brightness(0);
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .trusted-item img:hover {
          opacity: 1;
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
