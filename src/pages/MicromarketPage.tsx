import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import WarehouseCard from '@/components/WarehouseCard';
import Pagination from '@/components/Pagination';
import SectionHeading from '@/components/micromarket/SectionHeading';
import MicromarketHero from '@/components/micromarket/MicromarketHero';
import EditorialImage from '@/components/micromarket/EditorialImage';
import PeerRentChart from '@/components/micromarket/PeerRentChart';
import InventoryBand from '@/components/micromarket/InventoryBand';
import SpecTable from '@/components/micromarket/SpecTable';
import { usePagedListings } from '@/hooks/usePagedListings';
import { CHIP, EYEBROW, PANEL, PROSE, SECTION_GAP, SECTION_RULE } from '@/components/micromarket/tokens';
import { blogs } from '@/data/blogs';
import { specRowsFor } from '@/lib/micromarketStats';
import { micromarketPath } from '@/services/micromarketsAPI';
import type { MicromarketPageData } from '@/loaders/locationLoader';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import { trackEvent } from '@/lib/analytics';
import { warehousePath } from '@/lib/warehouseSlug';

/**
 * The editorial micromarket page: /listings/city/{city}/{micromarket} when an
 * editor has published content for it in the CMS.
 *
 * Without that content the same route renders LocationListings' plain grid, and
 * that is the fallback this page never replaces — the grid is still here, at the
 * foot of the page, carrying every listing. What the editorial layout adds is
 * the prose and the computed context around it.
 *
 * Division of labour, enforced by the data model rather than by convention:
 * the CMS supplies prose, images and FAQs; every figure on the page comes from
 * `stats` and `peers`, which are computed from the live listings in the loader.
 * Copy written a year ago therefore cannot go stale against the inventory.
 */

type Listing = MicromarketPageData['warehouses'][number];

/**
 * Best first: listings with a photo ahead of those without, then largest first.
 *
 * The API returns newest-id-first, which puts photo-less listings wherever they
 * happen to fall. A row of placeholder cards at the top of the grid reads as a
 * broken page rather than as listings without photos, so page one earns the
 * stock that actually shows well.
 */
const orderForDisplay = (warehouses: Listing[]): Listing[] =>
  [...warehouses].sort((a, b) => {
    const photos = Number(Boolean(b.image)) - Number(Boolean(a.image));
    return photos !== 0 ? photos : (b.size ?? 0) - (a.size ?? 0);
  });

const MicromarketPage = ({ data }: { data: MicromarketPageData }) => {
  const navigate = useNavigate();
  const { content, stats, canonical, slug, parentCity, warehouses } = data;
  const peers = data.peers ?? [];

  const path = `/listings/city/${content.citySlug}/${slug}`;
  // A bare locality name is ambiguous ("Ernakulam" is also a city elsewhere in
  // the data), so anything outward-facing carries the parent city.
  const place =
    parentCity && parentCity.canonical !== canonical
      ? `${canonical}, ${parentCity.canonical}`
      : canonical;

  // Which sections have something to say. Prose slots are optional in the CMS,
  // and a heading over an empty section is worse than no section — same rule the
  // location content templates follow: never publish half-filled copy.
  const hasMarket = Boolean(content.marketProse);
  const hasRents = Boolean(content.rentsProse) || peers.length > 0;
  const hasSpec = Boolean(content.specProse) || specRowsFor(stats).length > 0;
  const hasFaqs = content.faqs.length > 0;

  // Numbered as rendered, so a page without rents copy reads 01, 02, 03 rather
  // than skipping a number and looking like something failed to load.
  // Render order, which is also numbering order. Inventory leads: someone who
  // landed here from a search for warehouses in this belt wants the warehouses,
  // and making them scroll past four sections of prose to reach the grid gets
  // the priority backwards. The prose then explains what they have just seen.
  const numbered = [
    'listings',
    ...(hasMarket ? ['market'] : []),
    ...(hasRents ? ['rents'] : []),
    ...(hasSpec ? ['specification'] : []),
    ...(hasFaqs ? ['faq'] : []),
  ];
  const indexOf = (id: string) => numbered.indexOf(id) + 1;

  const ordered = orderForDisplay(warehouses);
  // Six rows at every breakpoint, so the page is the same length whatever the
  // column count, plus the scroll-back-to-the-grid behaviour. Shared with the
  // plain grid in LocationListings — see the hook.
  const {
    shown,
    currentPage,
    totalPages: listingsPages,
    start: pageStart,
    anchorRef: listingsRef,
    goTo,
  } = usePagedListings(ordered);

  const siblings = peers.filter((p) => !p.isSelf);
  const relatedBlogs = content.relatedBlogs
    .map((s) => blogs.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const openListing = (warehouse: Listing) => {
    trackEvent('listing_open', { warehouse_id: warehouse.id, source: `micromarket_page_${slug}` });
    navigate(
      warehousePath({
        id: warehouse.id,
        size: warehouse.size,
        warehouseType: warehouse.warehouseType,
        city: warehouse.location.city,
      }),
    );
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: content.h1,
    alternateName: `Godowns for Rent in ${canonical}`,
    description: content.metaDescription,
    url: `${SITE_URL}${path}`,
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORG_ID },
    keywords: [
      `warehouse for rent in ${canonical}`,
      `godown for rent in ${canonical}`,
      ...(parentCity && parentCity.canonical !== canonical
        ? [`warehouse for rent in ${canonical} ${parentCity.canonical}`]
        : []),
    ].join(', '),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: warehouses.length,
      itemListElement: warehouses.slice(0, 50).map((w, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}${warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}`,
        name: `Warehouse ${w.id} — ${w.location.city}, ${w.location.state}`,
      })),
    },
  };

  // Answers stay in the DOM when the accordion is collapsed (see FAQAccordion),
  // so the prerendered HTML always matches this schema.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-wareongo-ivory">
      <PageHead
        title={content.seoTitle}
        description={content.metaDescription}
        path={path}
        image={content.heroImage?.url}
      >
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
        {hasFaqs && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </PageHead>
      <Navbar />

      <main className="flex-grow" role="main" aria-labelledby="micromarket-title">
        <div className="section-container px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <Breadcrumbs
            className="mb-4 sm:mb-6"
            items={
              [
                { label: 'Home', path: '/' },
                { label: 'Listings', path: '/listings' },
                ...(parentCity && parentCity.canonical !== canonical
                  ? [{ label: parentCity.canonical, path: `/listings/city/${parentCity.slug}` }]
                  : []),
                { label: canonical },
              ] satisfies BreadcrumbItem[]
            }
          />

          <section id="overview">
            <MicromarketHero content={content} stats={stats} place={place} onBrowse="#listings" />
          </section>

          <div>
            <section
              id="listings"
              ref={listingsRef as React.RefObject<HTMLElement>}
              className={`scroll-mt-24 ${SECTION_RULE}`}
            >
              <SectionHeading index={indexOf('listings')} eyebrow="Inventory">
                {content.inventoryHeading ?? `Warehouses for rent in ${canonical}`}
              </SectionHeading>

              <p className="mb-5 text-sm text-wareongo-slate">
                Showing {pageStart + 1}&ndash;{pageStart + shown.length} of {ordered.length}
                {listingsPages > 1 && ` · page ${currentPage} of ${listingsPages}`}
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((w, idx) => (
                  <WarehouseCard
                    key={w.id}
                    // Index is within the page, not the whole set: after paging,
                    // the top of this grid is what the reader is looking at, so
                    // its first row is the row worth loading eagerly.
                    index={idx}
                    id={w.id}
                    image={w.image}
                    images={w.images}
                    imageFallbacks={w.imageFallbacks}
                    address={w.address}
                    location={w.location}
                    size={w.size}
                    ceilingHeight={w.ceilingHeight}
                    price={w.price}
                    fireCompliance={w.fireCompliance}
                    features={w.features}
                    onClick={() => openListing(w)}
                  />
                ))}
              </div>

              <Pagination
                className="mt-8"
                currentPage={currentPage}
                totalPages={listingsPages}
                onChange={(next, direction) => {
                  trackEvent('micromarket_listings_paginate', {
                    micromarket: slug,
                    from_page: currentPage,
                    to_page: next,
                    direction,
                  });
                  // Back to the top of this section, not the top of the
                  // document: the grid sits well down a long editorial page, so
                  // scrolling to 0 would strand the reader in the hero.
                  goTo(next);
                }}
              />
            </section>
            {hasMarket && (
              <section id="market" className={SECTION_RULE}>
                <SectionHeading index={indexOf('market')} eyebrow="Market">
                  {content.marketHeading ?? `Warehouse space in ${canonical}: where the stock sits`}
                </SectionHeading>
                {/* Fixed figure width rather than a fraction. The prose caps its
                    own measure at max-w-2xl for readability, so a fractional
                    column just left a gap between where the text stopped and
                    where the figure began — and a 5:4 figure in it came out
                    482px tall against 192px of prose. At 22rem the figure's 4:3
                    lands near the paragraph's own height. */}
                <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-10">
                  <p className={`max-w-2xl ${PROSE}`}>{content.marketProse}</p>
                  {content.marketImage && <EditorialImage image={content.marketImage} />}
                </div>
              </section>
            )}

            {hasRents && (
              <section id="rents" className={SECTION_RULE}>
                <SectionHeading index={indexOf('rents')} eyebrow="Pricing">
                  {content.rentsHeading ?? `Warehouse rent in ${canonical}`}
                </SectionHeading>
                <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
                  {peers.length > 0 && <PeerRentChart peers={peers} />}
                  {content.rentsProse && (
                    <p className={`max-w-2xl ${PROSE}`}>
                      {content.rentsProse}
                    </p>
                  )}
                </div>
              </section>
            )}

            <div className={SECTION_GAP}>
              <InventoryBand stats={stats} heading="What you'll find here" />
            </div>

            {hasSpec && (
              <section id="specification" className={SECTION_RULE}>
                <SectionHeading index={indexOf('specification')} eyebrow="Specification">
                  {content.specHeading ?? `Typical specification in ${canonical}`}
                </SectionHeading>
                <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
                  <SpecTable stats={stats} />
                  {content.specProse && (
                    <p className={`max-w-2xl ${PROSE}`}>
                      {content.specProse}
                    </p>
                  )}
                </div>
              </section>
            )}


            {hasFaqs && (
              <section id="faq" className={SECTION_RULE}>
                <SectionHeading index={indexOf('faq')} eyebrow="FAQ">
                  Frequently asked questions
                </SectionHeading>
                <FAQAccordion items={content.faqs.map(({ q, a }) => ({ q, a }))} />
              </section>
            )}

            {/* Link block: siblings across, city up, editorial out. */}
            <section aria-label="Related pages" className={SECTION_RULE}>
              <dl className="space-y-5 text-sm">
                {siblings.length > 0 && (
                  <div className="sm:flex sm:gap-6">
                    <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                      Nearby markets
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {siblings.map((s) => (
                        <Link
                          key={`${s.citySlug}/${s.slug}`}
                          to={micromarketPath(s)}
                          className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-blue transition-colors hover:bg-wareongo-blue/5`}
                        >
                          {s.name}
                          <span className="text-xs tabular-nums text-wareongo-slate">₹{s.medianRent}</span>
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}

                {parentCity && (
                  <div className="sm:flex sm:gap-6">
                    <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                      All of {parentCity.canonical}
                    </dt>
                    <dd>
                      <Link
                        to={`/listings/city/${parentCity.slug}`}
                        className="text-wareongo-blue hover:underline"
                      >
                        Warehouse for rent in {parentCity.canonical} →
                      </Link>
                    </dd>
                  </div>
                )}

                {relatedBlogs.length > 0 && (
                  <div className="sm:flex sm:gap-6">
                    <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                      Editorial
                    </dt>
                    <dd className="space-y-1.5">
                      {relatedBlogs.map((b) => (
                        <Link
                          key={b.slug}
                          to={`/blogs/${b.slug}`}
                          className="block text-wareongo-blue hover:underline"
                        >
                          {b.title} →
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <div className={`${SECTION_GAP} ${PANEL} p-6 text-center`}>
              <p className="mb-1 font-semibold text-wareongo-charcoal">
                Looking for space in {canonical}?
              </p>
              <p className="mb-4 text-sm text-wareongo-slate">
                Tell us the size, the compliance you need and when you want to move in. You get a
                curated shortlist within 4 hours.
              </p>
              <Link
                to="/request-warehouse"
                className="inline-flex h-10 items-center rounded-xl bg-wareongo-blue px-5 text-sm font-medium text-white transition-colors hover:bg-wareongo-blue/90"
              >
                Request a warehouse
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MicromarketPage;
