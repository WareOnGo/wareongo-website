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
import defaults from '@/data/ad-pages/bangalore.json';
import { MICROMARKETS } from '@/data/locations.generated';
import type { BangaloreLandingData } from '@/loaders/bangaloreLandingLoader';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { normalizeHeadingCase, titleCase } from '@/lib/headingCase';
import '@/components/WarehouseCard.css';
import './BangaloreLanding.css';

// Eight largest by listing count among the existing and requested localities.
// See public/bangalore/README.md for the curation date and comparison.
const LOCATION_SLUGS = ['nelamangala', 'whitefield', 'peenya', 'hoskote', 'devanahalli', 'dobbaspet', 'jigani', 'bommasandra'];
const LOCATIONS = LOCATION_SLUGS.map(slug => MICROMARKETS.find(market => market.citySlug === 'bengaluru' && market.slug === slug))
  .filter((market): market is (typeof MICROMARKETS)[number] => Boolean(market));

const SERVICE_ICONS = { 'find-warehouse': Search, 'build-to-suit': Warehouse, 'list-space': Truck, 'transaction-management': Handshake };
const PREVIOUS_SERVICE_COPY = {
  'find-warehouse': {
    titles: ['Find a warehouse', 'Find the Perfect Space'],
    bodies: ['Verified Bangalore spaces matched to your needs within 4 hours.', 'Verified spaces matched to your needs within 4 hours', 'Verified spaces to suit you in 4 hours'],
    cta: 'Find my warehouse',
  },
  'build-to-suit': {
    titles: ['Build to suit', 'Built-to-Suit Warehouses'],
    bodies: ['We find land and owners to build to your specifications.', 'We find land that fits you, and build to your specs', 'We find land and build to your specs'],
    cta: 'Start a build to suit',
  },
  'list-space': {
    titles: ['Find a tenant or buyer', 'Find a Tenant or Buyer'],
    bodies: ['Find tenants or buyers for your warehouse or spare space.', 'Find tenants or buyers for your property, hassle-free', 'Find tenants or buyers with ease'],
    cta: 'List my space',
  },
  'transaction-management': {
    titles: ['End-to-end transaction management', 'Complete Deal Management'],
    bodies: ['Visits, negotiation, paperwork and compliance, managed through move-in.', 'Visits, Negotiation and Handover, handled end-to-end', 'One expert: from search to handover'],
    cta: 'Get started',
  },
};
// These intentionally differ from the detailed desktop copy managed by the CMS.
const MOBILE_SERVICE_COPY = {
  'find-warehouse': { title: 'Find the Perfect Space', body: 'Verified spaces that suit you in 4 hrs' },
  'build-to-suit': { title: 'Built-to-Suit Warehouses', body: 'Custom-built warehouses, just for you' },
  'list-space': { title: 'Find a Tenant or Buyer', body: 'Rent or sell your property with ease' },
  'transaction-management': { title: 'Complete Deal Management', body: 'One expert: from search to handover' },
};
const AUDIENCE_ICONS = { owners: Warehouse, '3pls': Truck, companies: Building2 };
const AUDIENCE_INTENTS = { owners: ['list-warehouse'], '3pls': ['find-space', 'fill-spare-space'], companies: ['find-warehouse'] };

/** Content slots follow the supplied Google Ads wireframe, top to bottom. */
export default function BangaloreLanding({ content: savedContent = getBangaloreAdPage() }: { content?: AdPageContent } = {}) {
  const copy = normalizeHeadingCase({
    ...savedContent.copy,
    heroAccent: savedContent.copy.heroAccent === 'in Bangalore.' ? defaults.copy.heroAccent : savedContent.copy.heroAccent,
    whyHeading: savedContent.copy.whyHeading === 'Why choose WareOnGo' ? defaults.copy.whyHeading : savedContent.copy.whyHeading,
  });
  const content = { ...savedContent, copy };
  // Refresh previous CMS defaults while retaining later edits to each field.
  const services = content.services.map(item => {
    const previous = PREVIOUS_SERVICE_COPY[item.id];
    const updated = defaults.services.find(service => service.id === item.id) ?? item;
    return {
      ...item, slug: item.id, icon: SERVICE_ICONS[item.id],
      title: previous?.titles.includes(item.title) ? updated.title : item.title,
      description: previous?.bodies.includes(item.body) ? updated.body : item.body,
      cta: item.cta === previous?.cta ? updated.cta : item.cta,
      mobileCopy: MOBILE_SERVICE_COPY[item.id],
    };
  });
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
              {services.map(({ slug, icon: Icon, title, description, cta, mobileCopy }, index) => (
                <article key={slug} className="bangalore-landing__service">
                  <div className="bangalore-landing__icon"><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div>
                  <span className="bangalore-landing__service-number">0{index + 1}</span>
                  <h3>
                    <span className="bangalore-landing__service-full-copy">{titleCase(title)}</span>
                    <span className="bangalore-landing__service-mobile-copy">{mobileCopy.title}</span>
                  </h3>
                  <p>
                    <span className="bangalore-landing__service-full-copy">{description}</span>
                    <span className="bangalore-landing__service-mobile-copy">{mobileCopy.body}</span>
                  </p>
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
                <h3>{titleCase(title)}</h3>
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

        <section id="bangalore-stats" className="bangalore-landing__content bangalore-landing__container" aria-labelledby="bangalore-content-title">
          <div className="bangalore-landing__section-heading">
            <p className="bangalore-landing__eyebrow">{copy.overviewEyebrow}</p>
            <h2 id="bangalore-content-title" className="bangalore-landing__section-title">{copy.overviewHeading}</h2>
          </div>
          <BangaloreLandingStats data={data} content={content} />
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
