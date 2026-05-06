import React from 'react';
import { Clock, TrendingUp, MapPin, ShieldCheck } from 'lucide-react';

const VALUES = [
  {
    icon: Clock,
    title: 'Relevant Warehouse Options in 6 Hours',
    points: [
      'We evaluate 50 warehouses. You see 5',
      'Scale expansion without building internal teams',
      'RFQ to site visit in 24–48 hrs',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Get 10–15% Better Commercials',
    points: [
      '₹2-4/sq ft monthly savings',
      'Lakhs of rupees saved per lease',
      'Deals based on real benchmarks',
    ],
  },
  {
    icon: MapPin,
    title: 'One SPOC. 75+ Cities. Real Market Access',
    points: [
      '10,000+ warehouses across India',
      'Tier 1, 2 + emerging hubs',
      'Same speed, whether its 1 or 10 cities',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Avoid Costly Mistakes Before You Sign',
    points: [
      '100% legal + compliance checked upfront',
      'No delays or hidden risks',
      '30–50% faster deal closure',
    ],
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto">
          {VALUES.map((item, i) => (
            <div
              key={i}
              className="bg-transparent border border-wareongo-blue rounded-2xl p-6 sm:p-8 transition-all duration-300 group flex flex-col items-start text-left hover:bg-wareongo-blue/5"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-sky-100/50 border border-wareongo-blue/20 flex items-center justify-center mb-5 transition-colors duration-300">
                <item.icon className="w-6 h-6 text-wareongo-blue transition-colors duration-300" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-semibold text-wareongo-blue mb-4">
                {item.title}
              </h3>
              <ul className="text-wareongo-slate leading-relaxed space-y-2 text-sm sm:text-base w-full">
                {item.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-wareongo-blue mt-1.5 w-1.5 h-1.5 rounded-full bg-wareongo-blue flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeStandForSection;
