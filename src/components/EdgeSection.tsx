import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import ContactFormDialog from '@/components/ContactFormDialog';
import SpotlightCard from '@/components/SpotlightCard';

const EdgeSection = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const scrollToRequest = () => {
    const el = document.getElementById('request');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-wareongo-ivory">
      <SpotlightCard
        className="edge-spotlight"
        spotlightColor="rgba(56, 140, 224, 0.25)"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-sky-300/90 font-medium">
              Beta Access · By Application Only
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-5 md:mt-6 mb-5 md:mb-6 leading-tight text-white">
              Warehousing Decisions
              <br />
              Just Got{' '}
              <span className="text-sky-300/70">Significantly Smarter.</span>
            </h2>
            <p className="text-white/75 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-2xl">
              WareOnGo Edge — India's first verified warehousing advisory portal.
              Invite-only access for SCM leaders, 3PL decision-makers, and verified
              supply chain professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setIsContactDialogOpen(true)}
                className="bg-white text-wareongo-blue text-base font-medium px-7 py-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Request Beta Access
              </button>
              <button
                onClick={scrollToRequest}
                className="inline-flex items-center justify-center gap-2 border border-white/25 text-white text-base font-medium px-7 py-4 rounded-lg hover:bg-white/5 transition-colors"
              >
                Learn More
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>

      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title="Request Beta Access"
        description="Share your details, and we'll get back to you!"
        successMessage="We will reach out within 2 hours."
        source="edge-beta"
      />

      <style>{`
        .edge-spotlight {
          background-color: #0A2239;
          border: none;
          border-radius: 0;
          padding: 4rem 0;
        }
        @media (min-width: 768px) {
          .edge-spotlight {
            padding: 6rem 0;
          }
        }
      `}</style>
    </section>
  );
};

export default EdgeSection;
