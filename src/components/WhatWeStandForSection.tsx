import React from 'react';
import { Clock, TrendingUp, MapPin, ShieldCheck } from 'lucide-react';
import TrustedBySection from '@/components/TrustedBySection';
import StatsSection from '@/components/StatsSection';

const VALUES = [
  {
    icon: Clock,
    title: 'Relevant Options in Hours, Not Weeks',
    description: 'Skip the endless broker chains',
  },
  {
    icon: TrendingUp,
    title: 'Better Commercials, Negotiated by Us',
    description: 'We close the deal — you save 8–12%.',
  },
  {
    icon: MapPin,
    title: 'One Point of Contact across India',
    description: 'Hassle-free pan-India market access.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Inventory, Expert Advisory',
    description: 'End-to-end compliance & legal support.',
  },
];

const WhatWeStandForSection = () => {
  return (
    <section className="bg-wareongo-ivory pt-16 pb-0 md:pt-24 md:pb-0">
      <div className="container mx-auto px-4">
        {/* Social proof: trust line + full-bleed logo carousel + stats */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-10 text-center">
          <p className="text-base sm:text-lg md:text-xl uppercase tracking-[0.2em] text-wareongo-blue font-bold">
            Trusted by 200+ companies across India
          </p>
        </div>
        <div className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
          <TrustedBySection />
        </div>

        {/* Divider between social proof and core values */}
        <div className="max-w-5xl mx-auto my-12 md:my-20 border-t border-wareongo-blue/10" />

        {/* Core values header */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-3">
            Our Core Values
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue">
            What We Stand For
          </h2>
          <p className="mt-6 text-lg sm:text-xl font-semibold text-wareongo-blue">
            A better warehouse, on better terms.
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-sm sm:text-base text-wareongo-slate leading-relaxed">
            Free portals show you a thousand listings. Brokers show you the three they're
            trying to sell. We do neither. WareOnGo verifies every property, builds a shortlist
            matched to you, runs the diligence, and negotiates the commercials.
          </p>
          <p className="mt-4 text-sm sm:text-base text-wareongo-slate">
            You only pay when you close the deal.
          </p>
        </div>

        {/* Cards Grid — icon left, text right for a balanced, filled card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto">
          {VALUES.map((item, i) => (
            <div
              key={i}
              className="bg-transparent border border-wareongo-blue rounded-2xl p-5 sm:p-6 flex items-start gap-4 transition-colors duration-300 hover:bg-wareongo-blue/5"
            >
              {/* Icon */}
              <div className="w-11 h-11 shrink-0 rounded-xl bg-sky-100/50 border border-wareongo-blue/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-wareongo-blue" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-wareongo-blue leading-snug">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm sm:text-base text-wareongo-slate leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 md:mt-24">
          <StatsSection />
        </div>
      </div>
    </section>
  );
};

export default WhatWeStandForSection;
