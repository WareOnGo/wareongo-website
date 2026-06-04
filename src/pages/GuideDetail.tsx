import { Link, Navigate, useParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getGuideBySlug, guides, type GuideBlock } from '@/data/guides';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';

// Simple prose renderer for the structured guide blocks. Deliberately plain —
// these pages exist to be read (by people and by AI engines), not to dazzle.
const Block = ({ block }: { block: GuideBlock }) => {
  switch (block.kind) {
    case 'h2':
      return (
        <h2 className="text-xl sm:text-2xl font-bold text-wareongo-blue mt-10 mb-3">{block.text}</h2>
      );
    case 'h3':
      return (
        <h3 className="text-lg sm:text-xl font-semibold text-wareongo-charcoal mt-6 mb-2">{block.text}</h3>
      );
    case 'p':
      return <p className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed mb-4">{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="overflow-x-auto mb-6 -mx-1 px-1">
          <table className="w-full text-left text-[13px] sm:text-sm border border-wareongo-blue/15 rounded-lg">
            <thead>
              <tr className="bg-wareongo-blue/5">
                {block.table.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-semibold text-wareongo-charcoal border-b border-wareongo-blue/15">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? 'bg-wareongo-blue/[0.02]' : ''}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 align-top text-wareongo-slate border-b border-wareongo-blue/10">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
};

const GuideDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const path = `/guides/${guide.slug}`;
  const relatedGuides = guide.related
    .map((s) => guides.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `${SITE_URL}${path}`,
    dateModified: guide.updated,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  // Answers are fully visible on the page (no accordion), satisfying Google's
  // requirement that FAQPage schema text matches rendered content.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead title={guide.seoTitle} description={guide.description} path={path} ogType="article">
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </PageHead>
      <Navbar />

      <main className="flex-grow" role="main" aria-labelledby="guide-title">
        <div className="section-container px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <article className="max-w-3xl mx-auto">
            <Breadcrumbs
              className="mb-4 sm:mb-6"
              items={
                [
                  { label: 'Home', path: '/' },
                  { label: 'Guides', path: '/guides' },
                  { label: guide.title },
                ] satisfies BreadcrumbItem[]
              }
            />

            <header className="mb-6">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
                Guide
              </span>
              <h1 id="guide-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-wareongo-blue leading-tight mb-3">
                {guide.title}
              </h1>
              <p className="text-xs text-wareongo-slate">
                Updated <time dateTime={guide.updated}>{guide.updated}</time> · WareOnGo
              </p>
            </header>

            {/* Direct-answer summary — the first thing answer engines extract */}
            <div className="border-l-4 border-wareongo-blue/40 bg-wareongo-blue/5 rounded-r-xl px-4 py-3 mb-8">
              <p className="text-sm font-semibold text-wareongo-charcoal mb-1">In short</p>
              <p className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{guide.summary}</p>
            </div>

            {guide.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}

            <section aria-labelledby="guide-faq" className="mt-10">
              <h2 id="guide-faq" className="text-xl sm:text-2xl font-bold text-wareongo-blue mb-4">
                Frequently asked questions
              </h2>
              <dl className="space-y-5">
                {guide.faqs.map(({ q, a }, i) => (
                  <div key={i}>
                    <dt className="font-semibold text-wareongo-charcoal mb-1">{q}</dt>
                    <dd className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {relatedGuides.length > 0 && (
              <section aria-label="Related guides" className="mt-10">
                <h2 className="text-base font-semibold text-wareongo-charcoal mb-3">Related guides</h2>
                <ul className="space-y-2">
                  {relatedGuides.map((g) => (
                    <li key={g.slug}>
                      <Link to={`/guides/${g.slug}`} className="text-wareongo-blue hover:underline">
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CTA — guides feed the transactional pages */}
            <div className="mt-10 border border-wareongo-blue/20 rounded-2xl p-6 text-center">
              <p className="text-wareongo-charcoal font-semibold mb-1">Looking for warehouse space?</p>
              <p className="text-sm text-wareongo-slate mb-4">
                Browse verified, physically inspected warehouses across India, or tell us your requirement and get a
                curated shortlist within 4 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/listings"
                  className="inline-flex items-center px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Browse listings
                </Link>
                <Link
                  to="/request-warehouse"
                  className="inline-flex items-center px-5 h-10 rounded-xl border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 transition-colors"
                >
                  Request a warehouse
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuideDetail;
