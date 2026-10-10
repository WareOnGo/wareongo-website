import { useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ArrowRight, Building2, Handshake, Search, Truck, Warehouse } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import InlineText from '@/components/InlineText';
import TrustedBySection from '@/components/TrustedBySection';
import BangaloreEnquiryForm from '@/components/city/BangaloreEnquiryForm';
import BangaloreFeaturedListings from '@/components/city/BangaloreFeaturedListings';
import BangaloreAvailableListings from '@/components/city/BangaloreAvailableListings';
import BangaloreAreaGuide from '@/components/city/BangaloreAreaGuide';
import BangaloreBenefits from '@/components/city/BangaloreBenefits';
import BangaloreMicromarkets from '@/components/city/BangaloreMicromarkets';
import BangaloreMarketGuide from '@/components/city/BangaloreMarketGuide';
import ContactFormDialog from '@/components/ContactFormDialog';
import RequestCTASection from '@/components/RequestCTASection';
import { getBangaloreAdPage, type AdPageContent } from '@/data/adPages';
import { MICROMARKETS } from '@/data/locations.generated';
import { BANGALORE_MAP_AREAS, type BangaloreMapScope } from '@/data/bangaloreMicromarketMap';
import type { BangaloreLandingData } from '@/loaders/bangaloreLandingLoader';
import type { AdPreviewView } from './BangaloreAdPreview';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { normalizeHeadingCase, titleCase } from '@/lib/headingCase';
import '@/components/WarehouseCard.css';
import './BangaloreLanding.css';

const SERVICE_ICONS = { 'find-warehouse': Search, 'build-to-suit': Warehouse, 'list-space': Truck, 'transaction-management': Handshake };
const AUDIENCE_ICONS = { owners: Warehouse, '3pls': Truck, companies: Building2 };
const AUDIENCE_INTENTS = { owners: ['list-warehouse'], '3pls': ['find-space', 'fill-spare-space'], companies: ['find-warehouse'] };

/** Content slots follow the supplied Google Ads wireframe, top to bottom. */
export default function BangaloreLanding({ content: savedContent = getBangaloreAdPage(), previewState = 'page' }: { content?: AdPageContent; previewState?: AdPreviewView } = {}) {
  const copy = normalizeHeadingCase(savedContent.copy);
  const content = { ...savedContent, copy };
  const services = content.services.map(item => ({ ...item, slug: item.id, icon: SERVICE_ICONS[item.id], description: item.body, mobileCopy: { title: item.mobileTitle, body: item.mobileBody } }));
  const audiences = content.audiences.map(item => ({ ...item, slug: item.id, description: item.body, icon: AUDIENCE_ICONS[item.id],
    actions: [item.primaryCta, item.secondaryCta].filter(Boolean).map((label, index) => ({ label, intent: AUDIENCE_INTENTS[item.id][index] })),
  }));
  const data = useLoaderData() as BangaloreLandingData | null;
  const locations = BANGALORE_MAP_AREAS.map(location => ({
    ...location,
    count: location.countSlug
      ? data?.cityOverview?.micromarkets?.find(market => market.slug === location.countSlug)?.listings
        ?? MICROMARKETS.find(market => market.citySlug === 'bengaluru' && market.slug === location.countSlug)?.count
        ?? null
      : null,
  }));
  const [mapScope, setMapScope] = useState<BangaloreMapScope>('belts');
  const [contactContext, setContactContext] = useState<AnalyticsParams | null>(previewState === 'contact' ? { source: 'cms-preview' } : null);
  const contactTrigger = useRef<HTMLButtonElement | null>(null);

  function openContact(trigger: HTMLButtonElement, context: AnalyticsParams) {
    contactTrigger.current = trigger;
    const enquiry = { city: 'Bengaluru', state: 'Karnataka', market_slug: 'bengaluru', ...context };
    const isWarehouseEnquiry = enquiry.warehouse_id != null;
    trackEvent('cta_click', {
      ...enquiry,
      cta_id: isWarehouseEnquiry ? 'raise_enquiry' : 'contact_us',
      form_id: isWarehouseEnquiry ? 'warehouse_card_enquiry' : 'header_contact',
      lead_type: isWarehouseEnquiry ? 'warehouse_enquiry' : 'general_contact',
      action: 'open_enquiry_modal',
    });
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
          <BangaloreEnquiryForm copy={copy} previewSubmitted={previewState === 'hero-success'} />
          <BangaloreFeaturedListings content={content} onContact={openContact} />
          <section className="bangalore-landing__trust" aria-labelledby="bangalore-trust-title">
            <h2 id="bangalore-trust-title" className="bangalore-landing__trust-title">Trusted by 200+ Companies across India</h2>
            <TrustedBySection />
          </section>
        </section>

        <BangaloreBenefits content={content} />

        <BangaloreAvailableListings content={content} onContact={openContact} totalListings={data?.stats.listings} />

        <BangaloreMicromarkets content={content} locations={locations} onContact={openContact} scope={mapScope} onScopeChange={setMapScope} />

        <BangaloreAreaGuide scope={mapScope} content={content} />

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
                    <span className="bangalore-landing__service-full-copy"><InlineText text={description} /></span>
                    <span className="bangalore-landing__service-mobile-copy"><InlineText text={mobileCopy.body} /></span>
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
            {audiences.map(({ slug, icon: Icon, title, description, mobileTitle, mobileBody, actions }) => (
              <article key={slug} className="bangalore-landing__audience-card">
                <div className="bangalore-landing__icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></div>
                <h3><span className="bangalore-landing__desktop-copy">{titleCase(title)}</span><span className="bangalore-landing__mobile-copy">{mobileTitle.trim() || titleCase(title)}</span></h3>
                <p><span className="bangalore-landing__desktop-copy"><InlineText text={description} /></span><span className="bangalore-landing__mobile-copy"><InlineText text={mobileBody.trim() || description} /></span></p>
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

        <BangaloreMarketGuide content={content} />
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
