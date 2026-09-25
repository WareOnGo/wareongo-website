import InlineText from '@/components/InlineText';
import { plainInlineText } from '@/lib/inline-format';
import { Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import WarehouseCard from '@/components/WarehouseCard';
import Pagination from '@/components/Pagination';
import SectionHeading from '@/components/micromarket/SectionHeading';
import MicromarketHero from '@/components/micromarket/MicromarketHero';
import EditorialImage, { EDITORIAL_HERO_SIZES } from '@/components/micromarket/EditorialImage';
import PeerRentChart from '@/components/micromarket/PeerRentChart';
import InventoryBand from '@/components/micromarket/InventoryBand';
import SpecTable from '@/components/micromarket/SpecTable';
import { CorridorPanel, RentBySize, SpecSizeComparison } from '@/components/city/CityPanels';
import { usePagedListings } from '@/hooks/usePagedListings';
import { CHIP, EYEBROW, PANEL, PROSE, SECTION_GAP, SECTION_RULE } from '@/components/micromarket/tokens';
import { blogSummaries as blogs } from '@/data/blogSummaries.generated';
import { specRowsFor } from '@/lib/micromarketStats';
import type { EditorialPageData } from '@/loaders/locationLoader';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import { trackEvent } from '@/lib/analytics';
import { useListingResults } from '@/hooks/useListingAnalytics';
import { warehousePath } from '@/lib/warehouseSlug';

/** Shared CMS wireframe for state, city and micromarket /overview pages. */

type Listing = EditorialPageData['warehouses'][number];

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

const EditorialLocationPage = ({ data }: { data: EditorialPageData }) => {
  const { content, stats, warehouses, editorial } = data;
  const peers = data.peers ?? [];
  const { name, path, place, scope } = editorial;
  const isCity = scope === 'city';
  const city = isCity ? data.cityOverview : undefined;
  const heroVariants = content.heroImage && data.imageVariants?.[content.heroImage.url];

  // Which sections have something to say. Prose slots are optional in the CMS,
  // and a heading over an empty section is worse than no section — same rule the
  // location content templates follow: never publish half-filled copy.
  const hasMarket = Boolean(content.marketProse);
  const hasCorridors = isCity && (Boolean(content.corridorProse) || Boolean(city?.corridors.length));
  const hasRents = Boolean(content.rentsProse) || peers.length > 0 || Boolean(city?.rentBySize.length);
  const hasSpec = Boolean(content.specProse) || specRowsFor(stats).length > 0;
  const hasCompliance = isCity && Boolean(content.complianceProse);
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
    ...(hasCorridors ? ['corridors'] : []),
    ...(hasRents ? ['rents'] : []),
    ...(hasSpec ? ['specification'] : []),
    ...(hasCompliance ? ['compliance'] : []),
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
    perPage,
    totalPages: listingsPages,
    start: pageStart,
    anchorRef: listingsRef,
    goTo,
    hrefForPage,
    hydrated,
  } = usePagedListings(ordered);

  const listId = `overview:${path}`;
  useListingResults({ list_id: listId, placement: 'overview_grid', market_slug: path.split('/').pop(),
    page: currentPage, page_size: perPage, result_count: shown.length, total_count: warehouses.length,
    result_status: shown.length ? 'success' : 'empty' }, hydrated);

  const siblings = city?.nearbyCities ?? peers.filter((p) => !p.isSelf);
  const relatedBlogs = content.relatedBlogs
    .map((s) => blogs.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: content.h1,
    alternateName: `Godowns for Rent in ${name}`,
    description: content.metaDescription,
    url: `${SITE_URL}${path}`,
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORG_ID },
    keywords: [
      `warehouse for rent in ${name}`,
      `godown for rent in ${name}`,
      // "warehouse in nelamangala bangalore" — the qualified phrasing people
      // search for a locality. `place` already carries the qualifier where one
      // is warranted, and equals the name where it is not.
      ...(place !== name ? [`warehouse for rent in ${place}`] : []),
    ].join(', '),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: warehouses.length,
      itemListElement: warehouses.slice(0, 50).map((w, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}${warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}`,
        name: `Warehouse ${w.id}, ${w.location.city}, ${w.location.state}`,
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
      acceptedAnswer: { '@type': 'Answer', text: plainInlineText(a) },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-wareongo-ivory font-sans">
      <PageHead
        title={content.seoTitle}
        description={content.metaDescription}
        path={path}
        image={content.heroImage?.url}
      >
        {content.heroImage && (
          <link
            rel="preload"
            as="image"
            media="(min-width: 1024px)"
            href={heroVariants?.at(-1)?.src ?? content.heroImage.url}
            imageSrcSet={heroVariants?.map(v => `${v.src} ${v.width}w`).join(', ')}
            imageSizes={EDITORIAL_HERO_SIZES}
            fetchPriority="high"
          />
        )}
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
        {hasFaqs && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </PageHead>
      <Navbar />

      <main className="flex-grow" role="main" aria-labelledby="editorial-title">
        <div className="section-container page-content px-4 pb-6 sm:px-6 sm:pb-10 lg:px-8">
          <Breadcrumbs
            className="mb-4 sm:mb-6"
            items={
              [
                { label: 'Home', path: '/' },
                { label: 'Listings', path: '/listings' },
                ...editorial.ancestors,
                { label: name },
              ] satisfies BreadcrumbItem[]
            }
          />

          <section id="overview">
            <MicromarketHero content={content} imageVariants={heroVariants} stats={stats} place={place} onBrowse={isCity ? undefined : '#listings'} />
          </section>

          <div>
            <section
              id="listings"
              ref={listingsRef as React.RefObject<HTMLElement>}
              className={`scroll-mt-24 ${SECTION_RULE}`}
            >
              <SectionHeading index={indexOf('listings')} eyebrow="Inventory">
                {content.inventoryHeading ?? `Warehouses for rent in ${name}`}
              </SectionHeading>

              <p className="mb-5 text-sm text-wareongo-slate">
                Showing {pageStart + 1}&ndash;{pageStart + shown.length} of {ordered.length}
                {listingsPages > 1 && ` · page ${currentPage} of ${listingsPages}`}
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((w, idx) => (
                  <WarehouseCard
                    key={w.id}
                    // The initial grid is below the hero. Paging scrolls it into
                    // view, so prioritize its first photo on subsequent pages.
                    index={idx}
                    priority={currentPage > 1 && idx === 0}
                    analyticsContext={{ list_id: listId, placement: 'overview_grid', market_slug: path.split('/').pop(), page: currentPage, page_size: perPage, list_position: pageStart + idx + 1 }}
                    id={w.id}
                    image={w.image}
                    images={w.images}
                    coverImage={data.coverImages?.[w.images[0]]}
                    imageFallbacks={w.imageFallbacks}
                    address={w.address}
                    location={w.location}
                    size={w.size}
                    ceilingHeight={w.ceilingHeight}
                    price={w.price}
                    fireCompliance={w.fireCompliance}
                    numberOfDocks={w.numberOfDocks}
                    warehouseType={w.warehouseType}
                    micromarket={w.micromarket}
                    postalCode={w.postalCode}
                    updatedAt={w.updatedAt}
                    features={w.features}
                    href={warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}
                  />
                ))}
              </div>

              <Pagination
                hrefForPage={hrefForPage}
                className="mt-8"
                currentPage={currentPage}
                totalPages={listingsPages}
                onChange={(next, direction) => {
                  if (next === currentPage) return;
                  trackEvent('listings_paginate', {
                    list_id: listId, market_slug: path.split('/').pop(), page_size: perPage,
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
                  {content.marketHeading ?? `Warehouse space in ${name}: where the stock sits`}
                </SectionHeading>
                {/* Fixed figure width rather than a fraction. The prose caps its
                    own measure at max-w-2xl for readability, so a fractional
                    column just left a gap between where the text stopped and
                    where the figure began — and a 5:4 figure in it came out
                    482px tall against 192px of prose. At 22rem the figure's 4:3
                    lands near the paragraph's own height. */}
                <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-10">
                  <p className={`max-w-2xl ${PROSE}`}><InlineText text={content.marketProse ?? ''} /></p>
                  {content.marketImage && <EditorialImage image={content.marketImage} variants={data.imageVariants?.[content.marketImage.url]} />}
                </div>
              </section>
            )}

            {hasCorridors && (
              <section id="corridors" className={SECTION_RULE}>
                <SectionHeading index={indexOf('corridors')} eyebrow="Locations">
                  {content.corridorHeading ?? `Where to rent in ${name}`}
                </SectionHeading>
                {city && city.corridors.length > 0 && <CorridorPanel data={city} />}
                {content.corridorProse && (
                  <p className={`mt-6 ${PROSE}`}><InlineText text={content.corridorProse} /></p>
                )}
              </section>
            )}

            {hasRents && (
              <section id="rents" className={SECTION_RULE}>
                <SectionHeading index={indexOf('rents')} eyebrow="Pricing">
                  {content.rentsHeading ?? `Warehouse rent in ${name}`}
                </SectionHeading>
                <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
                  {peers.length > 0 && <PeerRentChart peers={peers} />}
                  {content.rentsProse && (
                    <p className={`max-w-2xl ${PROSE}`}>
                      <InlineText text={content.rentsProse} />
                    </p>
                  )}
                </div>
                {city && city.rentBySize.length > 0 && <div className="mt-6"><RentBySize bands={city.rentBySize} /></div>}
              </section>
            )}

            <div className={SECTION_GAP}>
              <InventoryBand stats={stats} heading="What you'll find here" excludedLabel={city ? 'land, build-to-suit or under construction' : undefined} />
            </div>

            {hasSpec && (
              <section id="specification" className={SECTION_RULE}>
                <SectionHeading index={indexOf('specification')} eyebrow="Specification">
                  {content.specHeading ?? `Typical specification in ${name}`}
                </SectionHeading>
                <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
                  <SpecTable stats={stats} />
                  {content.specProse && (
                    <p className={`max-w-2xl ${PROSE}`}>
                      <InlineText text={content.specProse} />
                    </p>
                  )}
                </div>
                {city && <>
                  <SpecSizeComparison cohorts={city.specsBySize} />
                  <p className="mt-4 text-xs leading-relaxed text-wareongo-slate">Based on {stats.measured} existing warehouse listings. Each measure uses listings that record it; construction and flooring shares use recorded, recognised types.</p>
                </>}
              </section>
            )}

            {hasCompliance && (
              <section id="compliance" className={SECTION_RULE}>
                <SectionHeading index={indexOf('compliance')} eyebrow="Compliance">
                  {content.complianceHeading ?? `Warehouse compliance in ${name}`}
                </SectionHeading>
                <p className={PROSE}><InlineText text={content.complianceProse ?? ''} /></p>
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
                <div className="sm:flex sm:gap-6">
                  <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>All listings</dt>
                  <dd><Link to={editorial.listingPath} className="text-wareongo-blue hover:underline">
                    Browse all warehouses in {name} →
                  </Link></dd>
                </div>
                {city && city.micromarkets.length > 0 && (
                  <div className="sm:flex sm:gap-6">
                    <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>Micromarkets</dt>
                    <dd className="flex flex-wrap gap-2">
                      {city.micromarkets.map((market) => market.path ? (
                        <Link key={market.slug} to={market.path} className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-blue hover:bg-wareongo-blue/5`}>
                          {market.name}<span className="text-xs tabular-nums text-wareongo-slate">{market.listings}</span>
                        </Link>
                      ) : (
                        <span key={market.slug} className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-slate`}>
                          {market.name}<span className="text-xs tabular-nums">{market.listings}</span>
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {siblings.length > 0 && (
                  <div className="sm:flex sm:gap-6">
                    <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                      {city?.nearbyLabel ?? (scope === 'state' ? 'Other states' : 'Nearby markets')}
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {siblings.map((s) => (
                        <Link
                          key={s.path}
                          to={s.path}
                          className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-blue transition-colors hover:bg-wareongo-blue/5`}
                        >
                          {s.name}
                          {'medianRent' in s && typeof s.medianRent === 'number' && <span className="text-xs tabular-nums text-wareongo-slate">₹{s.medianRent}</span>}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}

                {editorial.up && (
                  <div className="sm:flex sm:gap-6">
                    <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                      {editorial.up.label}
                    </dt>
                    <dd>
                      <Link to={editorial.up.path} className="text-wareongo-blue hover:underline">
                        {editorial.up.linkLabel}
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
                Looking for space in {name}?
              </p>
              <p className="mb-4 text-sm text-wareongo-slate">
                Tell us the size, the compliance you need and when you want to move in. You get a
                curated shortlist within 4 hours.
              </p>
              <Link
                data-analytics-placement="overview_footer" to="/request-warehouse"
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

export default EditorialLocationPage;
