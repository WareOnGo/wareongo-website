import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import EdgeContactFormDialog from '@/components/EdgeContactFormDialog';
import SpotlightCard from '@/components/SpotlightCard';
import { trackEvent } from '@/lib/analytics';

const edgeFeatures = [
  {
    title: "Verified Inventory",
    description: "Pan-India coverage starting BLR + HYD"
  },
  {
    title: "Custom PPTs",
    description: "Automated proposal pipelines"
  },
  {
    title: "Virtual Tours",
    description: "Evaluate sites before visiting"
  },
  {
    title: "Map Discovery",
    description: "Design inventory movement"
  },
  {
    title: "24x7 Support",
    description: "Proposals, visits, negotiations"
  },
  {
    title: "Negotiation",
    description: "Expert handholding through close"
  }
];

const EdgeSection = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [showCardsMobile, setShowCardsMobile] = useState(false);

  return (
    <section id="edge-section">
      <SpotlightCard
        className="edge-spotlight"
        spotlightColor="rgba(56, 140, 224, 0.25)"
      >
        <div className="container mx-auto px-4 max-w-[85rem]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-sky-300/90 font-medium mb-5 inline-block">
                Beta Access · By Application Only
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold mb-5 md:mb-6 leading-tight text-white text-balance">
                Warehousing Decisions Just Got{' '}
                <span className="text-sky-300/70">Significantly Smarter.</span>
              </h2>
              <p className="text-white/75 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-xl leading-relaxed">
                WareOnGo Edge — India's first verified warehousing advisory portal.
                Invite-only access for SCM leaders, 3PL decision-makers, and verified
                supply chain professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    trackEvent('cta_click', { label: 'Request Beta Access', cta_location: 'edge_section' });
                    setIsContactDialogOpen(true);
                  }}
                  className="bg-white text-wareongo-blue text-base font-medium px-7 py-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Request Beta Access
                </button>
                <button
                  onClick={() => setShowCardsMobile(!showCardsMobile)}
                  className="md:hidden inline-flex items-center justify-center gap-2 border border-white/25 text-white text-base font-medium px-7 py-4 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {showCardsMobile ? 'Show Less' : 'Learn More'}
                  <ArrowDown className={`h-4 w-4 transition-transform ${showCardsMobile ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right Column: Features Grid */}
            <div className="lg:col-span-7">
              <div className={`${showCardsMobile ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4`}>
                {edgeFeatures.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col justify-center items-start text-left h-full"
                  >
                    <h3 className="text-sky-100 font-medium text-lg mb-1.5">{feature.title}</h3>
                    <p className="text-sky-100/60 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </SpotlightCard>

      <EdgeContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        source="edge-beta"
      />

      <style>{`
        .edge-spotlight {
          background:
            radial-gradient(ellipse 70% 55% at 30% 35%, rgba(56, 140, 224, 0.18) 0%, rgba(56, 140, 224, 0.08) 40%, rgba(56, 140, 224, 0) 70%),
            linear-gradient(45deg, #0e2d4a 0%, #0A2239 55%, #081c2e 100%) !important;
          background-color: transparent !important;
          border: none !important;
          border-radius: 0;
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .edge-spotlight {
            padding: 6rem 0;
          }
        }
        @media (min-width: 1024px) {
          .edge-spotlight {
            min-height: 100vh;
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};

export default EdgeSection;
