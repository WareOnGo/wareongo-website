import React, { useState } from 'react';
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
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-wareongo-blue leading-tight mb-4 sm:mb-6">
            Find the Right Warehouse, Faster.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-wareongo-slate mb-8 sm:mb-10 max-w-2xl">
            Verified warehouses tailored to your business needs. Save time, start operations in days.
          </p>
          <button
            onClick={() => setIsContactDialogOpen(true)}
            className="w-full sm:w-auto bg-wareongo-blue text-white text-base font-medium px-7 py-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Request a Warehouse
          </button>
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
