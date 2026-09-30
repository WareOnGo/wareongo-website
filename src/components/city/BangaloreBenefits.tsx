import { Handshake, Headset, MapPinned, Scale, ShieldCheck, Warehouse } from 'lucide-react';
import InlineText from '@/components/InlineText';
import defaults from '@/data/ad-pages/bangalore.json';
import { CITIES_COVERED, SHORTLIST_HOURS, SQFT_TRANSACTED_M } from '@/data/companyStats';
import type { AdPageContent } from '@/data/adPages';

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

const MOBILE_BENEFITS = {
  local: { title: 'Local Expertise', body: 'Locality, specs & paperwork.' },
  lease: { title: 'Better Terms', body: 'Better rent, deposit & lock-in.' },
  verified: { title: 'Verified Spaces', body: 'Checked by our area managers.' },
  'benefit-4': { title: 'One Advisor', body: 'One expert from proposal to move-in.' },
  'benefit-5': { title: 'Legal Support', body: 'Compliance & legal details handled.' },
  'benefit-6': { title: 'Built to Suit', body: 'A tailored warehouse in 6 months.' },
};

const METRICS = [
  { value: `${SHORTLIST_HOURS} hours`, label: 'to your curated shortlist' },
  { value: `${SQFT_TRANSACTED_M} Mn+`, label: 'sq ft leased' },
  { value: `${CITIES_COVERED}+`, label: 'cities covered' },
];

export default function BangaloreBenefits({ content }: { content: AdPageContent }) {
  // Older approved CMS revisions still contain the empty wireframe cards.
  // Fill those exact placeholders while preserving authored titles and copy.
  const benefits = defaults.benefits.map(fallback => {
    const saved = content.benefits.find(item => item.id === fallback.id);
    const benefit = !saved || (saved.title === PLACEHOLDER_TITLES[saved.id] && !saved.body.trim()) ? fallback : saved;
    // Compact the reference copy on phones without replacing authored CMS edits.
    const mobileCopy = benefit.title === fallback.title && benefit.body === fallback.body ? MOBILE_BENEFITS[benefit.id] : null;
    return { ...benefit, mobileCopy };
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
        {benefits.map(({ id, title, body, mobileCopy }) => {
          const Icon = BENEFIT_ICONS[id];
          return (
            <article key={id} className="bangalore-landing__benefit" data-benefit={id}>
              <div className="bangalore-landing__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.5} /></div>
              <div>
                <h3>
                  <span className={mobileCopy ? 'bangalore-landing__benefit-full-copy' : undefined}>{title}</span>
                  {mobileCopy && <span className="bangalore-landing__benefit-mobile-copy">{mobileCopy.title}</span>}
                </h3>
                {body && (
                  <p className="bangalore-landing__benefit-body">
                    <span className={mobileCopy ? 'bangalore-landing__benefit-full-copy' : undefined}><InlineText text={body} /></span>
                    {mobileCopy && <span className="bangalore-landing__benefit-mobile-copy">{mobileCopy.body}</span>}
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
