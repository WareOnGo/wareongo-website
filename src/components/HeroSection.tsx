import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactFormDialog from '@/components/ContactFormDialog';

const HeroSection = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  return (
    <section className="relative bg-wareongo-ivory overflow-hidden -mt-20 pt-20 min-h-screen flex items-center">
      {/* Background video (grayscale baked in) */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Soft fade for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-wareongo-ivory/40 via-transparent to-wareongo-ivory pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <span className="text-[10px] min-[375px]:text-xs sm:text-sm font-semibold tracking-widest uppercase text-wareongo-slate mb-3 block">
            Warehousing | Industrial | Dark Stores
          </span>
          <h1 className="text-[clamp(1.5rem,6.5vw,3rem)] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-wareongo-blue leading-tight mb-4 sm:mb-6 whitespace-nowrap tracking-tight sm:tracking-normal">
            Find. Shortlist. Move In.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-wareongo-slate mb-8 sm:mb-10 max-w-2xl leading-relaxed">
            Verified inventory and expert advisory pan-India. From proposal to possession - with the speed of technology.
          </p>
          <Link
            to="/request-warehouse"
            className="inline-block text-center w-full sm:w-auto bg-wareongo-blue text-white text-base font-medium px-7 py-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Request a Warehouse
          </Link>
        </div>
      </div>

      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title="Request a Warehouse"
        description="Share your details, and we'll get back to you!"
        successMessage="We will reach out within 2 hours."
        source="hero"
      />
    </section>
  );
};

export default HeroSection;
