import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const PHONE = '+917400184225';

interface RequestCopy { heading: string; description: string; details: string; primaryLabel: string; phoneLabel: string }
const DEFAULT_COPY: RequestCopy = {
  heading: "Still Haven't Found the Warehouse You Want?",
  description: "Tell us your requirements. We'll find it for you.",
  details: 'Pan-India inventory\u00a0·\u00a04-hour shortlist\u00a0·\u00a0You only pay when you close.',
  primaryLabel: 'Request a Warehouse', phoneLabel: 'Call Us Now',
};
const RequestCTASection = ({ className = '', content = DEFAULT_COPY }: { className?: string; content?: RequestCopy }) => {
  return (
    <section className={`bg-wareongo-blue text-ui-surface py-12 md:py-16 text-center relative overflow-hidden ${className}`}>
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ui-surface opacity-5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ui-surface opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="relative z-10">
            <h2 className="ui-section-title mb-4 sm:mb-6">
              {content.heading}
            </h2>
            <p className="text-ui-line text-base mb-2 sm:mb-3 max-w-2xl mx-auto leading-relaxed">
              {content.description}
            </p>
            <p className="text-ui-line text-sm sm:text-base mb-8 sm:mb-10 max-w-2xl mx-auto">
              {content.details}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/request-warehouse"
                onClick={() => trackEvent('cta_click', { label: content.primaryLabel, cta_location: 'request_cta_section', destination: '/request-warehouse' })}
                className="ui-button ui-button--inverse w-full sm:w-auto group"
              >
                {content.primaryLabel}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={`tel:${PHONE}`}
                onClick={() => trackEvent('contact_click', { contact_method: 'phone', contact_target: 'sales_phone', placement: 'request_cta_section' })}
                className="ui-button ui-button--on-dark w-full sm:w-auto"
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
