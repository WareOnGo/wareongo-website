import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryView from '@/components/CaseStudyStoryView';
import { stories } from '@/pages/caseStudyStories';
import { LayoutGrid, BookOpen } from 'lucide-react';

type Bullet = { strong?: string; text: string };
type Outcome = { n: string; l: string };
type Metric = { n: string; l: string };

type CaseStudy = {
  badge: string;
  title: React.ReactNode;
  sub: string;
  metrics: Metric[];
  brief: Bullet[];
  challenge: Bullet[];
  did: Bullet[];
  outcomes: Outcome[];
  attribution: string;
  follow: string;
  tabLabel: string;
};

const cases: CaseStudy[] = [
  {
    tabLabel: '01 · Kochi',
    badge: 'Deal 01 · 3PL · Third-Party Logistics · Kerala',
    title: (
      <>Kochi, Kerala — India's hardest<br />warehouse market. Cracked.</>
    ),
    sub: '3PL Company · Electrical & Appliances Logistics · June 2024 → November 2024 operationally running handover · 5 follow-on deals secured',
    metrics: [
      { n: '₹22/sqft', l: 'vs ₹24.5–25 market rate' },
      { n: '8 visits', l: 'WareOnGo managed every stakeholder' },
      { n: '5 months', l: 'June inquiry to full possession' },
      { n: '5+ deals', l: 'Follow-on mandates from this one deal' },
    ],
    brief: [
      { strong: 'Client:', text: " 3PL for one of India's largest conglomerates" },
      { strong: 'Cargo:', text: ' Electrical goods & appliances' },
      { strong: 'Budget:', text: ' ₹21–22/sqft — hard limit' },
      { strong: 'Possession:', text: ' November 2024' },
      { strong: 'Market reality:', text: ' Every owner at ₹24.5–25/sqft minimum' },
      { strong: 'Location:', text: ' Kochi, Kerala' },
    ],
    challenge: [
      { text: "Zero ready-to-move warehouses at ₹21–22 — budget didn't exist in market" },
      { text: 'No owner willing to hold for a June booking with November possession' },
      { strong: 'Had to pivot to under-construction warehouses', text: ' — track all approvals' },
      { strong: 'Kerala labour union', text: ' — critical operational blocker before handover' },
      { text: 'Three stakeholder visits: Ops Manager, Sales Manager, VP — all managed separately' },
    ],
    did: [
      { text: 'Identified under-construction warehouse at ₹22 budget' },
      { strong: 'Tracked Fire NOC, building approvals, GST, building number', text: ' in real time' },
      { strong: 'Conducted 8 site visits', text: ' — managed every stakeholder independently' },
      { strong: 'Resolved Kerala labour union issue', text: ' — onboarded contractors' },
      { strong: 'Closed at ₹22/sqft', text: ' — handed over operationally running' },
    ],
    outcomes: [
      { n: '₹2.5–3/sqft', l: 'Monthly saving vs. market' },
      { n: 'Zero delays', l: 'All approvals cleared before handover' },
      { n: 'Operational Day 1', l: 'Labour sorted, warehouse running' },
      { n: '5+ mandates', l: 'VP + CEO gave follow-on deals immediately' },
    ],
    attribution: 'VP, End User · CEO, 3PL Company · Electrical & Appliances Logistics, Kochi, Kerala',
    follow: '→ 5 follow-on mandates secured',
  },
  {
    tabLabel: '02 · Hyderabad · Fire NOC',
    badge: 'Deal 02 · Manufacturer · Fire Compliance Mandate · Telangana',
    title: (
      <>Devarayamjal, Hyderabad — Fire-compliant<br />warehouse. 2 months of failure. Then us.</>
    ),
    sub: 'Consolidating 35,000 sqft (2 warehouses) into 50,000 sqft fire-compliant · 22 properties screened · 3 new city mandates followed',
    metrics: [
      { n: '₹18.5/sqft', l: 'vs ₹21 asking rate for compliant' },
      { n: '50,000 sqft', l: 'fire-compliant on main road' },
      { n: '22 props', l: 'screened before shortlisting 6' },
      { n: '45 days', l: 'rent-free period negotiated' },
    ],
    brief: [
      { strong: 'Client:', text: ' Manufacturer consolidating 2 warehouses' },
      { strong: 'Current:', text: ' 20,000 + 15,000 sqft = 35,000 sqft' },
      { strong: 'Need:', text: ' 50,000–60,000 sqft · fire-compliant · single location' },
      { strong: 'Mandate:', text: ' Fire NOC — legal compliance directive post Bhiwandi fire' },
      { strong: 'Pre-WareOnGo:', text: ' 2+ months, zero compliant options found' },
    ],
    challenge: [
      { strong: 'Fire NOC made legally mandatory', text: ' — no exceptions' },
      { strong: '2+ months of independent search', text: ' — zero compliant options' },
      { text: 'Fire-compliant warehouses commanding ₹21/sqft — above range' },
      { text: 'Needed 50,000+ sqft on main road — very limited inventory' },
      { strong: 'Fire hydrant installation, inspector coordination', text: ' — entire process had to be owned' },
    ],
    did: [
      { strong: 'Legal due diligence on 22 properties', text: ' (50,000–60,000 sqft)' },
      { strong: 'Shortlisted 6 fire-NOC eligible', text: ' properties' },
      { strong: 'Spoke directly with fire department + fire inspector', text: '' },
      { text: 'Installed fire hydrants — secured inspector sign-off' },
      { strong: 'Client legal team fully approved', text: ' — closed ₹18.5/sqft' },
      { strong: 'Negotiated 45 days rent-free', text: ' for relocation + epoxy flooring' },
    ],
    outcomes: [
      { n: '₹2.5/sqft', l: 'Monthly saving = ₹1,25,000/month on 50,000 sqft' },
      { n: '~₹90L', l: 'Savings over 5-year lease horizon' },
      { n: '100% compliant', l: 'Legal team signed off — zero risk' },
      { n: '3 mandates', l: 'Chennai · Bangalore · Delhi followed immediately' },
    ],
    attribution: 'Legal Compliance Head + Operations Director · Manufacturer · Devarayamjal, Hyderabad',
    follow: '→ Chennai · Bangalore · Delhi mandates followed',
  },
  {
    tabLabel: '03 · Devanahalli',
    badge: 'Deal 03 · Food Manufacturer · FSSAI + Vastu + BTS · Bangalore North',
    title: (
      <>Devanahalli, Bangalore — Vastu. 250KW.<br />FSSAI. Hormuz.</>
    ),
    sub: 'Premium food manufacturer · 3–5 star hotels across Karnataka · July 2024 → January 2026 · Factory runs 18 hours/day at full capacity',
    metrics: [
      { n: '₹27/sqft', l: 'incl. 250KW power (worth ₹75L–1Cr)' },
      { n: '6 months', l: 'on-ground scouting before signing' },
      { n: '3.5 months', l: 'total rent-free secured' },
      { n: '18 hrs/day', l: 'factory at full operating capacity' },
    ],
    brief: [
      { strong: 'Client:', text: ' Premium food manufacturer — organic produce, noodles' },
      { strong: 'Customers:', text: ' All 3, 4 & 5-star hotels in Karnataka' },
      { strong: 'Vastu mandatory:', text: ' East-facing entry — non-negotiable' },
      { strong: 'Power:', text: ' 250KW required (market standard: 100–200KW)' },
      { strong: 'Compliance:', text: ' FSSAI certified food facility' },
      { strong: 'No internal team:', text: ' WareOnGo managed everything' },
    ],
    challenge: [
      { strong: 'Visited 6 warehouses', text: ' — none had east-facing entry' },
      { strong: '250KW adds ₹75L–1Cr infrastructure', text: ' — owners refused' },
      { strong: 'Spoke to hundreds of owners on-ground', text: ' over months' },
      { text: 'FSSAI chemical treatment — unfamiliar to most Devanahalli owners' },
      { text: 'Full BTS: docks, insulation, barbed wire, flooring, treatment' },
      { strong: 'Machinery stuck in Strait of Hormuz', text: ' — Iran-Israel conflict' },
    ],
    did: [
      { text: 'Months on-ground — found east-facing (Vastu-compliant) property' },
      { strong: 'Negotiated 250KW power included', text: ' at ₹27/sqft' },
      { text: 'Constructed docks, fitted insulation, installed barbed wire' },
      { strong: 'Floor polish + FSSAI chemical treatment', text: ' completed' },
      { strong: 'Secured 3 months rent-free', text: ' at signing (Jan–Mar 2026)' },
      { strong: 'Negotiated +45 days extension', text: ' for Hormuz machinery delay' },
    ],
    outcomes: [
      { n: '₹75L–1Cr', l: 'Power infrastructure value secured in rent' },
      { n: '3.5 months', l: 'Total rent-free (3 mo + 15 days Hormuz)' },
      { n: 'FSSAI Day 1', l: '100% food compliance from first day' },
      { n: 'All jobs', l: 'Client handed all future requirements to WareOnGo' },
    ],
    attribution: 'Managing Director · Premium Food Manufacturer · Devanahalli, Bangalore',
    follow: '→ All future requirements handed to WareOnGo',
  },
  {
    tabLabel: '04 · Hyderabad · Auto',
    badge: 'Deal 04 · Automobile Manufacturer · Logistics Warehouse · Hyderabad',
    title: (
      <>Hyderabad — India's largest two-wheeler<br />brand mandated the big 4. Then chose us.</>
    ),
    sub: "Automobile Manufacturer · 55,000–62,500 sqft · Nizamabad Highway · July 2025 · Now an approved vendor alongside India's 4 largest CRE firms",
    metrics: [
      { n: '₹17–18/sqft', l: 'within budget — all competitors missed' },
      { n: '25 → 1', l: 'options in market vs our shortlist' },
      { n: '100 metres', l: 'from highway vs 12 km for others' },
      { n: '1 acre', l: 'truck parking — others refused' },
    ],
    brief: [
      { strong: 'Client:', text: " India's largest two-wheeler motorcycle manufacturer" },
      { strong: 'Size:', text: ' 55,000–62,500 sqft carpet area' },
      { strong: 'Budget:', text: ' ₹17–18/sqft' },
      { strong: 'Location mandate:', text: ' Nizamabad Highway — non-negotiable' },
      { strong: 'Additional:', text: ' 1-acre truck parking area required' },
      { strong: 'Competition:', text: ' All 4 largest CRE firms active simultaneously' },
    ],
    challenge: [
      { strong: '25 options', text: ' in market — competitors showed all 25' },
      { text: 'Most warehouses 12+ km inside — unsuitable for 60-ft containers' },
      { strong: '60-ft container + nose = 70–72 ft turning radius', text: ' needed' },
      { text: 'High-tension cables, wire heights, turning radius all to verify' },
      { strong: '1-acre parking area', text: ' — no competitor willing to negotiate this' },
      { strong: '3 months scouting + 1.5 months negotiation', text: '' },
    ],
    did: [
      { strong: 'Eliminated options without highway access', text: ' — 60-ft test applied first' },
      { strong: "Eliminated where landlords wouldn't match rental/deposit terms", text: '' },
      { strong: 'Eliminated where 60-ft containers cannot move freely', text: ' inside' },
      { strong: 'Identified Yellampet — 100 metres', text: ' from Nizamabad Highway' },
      { text: 'Verified turning radius, cable clearance, height restrictions' },
      { strong: 'Negotiated 1-acre parking', text: ' with nearby landlord — others refused' },
    ],
    outcomes: [
      { n: 'Only 1 fit', l: '100m from highway · zero container issues' },
      { n: '1 acre', l: 'Truck parking secured — a first for this brief' },
      { n: 'Approved vendor', l: "Alongside India's 4 largest CRE firms" },
      { n: '3 active', l: 'Expansion mandates: Pune · Bhiwandi · Coimbatore' },
    ],
    attribution: "Logistics Head + Commercials Head · India's Largest Two-Wheeler Manufacturer · Hyderabad",
    follow: '→ 3 expansion mandates: Pune · Bhiwandi · Coimbatore',
  },
  {
    tabLabel: '05 · Hoskote',
    badge: 'Deal 05 · Royal Enfield Logistics Partner · Automobile Spare Parts · Hoskote Bangalore',
    title: (
      <>Hoskote, Bangalore — A 20,000 sqft deal<br />in a 24-rupee market. Closed at 19.</>
    ),
    sub: "Royal Enfield's Logistics Partner · Exact 20,000 sqft · Hoskote · February 2026 → Closed May 2026 · Gate demolished and rebuilt",
    metrics: [
      { n: '₹19/sqft', l: 'vs ₹23–24 Hoskote market' },
      { n: '25,000 sqft', l: 'warehouse — charged only 20,000' },
      { n: '2 months', l: 'deposit vs 6–10 month market norm' },
      { n: '20→35 ft', l: 'gate rebuilt wider for 60-ft containers' },
    ],
    brief: [
      { strong: 'Client:', text: ' Logistics partner of iconic motorcycle brand' },
      { strong: 'Cargo:', text: ' Automobile spare parts' },
      { strong: 'Size:', text: ' Exact 20,000 sqft — no flexibility' },
      { strong: 'Rent budget:', text: ' ₹19/sqft maximum' },
      { strong: 'Deposit:', text: ' 2-month (company standard)' },
      { strong: 'Comparable:', text: ' Same client closed at ₹17 in Hyderabad' },
    ],
    challenge: [
      { strong: 'Hoskote market:', text: ' ₹23–24/sqft — ₹4–5 above budget' },
      { strong: 'Standard deposit:', text: ' 6–10 months — client paying only 2' },
      { strong: 'Entry gate:', text: " Only 20 feet wide — 60-ft container can't enter" },
      { text: 'Required: labour rooms, washrooms, docks, scissor lift, 1,000 sqft office' },
      { text: 'No owner initially willing to modify gate + add full infra at ₹19' },
    ],
    did: [
      { strong: 'Found 25,000 sqft warehouse', text: ' — owner agreed to charge only 20,000' },
      { strong: 'Negotiated 2-month deposit', text: ' in a 6–10 month market' },
      { strong: 'Gate demolished and rebuilt', text: ' — widened from 20 ft to 35 ft' },
      { strong: 'Labour rooms + washrooms + loading docks constructed', text: '' },
      { strong: 'Scissor lift installed', text: ' + 1,000 sqft office created' },
      { strong: 'All at the ₹19/sqft', text: ' client had already decided not to exceed' },
    ],
    outcomes: [
      { n: '₹4–5/sqft', l: 'Monthly saving below Hoskote market rate' },
      { n: 'Only 20,000', l: 'Paying for less sqft than occupied — unheard of' },
      { n: 'Full infra', l: 'Docks · lift · office · rooms — all done' },
      { n: '3 months', l: 'Feb to May 2026 · Operational and running' },
    ],
    attribution: "Royal Enfield's Logistics Partner · Automobile Spare Parts · Hoskote, Bangalore",
    follow: '→ Warehouse operational · Relationship continues',
  },
];

// Column labels
const colLabels = ['The Brief', 'The Challenge', 'What WareOnGo Did', 'Outcomes'];

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

const CaseStudies = () => {
  const [active, setActive] = useState(0);
  const [view, setView] = useState<'card' | 'story'>('story');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const c = cases[active];

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
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
          <div className="flex justify-center mb-8">
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

          {/* View Toggle + Tab selector */}
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
                <BookOpen className="w-3.5 h-3.5" /> Full Stories
              </button>
              <button
                onClick={() => setView('card')}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  view === 'card'
                    ? 'bg-wareongo-blue text-wareongo-ivory'
                    : 'text-wareongo-slate hover:bg-wareongo-blue/5 hover:text-wareongo-blue'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Deal Cards
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {cases.map((cs, i) => (
              <button
                key={cs.tabLabel}
                onClick={() => setActive(i)}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                  active === i
                    ? 'bg-wareongo-blue text-white border-wareongo-blue'
                    : 'bg-transparent text-wareongo-slate border-wareongo-blue/20 hover:border-wareongo-blue/60 hover:text-wareongo-blue'
                }`}
              >
                {cs.tabLabel}
              </button>
            ))}
          </div>

          {/* Story view */}
          {view === 'story' && <StoryView story={stories[active]} />}

          {/* Case card — header (navy) */}
          {view === 'card' && <>
          <div className="border border-wareongo-blue rounded-t-2xl bg-wareongo-blue overflow-hidden">
            <div className="px-6 sm:px-9 pt-7 sm:pt-9 pb-6">
              <span className="inline-block text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase text-white/50 mb-3">
                {c.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-white leading-[1.15] tracking-tight mb-2">
                {c.title}
              </h2>
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
          </>}
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

export default CaseStudies;
