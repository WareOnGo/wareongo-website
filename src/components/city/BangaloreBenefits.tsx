import { Handshake, Headset, MapPinned, Scale, ShieldCheck, Warehouse } from 'lucide-react';
import InlineText from '@/components/InlineText';
import { CITIES_COVERED, SHORTLIST_HOURS, SQFT_TRANSACTED_M } from '@/data/companyStats';
import type { AdPageContent } from '@/data/adPages';
import { titleCase } from '@/lib/headingCase';

const BENEFIT_ICONS = {
  local: MapPinned,
  lease: Handshake,
  verified: ShieldCheck,
  'benefit-4': Headset,
  'benefit-5': Scale,
  'benefit-6': Warehouse,
};

const METRICS = [
  { value: `${SHORTLIST_HOURS} Hour`, label: 'Curated Shortlist' },
  { value: `${SQFT_TRANSACTED_M} Mn+`, label: 'Sq Ft Leased' },
  { value: `${CITIES_COVERED}+`, label: 'Cities Covered' },
  { value: '3000+', label: 'Verified Spaces across India' },
];

export default function BangaloreBenefits({ content }: { content: AdPageContent }) {
  const benefits = content.benefits;
  const heading = content.copy.whyHeading;

  return (
    <section className="bangalore-landing__why bangalore-landing__container" aria-labelledby="bangalore-why-title">
      <div className="bangalore-landing__section-heading bangalore-landing__why-heading">
        <h2 id="bangalore-why-title" className="bangalore-landing__section-title">{heading}</h2>
      </div>
      <dl className="bangalore-landing__proof-metrics">
        {METRICS.map(({ value, label }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="bangalore-landing__why-copy">
        {benefits.map(({ id, title, body, mobileTitle }) => {
          const Icon = BENEFIT_ICONS[id];
          return (
            <article key={id} className="bangalore-landing__benefit" data-benefit={id}>
              <div className="bangalore-landing__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.5} /></div>
              <div>
                <h3>
                  {mobileTitle ? (
                    <>
                      <span className="bangalore-landing__benefit-full-title">{titleCase(title)}</span>
                      <span className="bangalore-landing__benefit-mobile-title">{mobileTitle}</span>
                    </>
                  ) : titleCase(title)}
                </h3>
                {body && (
                  <p className="bangalore-landing__benefit-body">
                    <InlineText text={body} />
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
