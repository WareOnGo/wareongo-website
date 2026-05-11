import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const RequestCTASection = () => {
  return (
    <section className="bg-wareongo-ivory py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-wareongo-blue text-white rounded-3xl p-10 sm:p-16 md:p-20 text-center flex flex-col items-center relative overflow-hidden shadow-xl">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Still haven't found the perfect space?
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Share your exact requirements with us. Our network spans across millions of square feet of premium inventory, and our advisory team will find the ideal facility tailored for your supply chain.
            </p>
            <Link
              to="/request-warehouse"
              onClick={() => trackEvent('cta_click', { label: 'Request a Warehouse', cta_location: 'request_cta_section', destination: '/request-warehouse' })}
              className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-wareongo-blue text-base sm:text-lg font-bold px-8 py-4 rounded-xl hover:scale-105 hover:bg-wareongo-ivory hover:shadow-xl transition-all duration-300 group"
            >
              Request a Warehouse
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestCTASection;
