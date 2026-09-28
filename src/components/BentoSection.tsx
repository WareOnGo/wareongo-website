import React from 'react';

const BentoSection = () => {
  return (
    <section className="bg-wareongo-ivory py-12 md:py-16">
      <div className="container mx-auto">
        <div className="max-w-2xl mb-8 md:mb-12">
          <h2 className="ui-section-title text-wareongo-blue mb-2 md:mb-3">
            Why WareOnGo
          </h2>
          <p className="text-wareongo-slate text-base">
            Placeholder copy describing the value props at a glance.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-2 gap-3 sm:gap-4 md:gap-5 auto-rows-[10rem] sm:auto-rows-[12rem] md:auto-rows-[14rem]">
          {/* Featured — full-width on mobile, 2x2 on md+ */}
          <div className="col-span-2 md:col-span-2 md:row-span-2 bg-ui-surface border border-ui-line rounded-xl p-5 sm:p-6 md:p-8 flex flex-col justify-between  transition-colors group">
            <span className="ui-eyebrow text-wareongo-slate">Featured</span>
            <div>
              <h3 className="ui-card-title text-wareongo-blue mb-1 sm:mb-2">Headline placeholder</h3>
              <p className="text-wareongo-slate text-sm md:text-base max-w-md">
                A short sentence about the flagship benefit goes here.
              </p>
            </div>
          </div>

          {[2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-ui-surface border border-ui-line rounded-xl p-4 sm:p-5 md:p-6 flex flex-col justify-between  transition-colors"
            >
              <span className="ui-eyebrow text-wareongo-slate">
                Card {String(n).padStart(2, '0')}
              </span>
              <div>
                <h3 className="ui-card-title text-wareongo-blue mb-1">Placeholder</h3>
                <p className="text-xs sm:text-sm text-wareongo-slate">Short description.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoSection;
