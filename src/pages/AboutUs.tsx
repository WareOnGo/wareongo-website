import React from 'react';
import { Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrustedBySection from '@/components/TrustedBySection';
import { SITE_URL, ORG_ID } from '@/config/config';
import { trackEvent } from '@/lib/analytics';

interface Founder {
  name: string;
  role: string;
  initials: string;
  /** Path to a headshot in /public — falls back to an initials avatar until provided. */
  headshot?: string;
  /** Personal LinkedIn URL — link renders only once provided. */
  linkedin?: string;
}

const FOUNDERS: Founder[] = [
  {
    name: 'Jayanth Chunduru',
    role: 'Co-founder & CEO',
    initials: 'JC',
    headshot: '/founders/jayanth-chunduru.webp',
    linkedin: 'https://www.linkedin.com/in/jayanth-chunduru-85150a191/',
  },
  {
    name: 'Dhaval Gupta',
    role: 'Co-founder & CPO',
    initials: 'DG',
    headshot: '/founders/dhaval-gupta.webp',
    linkedin: 'https://www.linkedin.com/in/dhaval-gupta-7b6009128/',
  },
];

const STATS = [
  { n: '1,500+', l: 'Verified warehouses' },
  { n: '90+', l: 'Cities across India' },
  { n: '10M+', l: 'sqft available' },
  // Kept consistent with the site-wide 4-hour shortlist claim (FAQ, How It
  // Works, llms.txt) — the spec's 36h figure predates that change.
  { n: '4h', l: 'Shortlist delivery' },
];

const AboutUs = () => {
  // Reference the canonical Organization node defined on the homepage (same @id)
  // so crawlers/AI engines merge this into one entity instead of treating it as
  // a second, competing Organization. Founder + foundingDate facts live here,
  // next to the on-page content that states them.
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'WareOnGo',
    legalName: 'Neuroware Technologies Private Limited',
    url: SITE_URL,
    logo: `${SITE_URL}/WOG_Logo_light.png`,
    description:
      'WareOnGo is an end-to-end warehousing platform — verified inventory across India, virtual tours, map-based search, and a dedicated advisory team handling negotiations, compliance and legal coordination.',
    foundingDate: '2024',
    founder: FOUNDERS.map((f) => ({
      '@type': 'Person',
      name: f.name,
      jobTitle: f.role,
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Shri Ram College of Commerce',
      },
      ...(f.headshot ? { image: `${SITE_URL}${f.headshot}` } : {}),
      ...(f.linkedin ? { sameAs: [f.linkedin] } : {}),
    })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ib-21, Ridgewood Estate, DLF Phase 4',
      addressLocality: 'Gurugram',
      addressRegion: 'Haryana',
      addressCountry: 'IN',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="About WareOnGo — India's Tech-Led Warehousing Advisory"
        description="Learn about WareOnGo — founded by SRCC graduates to fix India's broken warehousing market. 1,500+ verified warehouses across 90+ cities, 200+ companies served."
        path="/about-us"
      >
        <script type="application/ld+json">{JSON.stringify(organizationLd)}</script>
      </PageHead>
      <Navbar />

      <main className="flex-grow bg-wareongo-ivory" role="main" aria-labelledby="about-title">
        <div className="section-container">
          {/* Hero — centered, like the homepage section headers */}
          <header className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
              Company
            </span>
            <h1
              id="about-title"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-6 leading-tight"
            >
              About WareOnGo
            </h1>
            <p className="text-base sm:text-lg text-wareongo-slate leading-relaxed mb-4 text-left">
              India's warehousing market is worth over $35 billion and growing 15% year-on-year. Yet finding a
              warehouse still works the way it did fifty years ago: opaque broker networks, outdated listings,
              weeks of back-and-forth, and pricing that depends on who you know.
            </p>
            <p className="text-base sm:text-lg text-wareongo-slate leading-relaxed text-left">
              We started WareOnGo because we believe a warehouse decision — one of the most consequential
              operational choices a business makes — deserves better tools.
            </p>
          </header>

          <section aria-labelledby="trusted-by" className="mb-14 sm:mb-16">
            <h2
              id="trusted-by"
              className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate mb-5 font-normal"
            >
              Trusted by 200+ companies
            </h2>
            <TrustedBySection />
          </section>

          <section aria-labelledby="what-we-do" className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <h2 id="what-we-do" className="text-2xl sm:text-3xl font-bold text-wareongo-blue mb-5">
              What we do
            </h2>
            <p className="text-base text-wareongo-slate leading-relaxed mb-4 text-left">
              WareOnGo is an end-to-end warehousing platform built for businesses that need space fast and need
              to be sure of what they're getting.
            </p>
            <p className="text-base text-wareongo-slate leading-relaxed mb-4 text-left">
              We combine verified inventory across India with a seamless experience — virtual tours, map-based
              search and custom shortlists. Behind the platform sits a dedicated advisory team that handles
              negotiations, compliance, and legal coordination, so the entire journey from requirement to
              move-in happens through a single point of contact.
            </p>
            <p className="text-base text-wareongo-charcoal leading-relaxed text-left">
              In short: we make finding a warehouse feel less like a real estate transaction and more like
              booking a hotel.
            </p>
          </section>

          <section aria-labelledby="founders" className="text-center mb-14 sm:mb-16">
            <h2 id="founders" className="text-2xl sm:text-3xl font-bold text-wareongo-blue mb-3">
              Meet the founders
            </h2>
            <p className="text-base text-wareongo-slate leading-relaxed max-w-2xl mx-auto mb-8 text-left">
              WareOnGo was founded in 2024 by Jayanth Chunduru and Dhaval Gupta, both graduates of Shri Ram
              College of Commerce (SRCC) — one of India's top colleges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-8">
              {FOUNDERS.map((f) => (
                <a
                  key={f.name}
                  href={f.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${f.name}, ${f.role} — LinkedIn profile`}
                  onClick={() =>
                    trackEvent('nav_click', { label: `founder_${f.initials}`, destination: f.linkedin ?? '', position: 'about_page' })
                  }
                  className="flex flex-col items-center text-center cursor-pointer border border-wareongo-blue rounded-2xl p-6 bg-transparent hover:bg-wareongo-blue/5 transition-colors"
                >
                  {f.headshot ? (
                    <img
                      src={f.headshot}
                      alt={`${f.name}, ${f.role} of WareOnGo`}
                      width={384}
                      height={384}
                      className="w-full aspect-square rounded-xl border border-wareongo-blue object-cover mb-5"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-full aspect-square rounded-xl border border-wareongo-blue text-wareongo-blue flex items-center justify-center text-5xl font-semibold mb-5"
                    >
                      {f.initials}
                    </div>
                  )}
                  <p className="text-lg font-semibold text-wareongo-blue">{f.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-wareongo-slate mt-1.5">{f.role}</p>
                  <span className="inline-block text-sm text-wareongo-blue hover:underline mt-3">LinkedIn →</span>
                </a>
              ))}
            </div>

            <p className="text-base text-wareongo-slate leading-relaxed max-w-2xl mx-auto text-left">
              After working across consulting, supply-chain, and real estate, they noticed a pattern:
              businesses operated out of subpar warehousing not because they couldn't afford better, but
              because the market made it nearly impossible to find and evaluate real options at pace.
              WareOnGo is their answer to that problem.
            </p>
          </section>

          <section aria-labelledby="built-so-far" className="text-center mb-14 sm:mb-16">
            <h2
              id="built-so-far"
              className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate mb-6 font-normal"
            >
              What we've built so far
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {STATS.map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-wareongo-blue">{s.n}</p>
                  <p className="text-xs sm:text-sm text-wareongo-slate mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="lets-talk" className="max-w-3xl mx-auto">
            <div className="bg-wareongo-blue text-white rounded-2xl px-6 py-10 sm:px-10 sm:py-12 text-center relative overflow-hidden">
              {/* Subtle background decoration — matches RequestCTASection */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

              <div className="relative z-10">
                <h2 id="lets-talk" className="text-2xl sm:text-3xl font-bold mb-3">
                  Let's talk
                </h2>
                <p className="text-white/80 text-base leading-relaxed mb-8 max-w-xl mx-auto">
                  Whether you're looking for warehouse space, listing your property, or exploring partnerships —
                  we'd like to hear from you.
                </p>
                <Link
                  to="/request-warehouse"
                  onClick={() =>
                    trackEvent('cta_click', { label: 'Talk to Us', cta_location: 'about_page', destination: '/request-warehouse' })
                  }
                  className="inline-flex items-center justify-center bg-white text-wareongo-blue text-base font-bold px-8 py-3.5 rounded-xl hover:bg-wareongo-ivory hover:shadow-xl transition-all duration-300"
                >
                  Talk to Us
                </Link>
                <p className="text-sm text-white/70 mt-8">
                  <a
                    href="mailto:sales@wareongo.com"
                    onClick={() => trackEvent('contact_click', { contact_type: 'email', value: 'sales@wareongo.com', location: 'about_page' })}
                    className="hover:text-white transition-colors"
                  >
                    sales@wareongo.com
                  </a>
                  {' · '}
                  <a
                    href="tel:+918318825478"
                    onClick={() => trackEvent('contact_click', { contact_type: 'phone', value: '+918318825478', location: 'about_page' })}
                    className="hover:text-white transition-colors"
                  >
                    (+91) 83188-25478
                  </a>
                  {' · '}
                  <a
                    href="https://wa.me/918318825478"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('contact_click', { contact_type: 'whatsapp', value: '+918318825478', location: 'about_page' })}
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
