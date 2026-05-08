import React from 'react';
import { Truck, Users, Factory, Building2 } from 'lucide-react';

const SEGMENTS = [
  {
    icon: Truck,
    title: '3PLs',
  },
  {
    icon: Users,
    title: 'End Users',
  },
  {
    icon: Factory,
    title: 'Industry Owners',
  },
  {
    icon: Building2,
    title: 'Developers & Owners',
  },
];

const WhoWeServeSection = () => {
  return (
    <section className="bg-wareongo-ivory pt-16 pb-4 md:pt-24 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-3">
            Our Customers
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue">
            Who We Serve
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
          {SEGMENTS.map((item, i) => (
            <div
              key={i}
              className="bg-transparent border border-wareongo-blue rounded-2xl p-4 sm:p-8 transition-all duration-300 group flex flex-col items-start text-left hover:bg-wareongo-blue/5"
            >
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-100/50 border border-wareongo-blue/20 flex items-center justify-center mb-3 sm:mb-5 transition-colors duration-300">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-wareongo-blue transition-colors duration-300" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-sm sm:text-xl font-semibold text-wareongo-blue">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeServeSection;
