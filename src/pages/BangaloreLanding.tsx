import { useRef, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ArrowRight, Building2, Handshake, Search, Truck, Warehouse } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdFooter from '@/components/ad/AdFooter';
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
import ContactFormDialog from '@/components/DeferredContactFormDialog';
import RequestCTASection from '@/components/RequestCTASection';
import { getBangaloreAdPage, type AdPageContent } from '@/data/adPages';
import { MICROMARKETS } from '@/data/locations.generated';
import { BANGALORE_MAP_AREAS, mapLabelsForCoordinates, type BangaloreMapScope } from '@/data/bangaloreMicromarketMap';
import type { BangaloreLandingData } from '@/loaders/bangaloreLandingLoader';
import type { AdPreviewView } from './BangaloreAdPreview';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { normalizeHeadingCase, titleCase } from '@/lib/headingCase';
import { adImageSources, FEATURED_IMAGE_SIZES, SERVICE_IMAGE_SIZES } from '@/lib/adImageSources';
import { AD_CALLBACK_NOTE, AD_CALLBACK_NOTE_COMPACT, marketText, type MicromarketAdPage, type MicromarketLandingData } from '@/data/micromarketAdPages';
import { BANGALORE_FEATURED_LISTINGS } from '@/data/bangaloreAvailableWarehouses';
import { ORG_ID, SITE_URL } from '@/config/config';
import '@/components/WarehouseCard.css';
import './BangaloreLanding.css';

const SERVICE_ICONS = { 'find-warehouse': Search, 'build-to-suit': Warehouse, 'list-space': Truck, 'transaction-management': Handshake };
const AUDIENCE_ICONS = { owners: Warehouse, '3pls': Truck, companies: Building2 };
const AUDIENCE_INTENTS = { owners: ['list-warehouse'], '3pls': ['find-space', 'fill-spare-space'], companies: ['find-warehouse'] };

/** The /bangalore offer line: the city count rounded down, and the rent table's lowest and highest rents. */
function citySummary(listings: number | undefined, rows: AdPageContent['rentGuide']['rows']) {
  const rents = rows.flatMap(row => [...row.rent.matchAll(/₹\s*([\d,]+)/g)].map(match => Number(match[1].replace(/,/g, ''))));
  if (!listings || !rents.length) return null;
  const count = `${Math.floor(listings / 10) * 10}+`;
  const [min, max] = [Math.min(...rents), Math.max(...rents)];
  return {
    full: `${count} warehouses in Bangalore · ₹${min} to ₹${max} per sq ft · Options within 4 hours`,
    compact: `${count} warehouses · ₹${min}–₹${max}/sq ft · Options within 4 hours`,
  };
}

/** Content slots follow the supplied Google Ads wireframe, top to bottom. */
export default function BangaloreLanding({ content: savedContent = getBangaloreAdPage(), previewState = 'page', market }: {
  content?: AdPageContent; previewState?: AdPreviewView;
  market?: { page: MicromarketAdPage; data: MicromarketLandingData };
} = {}) {
  // Micromarket content already normalizes the shared headings, then applies
  // the approved local copy (including its authored heading capitalization).
  const copy = market ? savedContent.copy : normalizeHeadingCase(savedContent.copy);
  const content = { ...savedContent, copy };
  // Compact the standard local map title; authored CMS alternatives stay intact.
  const mobileMapHeading = market && copy.locationsHeading === `Explore Spaces in & Around ${market.page.name.replace(' and ', ' & ')}`
    ? `Explore ${copy.mapLabel} & Nearby` : undefined;
  const cityFeatured = BANGALORE_FEATURED_LISTINGS[0];
  const featuredImage = adImageSources(market ? market.data.featured[0]?.image : content.images[`featured-${cityFeatured.id}`]?.url ?? cityFeatured.image, FEATURED_IMAGE_SIZES);
  const services = content.services.map(item => ({ ...item, slug: item.id, icon: SERVICE_ICONS[item.id], description: item.body, mobileCopy: { title: item.mobileTitle, body: item.mobileBody } }));
  const audiences = content.audiences.map(item => ({ ...item, slug: item.id, description: item.body, icon: AUDIENCE_ICONS[item.id],
    actions: [item.primaryCta, item.secondaryCta].filter(Boolean).map((label, index) => ({ label, intent: AUDIENCE_INTENTS[item.id][index] })),
  }));
  const data = useLoaderData() as BangaloreLandingData | null;
  const heroSummary = market
    ? { full: marketText(market.page.heroSummary, market.data), compact: market.page.heroSummaryCompact && marketText(market.page.heroSummaryCompact, market.data) }
    : citySummary(data?.stats.listings, content.rentGuide.rows);
  const cityListings = (slug?: string) => slug
    ? data?.cityOverview?.micromarkets?.find(item => item.slug === slug)?.listings
      ?? MICROMARKETS.find(item => item.citySlug === 'bengaluru' && item.slug === slug)?.count
      ?? null
    : null;
  const mapAreas = market ? market.page.mapLocations : BANGALORE_MAP_AREAS;
  const locations = mapAreas.map(location => ({
    ...location,
    image: !location.imageSlot && market?.data.marketImages?.[location.slug] ? { ...market.data.marketImages[location.slug], alt: `Warehouse in ${location.canonical}`, width: 800, height: 450 } : location.image,
    caption: market?.page.mapBylines[location.slug] ? marketText(market.page.mapBylines[location.slug], market.data) : location.caption,
    // Micromarket pages take their card sub-lines from the CMS bylines above.
    byline: market ? undefined : location.byline,
    label: market?.page.map?.coordinates?.[location.slug]
      ? mapLabelsForCoordinates(market.page.map.coordinates[location.slug], market.page.map.views)
      : location.label,
    count: market ? market.data.marketCounts[location.countSlug ?? location.slug] ?? null : cityListings(location.countSlug),
    // The city's phone cards run by listings, most first; grouped areas rank by their main tag.
    rank: market ? undefined : cityListings(location.countSlug ?? location.rankSlug) ?? 0,
  }));
  const [mapScope, setMapScope] = useState<BangaloreMapScope>(market?.page.mapScope ?? 'belts');
  const [contactContext, setContactContext] = useState<AnalyticsParams | null>(previewState === 'contact' ? { source: 'cms-preview' } : null);
  const contactTrigger = useRef<HTMLButtonElement | null>(null);
  const source = market ? market.page.citySlug === 'hosur' ? 'hosur-landing' : `bangalore-${market.page.slug}-landing` : 'bangalore-landing';

  function openContact(trigger: HTMLButtonElement, context: AnalyticsParams) {
    contactTrigger.current = trigger;
    const enquiry = { city: market?.page.city ?? 'Bengaluru', state: market?.page.state ?? 'Karnataka', market_slug: market?.page.slug ?? 'bengaluru', ...context,
      ...(market ? { source: `${source}-${context.warehouse_id ?? context.content_id ?? context.market_slug ?? 'contact'}` } : {}),
    };
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
    <div className="bangalore-landing" data-micromarket={market?.page.slug}>
      <PageHead
        title={copy.seoTitle}
        description={copy.metaDescription}
        path={market?.page.path ?? '/bangalore'}
        noindex
      >
        {featuredImage.src && <link rel="preload" as="image" href={featuredImage.src} imageSrcSet={featuredImage.srcSet} imageSizes={featuredImage.sizes} media="(min-width: 1024px)" fetchPriority="high" />}
        {market && <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Organization', '@id': ORG_ID,
          name: 'WareOnGo', legalName: 'Neuroware Technologies Private Limited', url: SITE_URL,
          telephone: '+91-74001-84225', logo: `${SITE_URL}/logo_transparent.webp`,
        })}</script>}
      </PageHead>

      <Navbar contactDialogClassName="bangalore-landing-dialog" contactPage={market ? {
        source, description: copy.contactDescription, success: copy.contactSuccess,
        analytics: { market_slug: market.page.slug, city: market.page.city, state: market.page.state },
      } : undefined} />

      <main className="bangalore-landing__main" aria-labelledby="bangalore-title">
        <section className="bangalore-landing__hero bangalore-landing__container" aria-labelledby="bangalore-title">
          <div className="bangalore-landing__hero-copy">
            <h1 id="bangalore-title" className="bangalore-landing__headline">{copy.heroHeading} <span>{copy.heroAccent}</span></h1>
            {heroSummary && <p className="bangalore-landing__hero-summary" data-compact={heroSummary.compact ? true : undefined}>
              <span className="bangalore-landing__note-full">{heroSummary.full}</span>
              {heroSummary.compact && <span className="bangalore-landing__note-compact">{heroSummary.compact}</span>}
            </p>}
          </div>
          <BangaloreEnquiryForm copy={copy} previewSubmitted={previewState === 'hero-success'} marketSlug={market?.page.slug} source={source}
            callbackNote={market?.page.callbackNote ?? AD_CALLBACK_NOTE} callbackNoteCompact={market?.page.callbackNoteCompact ?? AD_CALLBACK_NOTE_COMPACT} />
          <BangaloreFeaturedListings content={content} onContact={openContact} listings={market?.data.featured} marketSlug={market?.page.slug} />
          <section className="bangalore-landing__trust" aria-labelledby="bangalore-trust-title">
            <h2 id="bangalore-trust-title" className="bangalore-landing__trust-title">{market ? 'Trusted by 200+ Companies Across India' : 'Trusted by 200+ Companies across India'}</h2>
            <TrustedBySection />
          </section>
        </section>

        <BangaloreBenefits content={content} />

        <BangaloreAvailableListings content={content} onContact={openContact} totalListings={market ? market.data.listingCount : data?.stats.listings} inventory={market?.data.listings} marketSlug={market?.page.slug} />

        <BangaloreMicromarkets content={content} locations={locations} onContact={openContact} scope={mapScope} onScopeChange={setMapScope} showScopeToggle={!market} mapViews={market?.page.map?.views} mapAlt={market?.page.map?.alt} mapCredit={market?.page.map?.credit} mobileHeading={mobileMapHeading} />

        <BangaloreAreaGuide scope={mapScope} content={content} cards={market?.page.areaCards.map(card => ({ ...card, body: marketText(card.body, market.data) }))} />

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
              <img {...adImageSources(content.images.services.url, SERVICE_IMAGE_SIZES)} alt={content.images.services.alt} width={content.images.services.width} height={content.images.services.height} loading="lazy" decoding="async" />
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
      <AdFooter />
      {market && <a className="bangalore-landing__whatsapp" href={`https://wa.me/917400184225?text=${encodeURIComponent(market.page.whatsappMessage)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
        onClick={() => trackEvent('contact_click', { placement: 'micromarket_whatsapp', contact_method: 'whatsapp', contact_target: 'sales_whatsapp', market_slug: market.page.slug, label: market.page.name, city: market.page.city, state: market.page.state })}>
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z" /></svg>
      </a>}
      <ContactFormDialog
        className="bangalore-landing-dialog"
        open={contactContext !== null}
        onOpenChange={open => { if (!open) setContactContext(null); }}
        title={copy.contactHeading}
        description={copy.contactDescription}
        successMessage={copy.contactSuccess}
        source={contactContext?.source || source}
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
