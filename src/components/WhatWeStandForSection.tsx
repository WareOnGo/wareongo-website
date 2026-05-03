import React from 'react';
import { Zap, Handshake, ShieldCheck } from 'lucide-react';

const VALUES = [
  {
    icon: Zap,
    title: 'Propose Faster',
    description:
      'Custom detailed proposals delivered within 3 hours. We move quickly to ensure you can make fast, informed decisions.',
  },
  {
    icon: Handshake,
    title: 'Negotiate Better',
    description:
      'Expert lease advisory and deal structuring support. We help you secure the most favorable commercial terms for your business.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Intelligence',
    description:
      'What you see is what you lease. We conduct strong due diligence and physical inspections to guarantee complete listing accuracy.',
  },
];

const WhatWeStandForSection = () => {
  return (
    <section className="bg-wareongo-ivory pt-16 pb-4 md:pt-24 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-3">
            Our Core Values
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue">
            What We Stand For
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {VALUES.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-wareongo-ivory flex items-center justify-center mb-6 group-hover:bg-wareongo-blue transition-colors duration-300">
                <item.icon className="w-6 h-6 text-wareongo-blue group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-wareongo-blue mb-3">
                {item.title}
              </h3>
              <p className="text-wareongo-slate leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeStandForSection;
