import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const PHONE = '+917400184225';

interface RequestCopy { heading: string; description: string; details: string; primaryLabel: string; phoneLabel: string }
const DEFAULT_COPY: RequestCopy = {
  heading: "Still haven't found the warehouse you want?",
  description: "Tell us your requirements. We'll find it for you.",
  details: 'Pan-India inventory\u00a0·\u00a04-hour shortlist\u00a0·\u00a0You only pay when you close.',
  primaryLabel: 'Request a Warehouse', phoneLabel: 'Call Us Now',
};
const RequestCTASection = ({ className = '', content = DEFAULT_COPY }: { className?: string; content?: RequestCopy }) => {
  return (
    <section className={`bg-wareongo-blue text-white py-20 md:py-28 text-center relative overflow-hidden ${className}`}>
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {content.heading}
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-2 sm:mb-3 max-w-2xl mx-auto leading-relaxed">
              {content.description}
            </p>
            <p className="text-white/70 text-sm sm:text-base mb-8 sm:mb-10 max-w-2xl mx-auto">
              {content.details}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/request-warehouse"
                onClick={() => trackEvent('cta_click', { label: content.primaryLabel, cta_location: 'request_cta_section', destination: '/request-warehouse' })}
                className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-wareongo-blue text-base sm:text-lg font-bold px-8 py-4 rounded-xl hover:scale-105 hover:bg-wareongo-ivory hover:shadow-xl transition-all duration-300 group"
              >
                {content.primaryLabel}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={`tel:${PHONE}`}
                onClick={() => trackEvent('contact_click', { contact_method: 'phone', contact_target: 'sales_phone', placement: 'request_cta_section' })}
                className="inline-flex items-center justify-center w-full sm:w-auto border border-white/40 text-white text-base sm:text-lg font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="mr-2 w-5 h-5" />
                {content.phoneLabel}
              </a>
            </div>
        </div>
      </div>
    </section>
  );
};

export default RequestCTASection;
