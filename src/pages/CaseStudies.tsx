import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { caseStudies } from '@/data/caseStudies';

const CaseStudies = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="Warehouse Case Studies | WareOnGo"
        description="Real warehouse deals across India — fire compliance, Vastu mandates, 3PL setups and more. See how WareOnGo handles complex briefs and delivers results."
        path="/casestudies"
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page hero */}
          <div className="text-center mb-8 md:mb-12">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
              Case Studies
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-3 leading-tight">
              Real deals. Real complexity.{' '}
              <span className="italic font-normal text-wareongo-slate">Real outcomes.</span>
            </h1>
            <p className="text-wareongo-slate text-sm sm:text-base md:text-lg max-w-xl mx-auto">
              Five warehouse requirements that demanded real expertise. Fire mandates, Vastu compliance, geopolitical delays, and one gate that needed demolishing.
            </p>
          </div>

          {/* Hero stats */}
          <div className="flex justify-center mb-10 md:mb-14">
            <div className="inline-flex flex-wrap border border-wareongo-blue rounded-2xl overflow-hidden">
              {[
                { n: '5', l: 'Closed deals' },
                { n: '5 cities', l: 'Across India' },
                { n: '~₹90L+', l: 'Saved across mandates' },
                { n: '15+', l: 'Follow-on mandates' },
              ].map((s, si) => (
                <div key={s.l} className={`px-5 sm:px-7 py-3.5 ${si < 3 ? 'border-r border-wareongo-blue' : ''}`}>
                  <div className="text-lg sm:text-xl font-bold text-wareongo-blue leading-none mb-1">
                    {s.n}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-wareongo-slate">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case study grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                to={`/casestudies/${cs.slug}`}
                className="group border border-wareongo-blue rounded-2xl bg-transparent hover:bg-wareongo-blue/5 transition-colors flex flex-col overflow-hidden"
              >
                {/* Top navy strip with number + badge */}
                <div className="bg-wareongo-blue px-5 sm:px-7 py-4 sm:py-5 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-wareongo-ivory leading-none">
                    {cs.number}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase text-white/60 leading-snug">
                    {cs.card.badge.replace(/^Deal \d+ · /, '')}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-7 flex flex-col gap-3 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-[22px] font-bold text-wareongo-blue leading-snug">
                    {cs.previewTitle}
                  </h2>
                  <p className="text-sm text-wareongo-slate leading-relaxed">
                    {cs.previewSub}
                  </p>

                  {/* Metric chips */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {cs.card.metrics.slice(0, 4).map((m, i) => (
                      <div
                        key={i}
                        className="border border-wareongo-blue/20 rounded-xl px-3 py-2"
                      >
                        <div className="text-[13px] font-bold text-wareongo-blue leading-tight">
                          {m.n}
                        </div>
                        <div className="text-[10.5px] text-wareongo-slate leading-snug mt-0.5">
                          {m.l}
                        </div>
                      </div>
                    ))}
                  </div>

                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-wareongo-blue">
                    Read the full case study
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
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
              Get My Shortlist in 4 Hours →
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

export default CaseStudies;
