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
    title: 'Industries / Manufacturers',
  },
  {
    icon: Building2,
    title: 'Developers & Owners',
  },
];

const WhoWeServeSection = () => {
  return (
    <section className="bg-wareongo-ivory pt-12 pb-4 md:pt-16 md:pb-8">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="ui-eyebrow text-wareongo-slate font-medium mb-3">
            Our Customers
          </p>
          <h2 className="ui-section-title text-wareongo-blue">
            Who We Serve
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
          {SEGMENTS.map((item, i) => (
            <div
              key={i}
              className="bg-ui-surface border border-ui-line rounded-xl p-4 sm:p-8 transition-all duration-300 group flex flex-col items-start text-left"
            >
              {/* Icon */}
              <div className="ui-icon mb-3 sm:mb-5 transition-colors duration-300">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-wareongo-blue transition-colors duration-300" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="ui-card-title text-wareongo-blue">
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
