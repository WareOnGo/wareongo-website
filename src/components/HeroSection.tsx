import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const HeroSection = () => {
  // Decorative background video is skipped on mobile (and during SSG) to protect LCP.
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setShowVideo(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section className="relative bg-wareongo-ivory overflow-hidden -mt-20 pt-20 min-h-screen flex items-center">
      {/* Background video (grayscale baked in) — desktop only, lazily mounted post-hydration.
          Modern browsers pick AV1 (~500 KB); older Safari falls back to H.264 (~570 KB). */}
      {showVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/hero.av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
          <source src="/hero.h264.mp4" type="video/mp4" />
        </video>
      )}

      {/* Soft fade for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-wareongo-ivory/40 via-transparent to-wareongo-ivory pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="hero-fade-up flex items-center gap-3 mb-5">
            <span className="hidden sm:block h-px w-8 bg-wareongo-slate/40" aria-hidden="true" />
            <span className="text-[10px] min-[375px]:text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-wareongo-slate">
              Warehousing <span className="text-wareongo-blue/50">·</span> Industrial <span className="text-wareongo-blue/50">·</span> Dark Stores
            </span>
            <span className="hidden sm:block h-px w-8 bg-wareongo-slate/40" aria-hidden="true" />
          </div>
          <h1 className="hero-fade-up hero-fade-up-2 text-[clamp(1.5rem,6.5vw,3rem)] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-wareongo-blue leading-tight mb-5 sm:mb-7 whitespace-nowrap tracking-tight sm:tracking-tight">
            Find. Shortlist. Move In.
          </h1>
          <p className="hero-fade-up hero-fade-up-3 text-base sm:text-lg md:text-xl text-wareongo-slate/90 mb-9 sm:mb-11 max-w-2xl leading-relaxed">
            Verified inventory and expert advisory pan-India. From proposal to possession &mdash; with the speed of technology.
          </p>
          <Link
            to="/request-warehouse"
            onClick={() => trackEvent('cta_click', { label: 'Request a Warehouse', cta_location: 'hero', destination: '/request-warehouse' })}
            className="hero-cta hero-fade-up hero-fade-up-4 group inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-wareongo-blue text-white text-base font-medium px-8 py-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Request a Warehouse
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(12px);
          animation: hero-fade-up 700ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .hero-fade-up-2 { animation-delay: 100ms; }
        .hero-fade-up-3 { animation-delay: 200ms; }
        .hero-fade-up-4 { animation-delay: 300ms; }
        @keyframes hero-fade-up {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

    </section>
  );
};

export default HeroSection;
