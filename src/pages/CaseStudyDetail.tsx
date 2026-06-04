import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, LayoutGrid } from 'lucide-react';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryView from '@/components/CaseStudyStoryView';
import { caseStudies, getCaseStudyIndex, type Bullet } from '@/data/caseStudies';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';

const BulletList: React.FC<{ items: Bullet[] }> = ({ items }) => (
  <ul className="divide-y divide-wareongo-blue/10">
    {items.map((b, i) => (
      <li
        key={i}
        className="flex items-start gap-2.5 py-2 text-[13px] leading-relaxed text-wareongo-slate"
      >
        <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-wareongo-blue/30" />
        <span>
          {b.strong && <strong className="font-medium text-wareongo-charcoal">{b.strong}</strong>}
          {b.text}
        </span>
      </li>
    ))}
  </ul>
);

const CaseStudyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [view, setView] = useState<'card' | 'story'>('story');

  const idx = slug ? getCaseStudyIndex(slug) : -1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (idx === -1) {
    return <Navigate to="/casestudies" replace />;
  }

  const cs = caseStudies[idx];
  const c = cs.card;
  const prev = idx > 0 ? caseStudies[idx - 1] : null;
  const next = idx < caseStudies.length - 1 ? caseStudies[idx + 1] : null;

  const csTitle = `${cs.previewTitle.split('—')[0].trim()} | Warehouse Case Study | WareOnGo`;
  const csDescription = cs.previewSub || `Warehouse case study: ${cs.previewTitle}`;
  const csPath = `/casestudies/${cs.slug}`;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cs.previewTitle,
    description: csDescription,
    url: `${SITE_URL}${csPath}`,
    datePublished: cs.published,
    dateModified: cs.updated ?? cs.published,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title={csTitle}
        description={csDescription}
        path={csPath}
        ogType="article"
      >
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
      </PageHead>
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/casestudies"
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-wareongo-slate hover:text-wareongo-blue transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Case Studies
            </Link>
          </div>

          {/* View Toggle */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="inline-flex border border-wareongo-blue rounded-xl overflow-hidden bg-transparent w-fit">
              <button
                onClick={() => setView('story')}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  view === 'story'
                    ? 'bg-wareongo-blue text-wareongo-ivory'
                    : 'text-wareongo-slate hover:bg-wareongo-blue/5 hover:text-wareongo-blue'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Full Story
              </button>
              <button
                onClick={() => setView('card')}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  view === 'card'
                    ? 'bg-wareongo-blue text-wareongo-ivory'
                    : 'text-wareongo-slate hover:bg-wareongo-blue/5 hover:text-wareongo-blue'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Deal Card
              </button>
            </div>
          </div>

          {/* Tab nav across the 5 case studies */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {caseStudies.map((other, i) => (
              <Link
                key={other.slug}
                to={`/casestudies/${other.slug}`}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                  i === idx
                    ? 'bg-wareongo-blue text-white border-wareongo-blue'
                    : 'bg-transparent text-wareongo-slate border-wareongo-blue/20 hover:border-wareongo-blue/60 hover:text-wareongo-blue'
                }`}
              >
                {other.card.tabLabel}
              </Link>
            ))}
          </div>

          {/* Story view */}
          {view === 'story' && <StoryView story={cs.story} />}

          {/* Card view */}
          {view === 'card' && (
            <>
              {/* Header (navy) */}
              <div className="border border-wareongo-blue rounded-t-2xl bg-wareongo-blue overflow-hidden">
                <div className="px-6 sm:px-9 pt-7 sm:pt-9 pb-6">
                  <span className="inline-block text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase text-white/50 mb-3">
                    {c.badge}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-white leading-[1.15] tracking-tight mb-2">
                    {c.title}
                  </h1>
                  <p className="text-sm text-white/60 leading-relaxed max-w-3xl">{c.sub}</p>
                </div>

                {/* Metrics strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10">
                  {c.metrics.map((m, i) => (
                    <div
                      key={i}
                      className={`text-center px-5 py-4 ${
                        i < 3 ? 'border-r border-white/10' : ''
                      } ${i >= 2 ? 'border-t border-white/10 md:border-t-0' : ''}`}
                    >
                      <div className="text-xl sm:text-2xl font-bold text-wareongo-ivory leading-none mb-1">
                        {m.n}
                      </div>
                      <div className="text-[10.5px] text-white/60 leading-snug">{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body — 4 columns */}
              <div className="border border-wareongo-blue border-t-0 rounded-b-2xl bg-transparent grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'The Brief', content: <BulletList items={c.brief} /> },
                  { label: 'The Challenge', content: <BulletList items={c.challenge} /> },
                  { label: 'What WareOnGo Did', content: <BulletList items={c.did} /> },
                  {
                    label: 'Outcomes',
                    content: (
                      <div className="space-y-2">
                        {c.outcomes.map((o, i) => (
                          <div
                            key={i}
                            className="border border-wareongo-blue/30 rounded-xl px-3 py-2"
                          >
                            <div className="text-[15px] font-bold text-wareongo-blue leading-tight mb-0.5">
                              {o.n}
                            </div>
                            <div className="text-[11px] text-wareongo-slate leading-snug">{o.l}</div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ].map((col, i) => (
                  <div
                    key={col.label}
                    className={`px-5 sm:px-6 py-6 ${
                      i < 3 ? 'xl:border-r xl:border-wareongo-blue' : ''
                    } ${i === 0 ? 'md:border-r md:border-wareongo-blue' : ''} ${
                      i === 2 ? 'md:border-r md:border-wareongo-blue' : ''
                    }`}
                  >
                    <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-wareongo-charcoal block mb-4">
                      {col.label}
                    </span>
                    {col.content}
                  </div>
                ))}
              </div>

              {/* Footer attribution bar */}
              <div className="border border-wareongo-blue border-t-0 rounded-b-2xl px-6 sm:px-9 py-3.5 mt-[-1px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 flex-wrap bg-wareongo-blue/[0.03]">
                <span className="text-[12px] text-wareongo-slate">{c.attribution}</span>
                <span className="text-[12px] font-semibold text-wareongo-blue border border-wareongo-blue/30 px-3 py-1 rounded-full whitespace-nowrap">
                  {c.follow}
                </span>
              </div>
            </>
          )}

          {/* Prev / Next navigation */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prev ? (
              <Link
                to={`/casestudies/${prev.slug}`}
                className="group border border-wareongo-blue/30 rounded-2xl px-5 py-4 hover:bg-wareongo-blue/5 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-wareongo-slate mb-1.5">
                  <ArrowLeft className="w-3 h-3" /> Previous
                </div>
                <div className="text-sm font-semibold text-wareongo-blue leading-snug">
                  {prev.card.tabLabel}
                </div>
                <div className="text-[12px] text-wareongo-slate mt-1 line-clamp-2">
                  {prev.previewTitle}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/casestudies/${next.slug}`}
                className="group border border-wareongo-blue/30 rounded-2xl px-5 py-4 hover:bg-wareongo-blue/5 transition-colors sm:text-right"
              >
                <div className="flex items-center sm:justify-end gap-1.5 text-[10px] uppercase tracking-[0.18em] text-wareongo-slate mb-1.5">
                  Next <ArrowRight className="w-3 h-3" />
                </div>
                <div className="text-sm font-semibold text-wareongo-blue leading-snug">
                  {next.card.tabLabel}
                </div>
                <div className="text-[12px] text-wareongo-slate mt-1 line-clamp-2">
                  {next.previewTitle}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="container mx-auto px-4 max-w-6xl mt-16">
          <div className="border border-wareongo-blue rounded-2xl bg-wareongo-blue px-6 sm:px-10 py-10 sm:py-14 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-[1.15] mb-3">
              The hard ones are<br />
              <span className="italic font-normal text-white/50">our speciality.</span>
            </h2>
            <p className="text-sm sm:text-base text-white/45 leading-relaxed mb-7 max-w-md mx-auto">
              Fire compliance. Vastu mandates. Labour unions. Strait of Hormuz delays. Gates that needed demolishing. If your brief is complex — we're exactly who you need.
            </p>
            <a
              href="/request-warehouse"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-wareongo-ivory text-wareongo-blue text-sm font-semibold hover:bg-white transition-colors border border-wareongo-ivory"
            >
              Get My Shortlist in 6 Hours →
            </a>
            <div className="flex flex-wrap justify-center gap-5 mt-6">
              {['No broker spam', '100% legal checks', '₹2–4/sqft savings', 'Hard markets covered'].map(t => (
                <span key={t} className="text-[11.5px] text-white/35 flex items-center gap-1.5">
                  <span className="text-wareongo-ivory text-[10.5px]">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudyDetail;
