import { useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ArrowRight, Building2, Handshake, Search, Truck, Warehouse } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import TrustedBySection from '@/components/TrustedBySection';
import BangaloreLandingStats from '@/components/city/BangaloreLandingStats';
import BangaloreEnquiryForm from '@/components/city/BangaloreEnquiryForm';
import BangaloreFeaturedListings from '@/components/city/BangaloreFeaturedListings';
import BangaloreAvailableListings from '@/components/city/BangaloreAvailableListings';
import BangaloreAreaGuide from '@/components/city/BangaloreAreaGuide';
import BangaloreBenefits from '@/components/city/BangaloreBenefits';
import BangaloreMicromarkets from '@/components/city/BangaloreMicromarkets';
import ContactFormDialog from '@/components/ContactFormDialog';
import RequestCTASection from '@/components/RequestCTASection';
import { getBangaloreAdPage, type AdPageContent } from '@/data/adPages';
import { MICROMARKETS } from '@/data/locations.generated';
import type { BangaloreLandingData } from '@/loaders/bangaloreLandingLoader';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import '@/components/WarehouseCard.css';
import './BangaloreLanding.css';

// Eight largest by listing count among the existing and requested localities.
// See public/bangalore/README.md for the curation date and comparison.
const LOCATION_SLUGS = ['nelamangala', 'whitefield', 'peenya', 'hoskote', 'devanahalli', 'dobbaspet', 'jigani', 'bommasandra'];
const LOCATIONS = LOCATION_SLUGS.map(slug => MICROMARKETS.find(market => market.citySlug === 'bengaluru' && market.slug === slug))
  .filter((market): market is (typeof MICROMARKETS)[number] => Boolean(market));

const SERVICE_ICONS = { 'find-warehouse': Search, 'build-to-suit': Warehouse, 'list-space': Truck, 'transaction-management': Handshake };
const AUDIENCE_ICONS = { owners: Warehouse, '3pls': Truck, companies: Building2 };
const AUDIENCE_INTENTS = { owners: ['list-warehouse'], '3pls': ['find-space', 'fill-spare-space'], companies: ['find-warehouse'] };

/** Content slots follow the supplied Google Ads wireframe, top to bottom. */
export default function BangaloreLanding({ content = getBangaloreAdPage() }: { content?: AdPageContent } = {}) {
  const copy = content.copy;
  const services = content.services.map(item => ({ ...item, slug: item.id, description: item.body, icon: SERVICE_ICONS[item.id] }));
  const audiences = content.audiences.map(item => ({ ...item, slug: item.id, description: item.body, icon: AUDIENCE_ICONS[item.id],
    actions: [item.primaryCta, item.secondaryCta].filter(Boolean).map((label, index) => ({ label, intent: AUDIENCE_INTENTS[item.id][index] })),
  }));
  const data = useLoaderData() as BangaloreLandingData | null;
  const locations = LOCATIONS.map(location => ({
    ...location,
    count: data?.cityOverview?.micromarkets?.find(market => market.slug === location.slug)?.listings ?? location.count,
  })).sort((a, b) => b.count - a.count || a.canonical.localeCompare(b.canonical));
  const [contactContext, setContactContext] = useState<AnalyticsParams | null>(null);
  const contactTrigger = useRef<HTMLButtonElement | null>(null);

  function openContact(trigger: HTMLButtonElement, context: AnalyticsParams) {
    contactTrigger.current = trigger;
    const enquiry = { city: 'Bengaluru', state: 'Karnataka', market_slug: 'bengaluru', ...context };
    trackEvent('cta_click', { ...enquiry, cta_id: 'contact_us', form_id: 'header_contact', lead_type: 'general_contact', action: 'open_enquiry_modal' });
    setContactContext(enquiry);
  }

  return (
    <div className="bangalore-landing">
      <PageHead
        title={copy.seoTitle}
        description={copy.metaDescription}
        path="/bangalore"
        noindex
      />

      <Navbar contactDialogClassName="bangalore-landing-dialog" />

      <main className="bangalore-landing__main" aria-labelledby="bangalore-title">
        <section className="bangalore-landing__hero bangalore-landing__container" aria-labelledby="bangalore-title">
          <div className="bangalore-landing__hero-copy">
            <h1 id="bangalore-title" className="bangalore-landing__headline">{copy.heroHeading} <span>{copy.heroAccent}</span></h1>
          </div>
          <BangaloreEnquiryForm copy={copy} />
          <BangaloreFeaturedListings content={content} onContact={openContact} />
          <section className="bangalore-landing__trust" aria-labelledby="bangalore-trust-title">
            <h2 id="bangalore-trust-title" className="bangalore-landing__trust-title">Trusted by 200+ Companies across India</h2>
            <TrustedBySection />
          </section>
        </section>

        <BangaloreBenefits content={content} />

        <BangaloreAvailableListings content={content} onContact={openContact} totalListings={data?.stats.listings} />

        <BangaloreMicromarkets content={content} locations={locations} onContact={openContact} />

        <BangaloreAreaGuide content={content} onContact={openContact} />

        <RequestCTASection className="bangalore-landing__request" content={{ heading: copy.requestHeading, description: copy.requestDescription, details: copy.requestDetails, primaryLabel: copy.requestCta, phoneLabel: copy.requestPhoneCta }} />

        <section className="bangalore-landing__services bangalore-landing__container" aria-labelledby="bangalore-services-title">
          <div className="bangalore-landing__section-heading"><h2 id="bangalore-services-title" className="bangalore-landing__section-title">{copy.servicesHeading}</h2></div>
          <div className="bangalore-landing__services-grid">
            <div className="bangalore-landing__service-copy">
              {services.map(({ slug, icon: Icon, title, description, cta }, index) => (
                <article key={slug} className="bangalore-landing__service">
                  <div className="bangalore-landing__icon"><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div>
                  <span className="bangalore-landing__service-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <button
                    type="button"
                    className="warehouse-card__link bangalore-landing__button bangalore-landing__button--compact"
                    aria-haspopup="dialog"
                    onClick={event => openContact(event.currentTarget, { placement: 'bangalore_services', label: cta, content_type: 'service', content_id: slug, source: `bangalore-service-${slug}` })}
                  >{cta}<ArrowRight size={14} aria-hidden="true" /></button>
                </article>
              ))}
            </div>
            <div className="bangalore-landing__service-image">
              <img src={content.images.services.url} alt={content.images.services.alt} width={content.images.services.width} height={content.images.services.height} loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="bangalore-landing__audiences bangalore-landing__container" aria-labelledby="bangalore-audiences-title">
          <div className="bangalore-landing__section-heading">
            <h2 id="bangalore-audiences-title" className="bangalore-landing__section-title">{copy.audiencesHeading}</h2>
          </div>
          <div className="bangalore-landing__audience-grid">
            {audiences.map(({ slug, icon: Icon, title, description, actions }) => (
              <article key={slug} className="bangalore-landing__audience-card">
                <div className="bangalore-landing__icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="bangalore-landing__audience-actions">
                  {actions.map(({ label, intent }, index) => (
                    <button
                      key={intent}
                      type="button"
                      className={`bangalore-landing__button bangalore-landing__button--compact bangalore-landing__audience-cta ${index === 0 ? 'warehouse-card__link' : 'bangalore-landing__button--outline'}`}
                      aria-haspopup="dialog"
                      onClick={event => openContact(event.currentTarget, { placement: 'bangalore_audiences', label, content_type: 'audience', content_id: `${slug}-${intent}`, source: `bangalore-landing-${slug}-${intent}` })}
                    >
                      {label}<ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bangalore-landing__content bangalore-landing__container" aria-labelledby="bangalore-content-title">
          <div className="bangalore-landing__section-heading">
            <p className="bangalore-landing__eyebrow">{copy.overviewEyebrow}</p>
            <h2 id="bangalore-content-title" className="bangalore-landing__section-title">{copy.overviewHeading}</h2>
          </div>
          <div className="bangalore-landing__content-columns">
            {content.overviewParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <dl className="bangalore-landing__market-summary">
            {content.overviewStats.map((stat, index) => <div key={index}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
          </dl>
        </section>

        <section id="bangalore-stats" className="bangalore-landing__stats bangalore-landing__container" aria-labelledby="bangalore-stats-title">
          <div className="bangalore-landing__section-heading"><h2 id="bangalore-stats-title" className="bangalore-landing__section-title">{copy.statsHeading}</h2></div>
          <BangaloreLandingStats data={data} copy={copy} />
        </section>
      </main>
      <Footer />
      <ContactFormDialog
        className="bangalore-landing-dialog"
        open={contactContext !== null}
        onOpenChange={open => { if (!open) setContactContext(null); }}
        title={copy.contactHeading}
        description={copy.contactDescription}
        successMessage={copy.contactSuccess}
        source={contactContext?.source || 'bangalore-landing'}
        requireCompanyName
        analyticsContext={contactContext ?? undefined}
        onCloseAutoFocus={event => {
          event.preventDefault();
          contactTrigger.current?.focus({ preventScroll: true });
        }}
      />
    </div>
  );
}
