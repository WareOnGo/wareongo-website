import { Handshake, Headset, MapPinned, Scale, ShieldCheck, Warehouse } from 'lucide-react';
import InlineText from '@/components/InlineText';
import defaults from '@/data/ad-pages/bangalore.json';
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

const PLACEHOLDER_TITLES = {
  verified: 'Verified spaces', local: 'Local expertise', lease: 'Lease support',
  'benefit-4': 'Benefit 4', 'benefit-5': 'Benefit 5', 'benefit-6': 'Benefit 6',
};

const PREVIOUS_BENEFIT_BODIES = {
  local: 'The right locality, specs and paperwork, worked by **our experts**.',
  lease: 'We negotiate the rent, security and lock-in, so that you **get the best deal**.',
  verified: 'Every space is **verified by our area managers** before it reaches your shortlist.',
  'benefit-4': '**One expert advisor** from proposal to move-in.',
  'benefit-5': 'We take care of **the boring details** for you.',
  'benefit-6': "Can't find the best fit? We arrange a **tailored warehouse** for you in 6 months.",
};

const METRICS = [
  { value: `${SHORTLIST_HOURS} Hour`, label: 'Curated Shortlist' },
  { value: `${SQFT_TRANSACTED_M} Mn+`, label: 'Sq Ft Leased' },
  { value: `${CITIES_COVERED}+`, label: 'Cities Covered' },
  { value: '3000+', label: 'Verified Spaces across India' },
];

export default function BangaloreBenefits({ content }: { content: AdPageContent }) {
  // Refresh known previous copy and wireframe placeholders in older approved
  // CMS revisions while retaining independently edited titles and descriptions.
  const benefits = defaults.benefits.map(fallback => {
    const saved = content.benefits.find(item => item.id === fallback.id);
    if (!saved || (saved.title === PLACEHOLDER_TITLES[saved.id] && !saved.body.trim())) return fallback;
    return { ...saved, body: saved.body === PREVIOUS_BENEFIT_BODIES[saved.id] ? fallback.body : saved.body };
  });
  const heading = content.copy.whyHeading === 'Why choose WareOnGo' ? defaults.copy.whyHeading : content.copy.whyHeading;

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
        {benefits.map(({ id, title, body }) => {
          const Icon = BENEFIT_ICONS[id];
          return (
            <article key={id} className="bangalore-landing__benefit" data-benefit={id}>
              <div className="bangalore-landing__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.5} /></div>
              <div>
                <h3>{titleCase(title)}</h3>
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
