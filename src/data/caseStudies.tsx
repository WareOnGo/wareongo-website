import React from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export type Bullet = { strong?: string; text: string };
export type Outcome = { n: string; l: string };
export type Metric = { n: string; l: string };

export type CardData = {
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

/** Numbered item with a bold lead-in — used for filters, layers, and lessons. */
export type StoryStep = { title: string; text: string };

export type StoryTable = {
  /** Omit for a headerless key/value table (the "At a Glance" block). */
  headers?: [string, string];
  rows: { label: string; value: string }[];
};

export type StorySection = {
  label: string;
  heading?: string;
  prose?: string[];
  bullets?: string[];
  steps?: StoryStep[];
  table?: StoryTable;
  /** Prose that closes the section, after the steps or table. */
  proseAfter?: string[];
};

export type Faq = { q: string; a: string };
export type StoryLink = { label: string; to: string };

export type Story = {
  badge: string;
  title: string;
  meta: string;
  /** "In short" direct-answer block — the first thing answer engines extract. */
  summary: string;
  metrics: Metric[];
  sections: StorySection[];
  faqs: Faq[];
  internalLinks: StoryLink[];
  cta: { text: string; links: StoryLink[] };
  tags: string[];
};

export type CaseStudy = {
  slug: string;
  number: string;
  /** City listings page this deal happened in — rendered as an internal link. */
  citySlug: string;
  cityLabel: string;
  /** ISO date the case study went live — feeds Article datePublished. */
  published: string;
  /** ISO date of the last content revision — feeds Article dateModified. Defaults to `published`. */
  updated?: string;
  /** <title> tag. */
  seoTitle: string;
  /** Meta description. */
  metaDescription: string;
  previewTitle: string;
  previewSub: string;
  card: CardData;
  story: Story;
};

// ──────────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────────

export const caseStudies: CaseStudy[] = [
  {
    slug: 'kochi-3pl-warehouse',
    citySlug: 'kochi',
    cityLabel: 'Kochi',
    number: '01',
    // Possession/handover November 2025 per the story timeline.
    published: '2025-12-01',
    updated: '2026-07-29',
    seoTitle: 'Kochi Warehouse for Rent Case: ₹22/sqft in a ₹24.5 Market | WareOnGo',
    metaDescription:
      'How a 3PL rented a compliant warehouse in Kochi at ₹22/sqft when every landlord quoted ₹24.5 to 25. Under-construction sourcing, parallel compliance, labour union.',
    previewTitle: 'Warehouse for Rent in Kochi at ₹22/sqft When the Market Floor Was ₹24.5',
    previewSub:
      '3PL Company · Electrical & Appliances Logistics · Closed at ₹22/sqft in a ₹24.5 to 25 market.',
    card: {
      tabLabel: '01 · Kochi',
      badge: 'Deal 01 · 3PL · Third-Party Logistics · Kerala',
      title: (
        <>Kochi, Kerala — India's hardest<br />warehouse market. Cracked.</>
      ),
      sub: '3PL Company · Electrical & Appliances Logistics · June 2025 → November 2025 operationally running handover · 5 follow-on deals secured',
      metrics: [
        { n: '₹22/sqft', l: 'vs ₹24.5 to 25 market rate' },
        { n: '8 visits', l: 'WareOnGo managed every stakeholder' },
        { n: '5 months', l: 'June inquiry to full possession' },
        { n: '5+ deals', l: 'Follow-on mandates from this one deal' },
      ],
      brief: [
        { strong: 'Client:', text: " 3PL for one of India's largest conglomerates" },
        { strong: 'Cargo:', text: ' Electrical goods & appliances' },
        { strong: 'Budget:', text: ' ₹21 to 22/sqft, non-negotiable' },
        { strong: 'Possession:', text: ' November 2025' },
        { strong: 'Market reality:', text: ' Every owner at ₹24.5 to 25/sqft minimum' },
        { strong: 'Location:', text: ' Kochi, Kerala' },
      ],
      challenge: [
        { text: "Zero ready-to-move warehouses at ₹21 to 22 — budget didn't exist in market" },
        { text: 'No owner willing to hold for a June booking with November possession' },
        { strong: 'Had to pivot to under-construction warehouses', text: ' — track all approvals' },
        { strong: 'Kerala labour union', text: ' — critical operational blocker before handover' },
        { text: "Four stakeholder groups: Ops Manager, Sales Manager, CEO, end user's VP" },
      ],
      did: [
        { text: 'Identified under-construction warehouse at ₹22 budget' },
        { strong: 'Tracked Fire NOC, building approvals, GST, building number', text: ' in real time' },
        { strong: 'Conducted 8 site visits', text: ' — managed every stakeholder independently' },
        { strong: 'Resolved Kerala labour union issue', text: ' — onboarded contractors' },
        { strong: 'Closed at ₹22/sqft', text: ' — handed over operationally running' },
      ],
      outcomes: [
        { n: '₹2.5 to 3/sqft', l: 'Monthly saving vs. market' },
        { n: 'Zero delays', l: 'All approvals cleared before handover' },
        { n: 'Operational Day 1', l: 'Labour sorted, warehouse running' },
        { n: '5+ mandates', l: 'VP + CEO gave follow-on deals immediately' },
      ],
      attribution: 'VP, End User · CEO, 3PL Company · Electrical & Appliances Logistics, Kochi, Kerala',
      follow: '→ 5 follow-on mandates secured',
    },
    story: {
      badge: 'Case Study 01 · 3PL · Third-Party Logistics · Kerala',
      title: 'Warehouse for Rent in Kochi at ₹22/sqft When the Market Floor Was ₹24.5',
      meta: '3PL Company · Electrical goods & appliances · June 2025 → November 2025 · Kochi, Kerala',
      summary:
        "A third-party logistics company handling electrical goods for one of India's largest industrial conglomerates needed a Kochi warehouse at ₹21 to 22/sqft with possession by November 2025. Every landlord in the market quoted ₹24.5 to 25 and refused to move. WareOnGo closed the deal at ₹22/sqft by sourcing under-construction properties getting complete on the client's timeline, tracking Fire NOC, building number, and GST registration in parallel, and dealing with the labour union issue before handover. The client's VP and CEO have since issued 5+ additional mandates.",
      metrics: [
        { n: '₹22/sqft', l: 'vs ₹24.5 to 25 market floor' },
        { n: '8 visits', l: 'across four stakeholder groups' },
        { n: '5 months', l: 'June to November 2025' },
        { n: '5+ mandates', l: 'from this single deal' },
      ],
      sections: [
        {
          label: 'At a Glance',
          table: {
            rows: [
              { label: 'Client', value: "A 3PL distributing electrical goods and appliances for one of India's largest industrial conglomerates" },
              { label: 'Location', value: 'Kochi, Kerala' },
              { label: 'Budget', value: '₹21 to 22/sqft, non-negotiable' },
              { label: 'Market rate', value: '₹24.5 to 25/sqft' },
              { label: 'Closed at', value: '₹22/sqft' },
              { label: 'Timeline', value: 'June 2025 inquiry, November 2025 possession' },
              { label: 'Site visits managed', value: '8, across four separate stakeholder groups' },
              { label: 'Follow-on business', value: '5+ additional mandates' },
            ],
          },
        },
        {
          label: 'The Situation',
          prose: [
            "The inquiry came in June 2025. A 3PL needed warehouse space in Kochi for an electrical goods and appliances distribution contract, with operations starting November 2025. Their budget ceiling was ₹21 to 22 per sqft, set by the end customer's logistics costing, and it wasn't moving.",
            'Neither was the market. Kochi landlords were quoting ₹24.5 to 25 as a floor, and every conversation ended the same way.',
            'There was a second problem hiding behind the first. Even if a landlord had agreed on price, none of them would hold the property for six months. A warehouse available in June gets leased in June. Asking an owner to sit on vacant space until November was a non-starter.',
          ],
        },
        {
          label: 'What Made this Hard',
          bullets: [
            'No ready-to-move stock existed under ₹24/sqft anywhere in the city.',
            'Owners refused to hold inventory six months forward, so the timeline itself killed conventional options.',
            'The facility needed Fire NOC, building number, and GST registration completed before handover, not after.',
            "Four separate stakeholder groups had to approve the site: the 3PL's operations manager, its sales manager, the CEO, and the VP of the end-user conglomerate. Each would have their own visits and viewpoints.",
            "Kerala's labour environment meant the warehouse couldn't go operational without union-satisfactory labour arrangements settled in advance.",
          ],
        },
        {
          label: 'What WareOnGo did',
          prose: [
            "The price and timeline problems had a single answer: stop looking at ready warehouses. WareOnGo shifted the search to under-construction properties scheduled to complete by November. A building that doesn't exist yet has no vacancy cost, so its owner can commit months ahead, and at a rate below the finished-stock floor. The security deposit also helps the liquidity crunch most owners experience towards the end of construction. That one move solved both the ₹22 ceiling and the six-month forward hold at the same time.",
            'An under-construction building brings its own risk: it can be handed over without the paperwork that makes it usable. So while construction ran, WareOnGo tracked every regulatory milestone in parallel. Fire NOC, building number, GST registration, all monitored in real time so nothing surfaced as a surprise at possession. Construction itself can slip behind schedule, so the build timeline was monitored and managed alongside the paperwork.',
            "The stakeholder problem was handled with plain coordination. Eight site visits were managed centrally so that each new visitor didn't restart the evaluation from zero.",
            "The biggest challenge, though, came from Kerala's labour environment. Kerala has multiple politically backed labour unions, and without an arrangement with them it is very difficult to operate a warehouse. This is the one problem companies miss, especially those coming from the north: handled badly, union issues can stall operations entirely. Even brands like Pepsico, Marico and BMW have had to curtail their Kerala operations after run-ins with labour unions. WareOnGo knew this context and handled the negotiation delicately, so the client took over a running warehouse and not a protest site.",
          ],
        },
        {
          label: 'The Numbers',
          table: {
            headers: ['Metric', 'Value'],
            rows: [
              { label: 'Client budget', value: '₹21 to 22/sqft' },
              { label: 'Market quote across landlords', value: '₹24.5 to 25/sqft' },
              { label: 'Final rate', value: '₹22/sqft' },
              { label: 'Saving vs market', value: '₹2.5 to 3/sqft every month' },
              { label: 'Timeline', value: 'June 2025 to November 2025' },
              { label: 'Site visits coordinated', value: '8' },
              { label: 'Compliance items closed pre-handover', value: 'Fire NOC, building number, GST registration' },
            ],
          },
        },
        {
          label: 'The WareOnGo Impact',
          prose: [
            "The client took possession in November 2025 at ₹22/sqft, with labour working and compliance complete on day one. The relationship compounded from there: the conglomerate's VP and the 3PL's CEO have since routed 5+ additional warehouse requirements directly to WareOnGo.",
          ],
        },
        {
          label: 'Lessons',
          heading: "If you're looking for a warehouse in Kochi, this deal teaches us four things",
          steps: [
            {
              title: 'The quoted market rate is the ready-stock rate.',
              text: 'Kochi landlords held a ₹24.5 to 25 floor on finished warehouses. Under-construction properties are priced below it because the owner carries no vacancy risk on a pre-committed tenant, and it is honestly a relief for them if the property is leased out even before it is completed. There is the additional incentive of investing the security deposit towards construction and towards the end of it, most owners are strapped for funds.',
            },
            {
              title: 'When life gives you 6 months, make a warehouse.',
              text: 'Five to six months of runway is exactly what makes the under-construction route possible. Start the search when the requirement is confirmed, not when the deadline is close.',
            },
            {
              title: 'Compliance must finish before possession.',
              text: "Fire NOC, building numbering, GST registration and other compliances each have their own government timelines. Run them in parallel with construction or fit-out, because running them after handover means paying rent on a warehouse you can't operate legally.",
            },
            {
              title: 'In Kerala, labour arrangements are part of the real estate deal.',
              text: "Settle union issues before taking possession. A warehouse without workable labour terms isn't operational, whatever the lease says.",
            },
          ],
        },
      ],
      faqs: [
        {
          q: 'What is the warehouse rent in Kochi?',
          a: 'In this 2025 deal, Kochi landlords quoted ₹24.5 to 25/sqft as a floor for ready warehouse stock. The transaction closed at ₹22/sqft by targeting an under-construction property, a saving of ₹2.5 to 3/sqft per month against market. Now, the market is experiencing a supply crunch; so, warehouses in prime areas like Kalamassery go at a minimum of ₹30/sqft.',
        },
        {
          q: 'How far in advance should I start a warehouse search in Kochi?',
          a: 'Five to six months worked in this case: inquiry in June 2025 for a November 2025 possession. That window is what made under-construction properties viable, since owners will commit future space at better rates than finished stock.',
        },
        {
          q: 'Can you lease a warehouse that is still under construction?',
          a: "Yes, and in tight markets it's often the only way to hit a below-market rate. The conditions: completion must be verifiably on your timeline, and regulatory items like Fire NOC, building number, and GST registration must be tracked through construction so the building is legally operational at handover.",
        },
        {
          q: 'How do labour unions affect warehousing in Kerala?',
          a: "A Kochi warehouse can't go operational without labour arrangements that work within Kerala's union environment. Unions expect their members to handle loading and unloading, and a facility without a negotiated understanding in place can face disruptions that stall operations entirely. In this deal, the labour arrangement was settled before handover, which is why the warehouse was operational on day one.",
        },
        {
          q: 'How many site visits does a warehouse deal usually take?',
          a: "This deal took eight, because four stakeholder groups (operations, sales, the 3PL's CEO, and the end customer's VP) each needed to see the property. Central coordination kept each new visit from restarting the process.",
        },
      ],
      internalLinks: [
        { label: 'Explore verified warehouses for rent in Kochi', to: '/listings/city/kochi' },
        { label: 'Blog: Warehouse Rent in India', to: '/blogs/warehouse-rent-india-guide' },
        { label: 'Blog: Warehouse Compliance Checklist for India', to: '/blogs/warehouse-compliance-checklist-india' },
        { label: 'Next case study: Fire-compliant warehouse in Hyderabad', to: '/casestudies/hyderabad-fire-compliant-warehouse' },
      ],
      cta: {
        text: 'Looking for warehouse space in Kochi or anywhere in Kerala? Browse verified, physically inspected listings, or send us your requirement and get a curated shortlist within 4 hours.',
        links: [
          { label: 'Browse Kochi listings', to: '/listings/city/kochi' },
          { label: 'Get My Shortlist in 4 Hours', to: '/request-warehouse' },
        ],
      },
      tags: ['warehouse for rent in Kochi', '3PL warehouse Kerala', 'warehouse at ₹22/sqft Kochi', 'fire NOC warehouse Kerala', 'Kerala warehouse advisory', 'WareOnGo Kochi case study'],
    },
  },
  {
    slug: 'hyderabad-fire-compliant-warehouse',
    citySlug: 'hyderabad',
    cityLabel: 'Hyderabad',
    number: '02',
    // ESTIMATE — story carries no dates. Sequenced between Deal 01 (Nov 2025)
    // and Deal 04. Correct this if the real close date is known.
    published: '2025-06-01',
    updated: '2026-07-29',
    seoTitle: 'Fire Compliant Warehouse Hyderabad: 50,000 sqft at ₹18.5 | WareOnGo',
    metaDescription:
      '22 properties screened, 6 shortlisted, one fire NOC secured. How a manufacturer consolidated into a 50,000 sqft fire compliant warehouse in Hyderabad at ₹18.5/sqft.',
    previewTitle: 'Fire Compliant Warehouse in Hyderabad, 50,000 sqft at ₹18.5/sqft',
    previewSub:
      'Manufacturer · 22 properties screened · Closed at ₹18.5/sqft for 50,000 sqft fire-compliant.',
    card: {
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
        { strong: 'Need:', text: ' 50,000 to 60,000 sqft · fire-compliant · single location' },
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
        { strong: 'Legal due diligence on 22 properties', text: ' (50,000 to 60,000 sqft)' },
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
    story: {
      badge: 'Case Study 02 · Manufacturer · Fire Compliance · Telangana',
      title: 'Fire Compliant Warehouse in Hyderabad, 50,000 sqft at ₹18.5/sqft',
      meta: 'Manufacturer · 35,000 sqft (2 warehouses) → 50,000 sqft fire compliant · Devarayamjal, Hyderabad',
      summary:
        'A manufacturer that had lived through a fire at its Bhiwandi facility needed to consolidate two Hyderabad warehouses (20,000 and 15,000 sqft) into one 50,000 sqft facility with a valid fire NOC. Two months of searching on their own produced zero compliant options. WareOnGo screened 22 properties, shortlisted the 6 that could actually pass inspection, worked directly with the fire department to close the gaps, and leased a main-road facility in Devarayamjal at ₹18.5/sqft against a ₹21 asking rate. Savings: ₹1,25,000 a month, roughly ₹90 lakhs over the five-year lease.',
      metrics: [
        { n: '₹18.5/sqft', l: 'vs ₹21 asking' },
        { n: '22 screened', l: '6 shortlisted' },
        { n: '45 days', l: 'rent-free negotiated' },
        { n: '~₹90L', l: '5-year savings' },
      ],
      sections: [
        {
          label: 'At a Glance',
          table: {
            rows: [
              { label: 'Client', value: 'A manufacturer, post fire incident at its Bhiwandi facility' },
              { label: 'Requirement', value: '50,000 sqft consolidated, fire NOC mandatory' },
              { label: 'Location', value: 'Devarayamjal, Hyderabad, main road' },
              { label: 'Asking rate', value: '₹21/sqft' },
              { label: 'Closed at', value: '₹18.5/sqft' },
              { label: 'Monthly saving', value: '₹1,25,000' },
              { label: 'Five-year saving', value: '~₹90 lakhs' },
              { label: 'Rent-free period', value: '45 days for epoxy flooring and transition' },
              { label: 'Properties screened', value: '22, of which 6 shortlisted' },
            ],
          },
        },
        {
          label: 'The Situation',
          prose: [
            'This search started with a fire. The client, a manufacturer, had a fire incident at their Bhiwandi facility, and after that their legal team drew a hard line: no warehouse without a valid fire NOC, no exceptions, no flexibility on fire safety standards. It was a fair call, they almost lost everything and claiming insurance became really tough as the property was non-compliant.',
            'At the same time they wanted to consolidate. Two Hyderabad facilities of 20,000 and 15,000 sqft would merge into a single 50,000 sqft warehouse, which meant finding one property in the 50,000 to 60,000 sqft range that the legal team would sign off on.',
            'They searched on their own for over two months; they got nothing. That\'s not because Hyderabad lacks 50,000 sqft warehouses. It\'s because most of that stock was built without fire infrastructure, and owners describe their properties as "compliant" without a live NOC behind the claim.',
          ],
        },
        {
          label: 'What Made this Hard',
          bullets: [
            'Fire NOC was a legal-team mandate, not a preference. Every property without one was dead on arrival regardless of price or location.',
            'They also wanted physical fire safety measures, not just certificates acquired through shady means. This client had already lost everything in a fire, they did not want that to happen again.',
            'Most large-format Hyderabad spaces either had no fire infrastructure or had lapsed or missing NOCs.',
            "The exact requirements to pass inspection weren't clear from the outside, so the client couldn't even tell which non-compliant properties were fixable.",
            'Consolidating two running facilities into one meant the move itself needed funding: flooring, fit-out, and transition time.',
          ],
        },
        {
          label: 'What WareOnGo did',
          prose: [
            'First, the screen. WareOnGo evaluated 22 properties in the 50,000 to 60,000 sqft range and eliminated 16 that could never reach compliance economically. That left 6 genuine candidates.',
            'Second, and this is the step most searches skip, WareOnGo went to the fire department directly. Instead of guessing at requirements, the team engaged the department and the inspector to establish exactly what the shortlisted property needed to pass. The gap turned out to be closable: fire hydrants were installed, the inspector visit was arranged, and the NOC was secured for the selected property.',
            "Then the commercials. The asking rate was ₹21/sqft. WareOnGo negotiated it to ₹18.5, and on top of that secured 45 days rent-free so the client could lay epoxy flooring and run the two-into-one transition without paying rent on a warehouse they couldn't use yet.",
            "The client's legal team signed off. After Bhiwandi, that sign-off was the whole point.",
          ],
        },
        {
          label: 'The Numbers',
          table: {
            headers: ['Metric', 'Value'],
            rows: [
              { label: 'Properties screened', value: '22' },
              { label: 'Eliminated as non-fixable', value: '16' },
              { label: 'Shortlisted', value: '6' },
              { label: 'Facility size', value: '50,000 sqft (consolidating 20,000 + 15,000)' },
              { label: 'Asking rate', value: '₹21/sqft' },
              { label: 'Closed rate', value: '₹18.5/sqft' },
              { label: 'Monthly saving', value: '₹1,25,000' },
              { label: 'Saving over 5-year lease', value: '~₹90 lakhs' },
              { label: 'Rent-free period', value: '45 days' },
              { label: "Client's independent search before WareOnGo", value: '2+ months, zero compliant options' },
            ],
          },
        },
        {
          label: 'The WareOnGo Impact',
          prose: [
            'The client operates one 50,000 sqft fire-compliant warehouse in Devarayamjal instead of two smaller non-compliant ones, at ₹2.5/sqft under asking, with a legal team that approved the file. They immediately handed WareOnGo three new city mandates: Chennai, Bangalore, and Delhi.',
          ],
        },
        {
          label: 'Lessons',
          heading: 'If you need a fire compliant warehouse, this deal teaches us four things:',
          steps: [
            {
              title: '"Fire compliant" in a listing means nothing without a live NOC.',
              text: "The only proof is the certificate itself, with a valid date. This client's two-month independent search failed because claimed compliance kept dissolving under scrutiny.",
            },
            {
              title: 'Screen for fixability, not just current status.',
              text: 'Of 22 properties, 16 could never reach compliance at reasonable cost, but 6 could. The useful question isn\'t "does it have an NOC today" but "what exactly would it take to get one."',
            },
            {
              title: 'Ask the fire department, not the landlord.',
              text: 'Requirements to pass inspection come from the department and the inspector. Engaging them directly turns a vague compliance problem into a checklist: in this case, hydrant installation followed by an arranged inspection.',
            },
            {
              title: 'Price the compliance premium correctly.',
              text: 'A compliant warehouse at ₹18.5/sqft beat the ₹21 asking rate. Compliance and below-market rent are not mutually exclusive when the landlord understands the tenant is long-term and the alternative is vacancy.',
            },
          ],
        },
      ],
      faqs: [
        {
          q: 'What is a fire NOC for a warehouse?',
          a: 'A fire NOC (No Objection Certificate) is the fire department\'s certification that a building meets fire safety requirements: hydrants, water storage, access, and related infrastructure. For warehouses it\'s the document insurers, legal teams, and licensing authorities actually check, and it must be current, not just "applied for."',
        },
        {
          q: 'Why is it hard to find a fire compliant warehouse in Hyderabad?',
          a: "Much of the existing large-format stock was built without fire infrastructure, and owners often claim compliance they can't document. In this deal, 16 of 22 screened properties in the 50,000 to 60,000 sqft band were eliminated because they couldn't reach compliance economically.",
        },
        {
          q: 'Can a non-compliant warehouse be made fire compliant?',
          a: 'Sometimes. It depends on what the fire department requires for that specific building. In this case the selected property needed fire hydrants installed, after which an inspector visit was arranged and the NOC issued. The properties that were eliminated had gaps too expensive to close.',
        },
        {
          q: 'What does a 50,000 sqft warehouse cost in Hyderabad?',
          a: 'In this transaction, the asking rate in Devarayamjal was ₹21/sqft and the deal closed at ₹18.5/sqft, which works out to ₹1,25,000 per month in savings and roughly ₹90 lakhs over a five-year lease.',
        },
        {
          q: 'What is a rent-free period and how long can you get?',
          a: 'A rent-free period is time after handover when no rent is charged, meant for fit-out and transition. This deal secured 45 days, used for epoxy flooring and the physical move from two facilities into one.',
        },
        {
          q: 'Should I consolidate multiple warehouses into one?',
          a: 'This client merged 20,000 and 15,000 sqft facilities into a single 50,000 sqft warehouse, which simplified compliance to one property and cut per-sqft cost below what either old facility paid. The trade-off is transition risk, which is what the rent-free period is for.',
        },
      ],
      internalLinks: [
        { label: 'Explore verified warehouses for rent in Hyderabad', to: '/listings/city/hyderabad' },
        { label: 'Blog: Warehouse Compliance Checklist for India', to: '/blogs/warehouse-compliance-checklist-india' },
        { label: 'Blog: What Makes a Warehouse Grade A', to: '/blogs/grade-a-warehouse-india' },
        { label: 'Previous case study: Kochi 3PL warehouse', to: '/casestudies/kochi-3pl-warehouse' },
        { label: 'Next case study: FSSAI warehouse in Devanahalli', to: '/casestudies/devanahalli-fssai-warehouse' },
      ],
      cta: {
        text: 'Need a fire compliant warehouse? Compliance-heavy briefs are our speciality. Send us your requirement and get a shortlist of verified, legally checked options within 4 hours.',
        links: [
          { label: 'Browse Hyderabad listings', to: '/listings/city/hyderabad' },
          { label: 'Get My Shortlist in 4 Hours', to: '/request-warehouse' },
        ],
      },
      tags: ['fire compliant warehouse Hyderabad', 'fire NOC warehouse Devarayamjal', 'warehouse Hyderabad ₹18/sqft', 'warehouse compliance India', 'WareOnGo Hyderabad'],
    },
  },
  {
    slug: 'devanahalli-fssai-warehouse',
    citySlug: 'bengaluru',
    cityLabel: 'Bengaluru',
    number: '03',
    // Signed January 2026; full operations June 2026 per the story timeline.
    published: '2026-07-01',
    updated: '2026-07-29',
    seoTitle: 'FSSAI Warehouse Devanahalli: 250KW, Vastu, ₹27/sqft | WareOnGo',
    metaDescription:
      'How a food manufacturer got an FSSAI certified, Vastu compliant warehouse in Devanahalli with 250KW power at ₹27/sqft all-in, plus 4.5 months rent-free.',
    previewTitle: 'FSSAI Compliant Warehouse in Devanahalli with 250KW Power and a Vastu Entry',
    previewSub:
      'Premium food manufacturer · 6 months on-ground · ₹27/sqft incl. 250KW power · 4.5 months rent-free.',
    card: {
      tabLabel: '03 · Devanahalli',
      badge: 'Deal 03 · Food Manufacturer · FSSAI + Vastu + BTS · Bangalore North',
      title: (
        <>Devanahalli, Bangalore — Vastu. 250KW.<br />FSSAI. Hormuz.</>
      ),
      sub: 'Premium food manufacturer · 3 to 5 star hotels across Karnataka · July 2025 → January 2026 · Factory runs 18 hours/day at full capacity',
      metrics: [
        { n: '₹27/sqft', l: 'incl. 250KW power (worth ₹75L to 1Cr)' },
        { n: '6 months', l: 'on-ground scouting before signing' },
        { n: '4.5 months', l: 'total rent-free secured' },
        { n: '18 hrs/day', l: 'factory at full operating capacity' },
      ],
      brief: [
        { strong: 'Client:', text: ' Premium food manufacturer — organic produce, noodles' },
        { strong: 'Customers:', text: ' All 3, 4 & 5-star hotels in Karnataka' },
        { strong: 'Vastu mandatory:', text: ' East-facing entry — non-negotiable' },
        { strong: 'Power:', text: ' 250KW required (market standard: 100 to 200KW)' },
        { strong: 'Compliance:', text: ' FSSAI certified food facility' },
        { strong: 'No internal team:', text: ' WareOnGo managed everything' },
      ],
      challenge: [
        { strong: 'Visited 6 warehouses', text: ' — none had east-facing entry' },
        { strong: '250KW adds ₹75L to 1Cr infrastructure', text: ' — owners refused' },
        { strong: 'Spoke to hundreds of owners on-ground', text: ' over months' },
        { text: 'FSSAI chemical treatment — unfamiliar to most Devanahalli owners' },
        { text: 'Full BTS: docks, insulation, barbed wire, flooring, treatment' },
        { strong: 'Machinery stuck in Strait of Hormuz', text: ' — the Iran war' },
      ],
      did: [
        { text: 'Months on-ground — found east-facing (Vastu-compliant) property' },
        { strong: 'Negotiated 250KW power included', text: ' at ₹27/sqft' },
        { text: 'Constructed docks, fitted insulation, installed barbed wire' },
        { strong: 'Floor polish + FSSAI chemical treatment', text: ' completed' },
        { strong: 'Secured 3 months rent-free', text: ' at signing (January to March 2026)' },
        { strong: 'Negotiated +45 days extension', text: ' for Hormuz machinery delay' },
      ],
      outcomes: [
        { n: '₹75L to 1Cr', l: 'Power infrastructure value secured in rent' },
        { n: '4.5 months', l: 'Total rent-free (3 months + 45 days Hormuz)' },
        { n: 'FSSAI Day 1', l: '100% food compliance from first day' },
        { n: 'All jobs', l: 'Client handed all future requirements to WareOnGo' },
      ],
      attribution: 'Managing Director · Premium Food Manufacturer · Devanahalli, Bangalore',
      follow: '→ All future requirements handed to WareOnGo',
    },
    story: {
      badge: 'Case Study 03 · Food Manufacturer · FSSAI + Vastu + BTS · Bangalore North',
      title: 'FSSAI Compliant Warehouse in Devanahalli with 250KW Power and a Vastu Entry',
      meta: 'Premium Food Manufacturer · 3 to 5 star hotel supply chain · July 2025 inquiry → January 2026 signing → June 2026 full operations · Devanahalli, Bangalore',
      summary:
        "A premium food manufacturer supplying 3 to 5 star hotel chains across Karnataka needed a warehouse near Bangalore that satisfied five conditions at once: an east-facing Vastu compliant entry, 250KW power in a corridor where 100 to 200KW is standard, FSSAI certification readiness, a complete build-to-suit fit-out, and a landlord willing to fund a transformer upgrade costing ₹75 lakhs to ₹1 crore. After the client had visited 6 warehouses on their own, WareOnGo spent months on the ground in the Devanahalli corridor, closed at ₹27/sqft inclusive of the 250KW power, and negotiated 4.5 months rent-free, including a 45-day extension when the client's machinery got stuck in the Strait of Hormuz.",
      metrics: [
        { n: '₹27/sqft', l: 'incl. 250KW power' },
        { n: '6 months', l: 'on-ground scouting' },
        { n: '4.5 months', l: 'rent-free secured' },
        { n: '18 hrs/day', l: 'factory at capacity' },
      ],
      sections: [
        {
          label: 'At a Glance',
          table: {
            rows: [
              { label: 'Client', value: 'A premium food manufacturer (organic produce, seasonal fruits, noodles) supplying 3 to 5 star hotels across Karnataka' },
              { label: 'Location', value: 'Devanahalli, North Bangalore' },
              { label: 'Rate', value: '₹27/sqft, inclusive of 250KW power' },
              { label: 'Power requirement', value: '250KW (corridor standard: 100 to 200KW)' },
              { label: 'Transformer investment', value: '₹75 lakhs to ₹1 crore, borne by the landlord' },
              { label: 'Compliance', value: 'FSSAI certification, achieved' },
              { label: 'Rent-free', value: '3 months + 45-day extension = 4.5 months' },
              { label: 'Timeline', value: 'July 2025 inquiry, January 2026 agreement, June 2026 full operations' },
              { label: 'Status today', value: 'Running' },
            ],
          },
        },
        {
          label: 'The Situation',
          prose: [
            'The client makes premium food products, organic produce, seasonal fruits, and noodles, for the supply chains of 3 to 5 star hotels across Karnataka. Their requirement reached WareOnGo in July 2025, after they had already visited 6 warehouses and rejected all of them.',
            "The reason nothing fit is that this wasn't one requirement, it was five stacked on top of each other, and every property that passed one filter failed another.",
          ],
        },
        {
          label: 'The Five Layers of Difficulty',
          steps: [
            {
              title: 'Vastu.',
              text: "The entry had to face east. This was a non-negotiable mandate from the client. The standard market search simply doesn't account for orientation.",
            },
            {
              title: 'Power.',
              text: "The food processing machinery needed 250KW of power. We could describe this as the Jeremy Clarkson of Industrial facilities: It always needed more power. The Devanahalli corridor's standard supply is 100 to 200KW, and closing the gap means a transformer upgrade costing ₹75 lakhs to ₹1 crore. The owners hear that number and walk away.",
            },
            {
              title: 'FSSAI.',
              text: 'Food-grade certification requires chemical treatment, specialized floor specifications, a pest-controlled perimeter, and insulation. Local landlords had never dealt with any of it.',
            },
            {
              title: 'No logistics team.',
              text: 'The client had no internal logistics function, so the facility had to be delivered as a full build-to-suit fit-out, designed, executed, and handed over operational.',
            },
            {
              title: 'Geopolitics, eventually.',
              text: "At signing, the client's imported machinery was stuck in the Strait of Hormuz because of the Iran war. A warehouse with no machinery in it, is burning rent for nothing.",
            },
          ],
        },
        {
          label: 'What WareOnGo did',
          prose: [
            "There was no shortcut through a database for this one. WareOnGo's team went fully on-ground, speaking with hundreds of individual warehouse owners across the Devanahalli corridor over months of scouting to find east-facing properties whose owners would even discuss a power upgrade.",
            'The property that emerged checked the orientation box. The rest was negotiated and built. The landlord agreed to install the transformer, an investment of ₹75 lakhs to ₹1 crore, recovered through a rate of ₹27/sqft that folds the 250KW supply into the rent. WareOnGo then oversaw the entire build-to-suit implementation for FSSAI readiness, the chemical treatment, floor specs, pest-controlled perimeter, and insulation, and handed over a fully operational facility rather than an empty shell, because the client had no logistics team to do it themselves.',
            "The agreement was signed in January 2026 with 3 months rent-free through March. Then Hormuz happened. With the machinery stranded mid-shipment, WareOnGo went back to the landlord mid-deal and negotiated a further 45 days rent-free, taking the total to 4.5 months and keeping the client from paying rent on a factory that couldn't run.",
          ],
        },
        {
          label: 'The Numbers',
          table: {
            headers: ['Metric', 'Value'],
            rows: [
              { label: 'Rate', value: '₹27/sqft inclusive of 250KW power' },
              { label: 'Corridor standard power', value: '100 to 200KW' },
              { label: 'Transformer cost (landlord-funded)', value: '₹75 lakhs to ₹1 crore' },
              { label: 'Warehouses client visited before WareOnGo', value: '6' },
              { label: 'On-ground scouting', value: '6 months, hundreds of owner conversations' },
              { label: 'Rent-free secured', value: '3 months + 45 days = 4.5 months' },
              { label: 'Agreement signed', value: 'January 2026' },
              { label: 'Full operations', value: 'June 2026' },
              { label: 'Current utilization', value: '18 hours/day at full capacity' },
            ],
          },
        },
        {
          label: 'The WareOnGo Impact',
          prose: [
            'The facility runs 18 hours a day at full capacity. Machinery is installed, the 250KW supply is live, and FSSAI certification is in hand. The client has handed all future warehousing and logistics requirements to WareOnGo.',
          ],
        },
        {
          label: 'Lessons',
          heading: 'If you need a food-grade warehouse near Bangalore, this deal teaches three things',
          steps: [
            {
              title: 'FSSAI readiness is a build spec, not a checkbox.',
              text: 'Certification needs chemical treatment, specific floor specifications, a pest-controlled perimeter, and insulation. Most landlords have never done it, so plan for a build-to-suit conversation rather than a search for ready stock.',
            },
            {
              title: 'High power requirements change who you can negotiate with.',
              text: 'If you need more than the corridor standard (100 to 200KW in Devanahalli), the real search is for a landlord willing to fund a transformer, and the cleanest structure is folding that investment into the rate, as the ₹27/sqft all-in figure did here.',
            },
            {
              title: 'Rent-free periods can be reopened when circumstances change.',
              text: "The 45-day Hormuz extension was negotiated after signing. A landlord who has just invested ₹75 lakhs+ in a transformer has every incentive to keep the tenancy healthy, and that leverage works in the tenant's favour.",
            },
          ],
        },
      ],
      faqs: [
        {
          q: 'What does a warehouse need for FSSAI certification?',
          a: 'In this build, FSSAI readiness required chemical treatment of the facility, specialized floor specifications, a pest-controlled perimeter, and insulation. These are construction-level changes, which is why food-grade requirements usually end in a build-to-suit arrangement rather than a ready-stock lease.',
        },
        {
          q: 'How much power do warehouses in Devanahalli typically have?',
          a: "The corridor standard is 100 to 200KW. Requirements above that, like this client's 250KW, need a transformer upgrade costing roughly ₹75 lakhs to ₹1 crore, which most owners won't fund without a committed long-term tenant.",
        },
        {
          q: 'What is a Vastu compliant warehouse?',
          a: 'For this client it meant an east-facing entry, a cultural mandate that was non-negotiable. Finding and verifying Vastu compliant industrial property requires physically checking properties and speaking directly with owners.',
        },
        {
          q: 'What does ₹27/sqft inclusive of power mean?',
          a: 'The rate bundles the 250KW power infrastructure into the rent instead of charging the tenant separately for the transformer upgrade. The landlord funded the ₹75 lakh to ₹1 crore installation and recovers it through the rate over the lease term.',
        },
        {
          q: 'What is a build-to-suit (BTS) warehouse?',
          a: "A BTS arrangement means the facility is designed and fitted out to the tenant's specification before handover. Here, WareOnGo oversaw the full BTS scope, from FSSAI readiness works to operational handover, because the client had no internal logistics team.",
        },
        {
          q: 'How long does it take to set up a food-grade warehouse near Bangalore?',
          a: "This deal ran from a July 2025 inquiry to full operations in June 2026, including 6 months of on-ground scouting, the transformer installation, the FSSAI fit-out, and a machinery delay outside anyone's control. Simple requirements move much faster; five-filter requirements don't.",
        },
      ],
      internalLinks: [
        { label: 'Explore verified warehouses for rent in Bengaluru', to: '/listings/city/bengaluru' },
        { label: 'Blog: Warehouse Compliance Checklist for India', to: '/blogs/warehouse-compliance-checklist-india' },
        { label: 'Blog: Warehouse Rent in India', to: '/blogs/warehouse-rent-india-guide' },
        { label: 'Previous case study: Fire-compliant warehouse in Hyderabad', to: '/casestudies/hyderabad-fire-compliant-warehouse' },
        { label: 'Next case study: Automobile warehouse in Hyderabad', to: '/casestudies/hyderabad-automobile-warehouse' },
      ],
      cta: {
        text: 'Vastu mandates, FSSAI builds, power upgrades: the hard briefs are our speciality. Send us your requirement and get a curated shortlist within 4 hours.',
        links: [
          { label: 'Browse Bengaluru listings', to: '/listings/city/bengaluru' },
          { label: 'Get My Shortlist in 4 Hours', to: '/request-warehouse' },
        ],
      },
      tags: ['warehouse Devanahalli Bangalore', 'FSSAI warehouse Bangalore', 'Vastu compliant warehouse Devanahalli', '250KW warehouse Bangalore North', 'factory setup Devanahalli'],
    },
  },
  {
    slug: 'hyderabad-automobile-warehouse',
    citySlug: 'hyderabad',
    cityLabel: 'Hyderabad',
    number: '04',
    // Requirement floated July 2025, open three months → closed ~October 2025.
    published: '2025-11-01',
    updated: '2026-07-29',
    seoTitle: 'Automobile Warehouse Hyderabad: 55,000 sqft Deal | WareOnGo',
    metaDescription:
      "One of India's largest two-wheeler maker had four top CRE firms on one brief. How WareOnGo won it: 25 options cut to 1 on container access, parking, and ₹17 to 18/sqft.",
    previewTitle: 'Automobile Warehouse in Hyderabad, 55,000+ sqft at ₹17 to 18/sqft',
    previewSub:
      'Automobile Manufacturer · 25 options filtered to 1 · 100m from highway · 1 acre truck parking secured.',
    card: {
      tabLabel: '04 · Hyderabad · Auto',
      badge: 'Deal 04 · Automobile Manufacturer · Logistics Warehouse · Hyderabad',
      title: (
        <>Hyderabad — One of India's largest two-wheeler<br />brands mandated the big 4. Then chose us.</>
      ),
      sub: "Automobile Manufacturer · 55,000 to 62,500 sqft · Nizamabad Highway · Now an approved vendor alongside India's 4 largest CRE firms",
      metrics: [
        { n: '₹17 to 18/sqft', l: 'within budget — all competitors missed' },
        { n: '25 → 1', l: 'options in market vs our shortlist' },
        { n: '100 metres', l: 'from highway vs 12 km for others' },
        { n: '1 acre', l: 'truck parking — others refused' },
      ],
      brief: [
        { strong: 'Client:', text: " One of India's largest two-wheeler manufacturers" },
        { strong: 'Size:', text: ' 55,000 to 62,500 sqft carpet area' },
        { strong: 'Budget:', text: ' ₹17 to 18/sqft' },
        { strong: 'Location mandate:', text: ' Nizamabad Highway — non-negotiable' },
        { strong: 'Additional:', text: ' 1-acre truck parking area required' },
        { strong: 'Competition:', text: ' All 4 largest CRE firms active simultaneously' },
      ],
      challenge: [
        { strong: '25 options', text: ' in market — competitors showed all 25' },
        { text: 'Most warehouses 12+ km inside — unsuitable for 60-ft containers' },
        { strong: '60-ft container + nose = 70 to 72 ft turning radius', text: ' needed' },
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
      attribution: "Logistics Head + Commercials Head · One of India's Largest Two-Wheeler Manufacturers · Hyderabad",
      follow: '→ 3 expansion mandates: Pune · Bhiwandi · Coimbatore',
    },
    story: {
      badge: 'Case Study 04 · Automobile Manufacturer · Logistics Warehouse · Hyderabad',
      title: 'Automobile Warehouse in Hyderabad, 55,000+ sqft at ₹17 to 18/sqft',
      meta: 'Automobile Manufacturer · 55,000 to 62,500 sqft carpet area · Yellampet, Nizamabad Highway, Hyderabad · Approved vendor status achieved',
      summary:
        "One of India's largest two-wheeler manufacturers put one Hyderabad warehouse brief in front of four of the country's biggest commercial real estate firms, and also WareOnGo. The requirement: 55,000 to 62,500 sqft carpet area at ₹17 to 18/sqft, full 60-foot container maneuverability, one acre of adjacent truck parking, and highway proximity. Of 25 options on the table, 24 failed on operational grounds. WareOnGo's pick, a facility in Yellampet 100 metres off the Nizamabad Highway, closed after 3 months of scouting and 1.5 months of negotiation. The client made WareOnGo an approved vendor alongside the top four CRE firms and issued expansion mandates in Pune, Bhiwandi, and Coimbatore.",
      metrics: [
        { n: '25 → 1', l: 'Options filtered' },
        { n: '100 metres', l: 'From highway' },
        { n: '1 acre', l: 'Parking secured' },
        { n: '3 mandates', l: 'Expansion active' },
      ],
      sections: [
        {
          label: 'At a Glance',
          table: {
            rows: [
              { label: 'Client', value: "One of India's largest motorcycle manufacturer" },
              { label: 'Competition', value: "Four of India's biggest CRE firms, same brief" },
              { label: 'Requirement', value: '55,000 to 62,500 sqft carpet area' },
              { label: 'Budget', value: '₹17 to 18/sqft' },
              { label: 'Location', value: 'Yellampet, 100 metres from Nizamabad Highway, Hyderabad' },
              { label: 'Options evaluated', value: '25, one approved' },
              { label: 'Truck parking', value: '1 acre, adjacent' },
              { label: 'Timeline', value: '3 months scouting + 1.5 months negotiation' },
              { label: 'Follow-on', value: 'Expansion mandates in Pune, Bhiwandi, Coimbatore' },
            ],
          },
        },
        {
          label: 'The Situation',
          prose: [
            "When One of India's largest two-wheeler manufacturers needs a warehouse, it doesn't struggle for options. Four of the country's biggest CRE firms, relationships going back decades, were already working the brief. Between them, 25 properties landed on the table.",
            "The problem was that quantity doesn't equal quality. The brief had four filters, and almost every option failed at least one of them. This is the part of automobile warehousing that looks simple on paper and isn't: a two-wheeler distribution operation lives and dies on whether a 60-foot container can physically get in, turn, dock, and get out, every day, without drama.",
          ],
        },
        {
          label: 'The Four Filters',
          steps: [
            { title: 'Size.', text: '55,000 to 62,500 sqft of carpet area. Not built-up, carpet.' },
            { title: 'Commercials.', text: "₹17 to 18/sqft with a security deposit the client's terms could accept." },
            {
              title: 'Container operations.',
              text: 'Full 60-foot container access. The nose of a 60-foot trailer extends 10 to 12 feet, so the real turning requirement is 70 to 72 feet of radius, and it has to work inside the premises: turning, docking, reversing.',
            },
            {
              title: 'Parking.',
              text: 'One acre of dedicated truck parking adjacent to the facility, because a distribution hub without truck staging chokes on its own inbound.',
            },
          ],
          proseAfter: [
            'Distance did the first cull. Several options sat 12+ kilometres from the highway, which kills logistics economics before anything else is measured. Anything more than a kilometre off the Nizamabad Highway went out.',
          ],
        },
        {
          label: 'What WareOnGo Did',
          prose: [
            'WareOnGo filtered on operational feasibility first and commercials second, which is the reverse of how the 25-option pile had been assembled. Highway distance eliminated the far properties. Physical verification of container movement, actual turning, docking, and reversing clearance for a 70 to 72 foot radius, eliminated most of the rest. What survived was one property in Yellampet, 100 metres from the Nizamabad Highway.',
            'Then the two hard negotiations. The rate had to come to ₹17 to 18/sqft, which took landlord negotiation over a month and a half. And the client needed an acre of adjacent truck parking, a term other advisors had declined to even negotiate. WareOnGo secured it.',
            'Three months of scouting, a month and a half of negotiation, one approved warehouse.',
          ],
        },
        {
          label: 'The Numbers',
          table: {
            headers: ['Metric', 'Value'],
            rows: [
              { label: 'Options evaluated across all advisors', value: '25' },
              { label: 'Options approved', value: '1' },
              { label: 'Carpet area', value: '55,000 to 62,500 sqft' },
              { label: 'Rate', value: '₹17 to 18/sqft' },
              { label: 'Distance from Nizamabad Highway', value: '100 metres (rejected options: up to 12+ km)' },
              { label: 'Turning radius verified', value: '70 to 72 feet for 60-foot containers' },
              { label: 'Truck parking secured', value: '1 acre adjacent' },
              { label: 'Scouting phase', value: '3 months' },
              { label: 'Negotiation phase', value: '1.5 months' },
            ],
          },
        },
        {
          label: 'The WareOnGo Impact',
          prose: [
            "The logistics and commercial heads of one of India's largest companies acknowledged the result explicitly, and WareOnGo became an approved vendor alongside the four largest CRE firms in the country. Three expansion mandates followed: Pune, Bhiwandi, and Coimbatore.",
          ],
        },
        {
          label: 'Lessons',
          heading: "If you're leasing an automobile warehouse, this deal teaches four things",
          steps: [
            {
              title: 'Verify container movement physically, not on a plan.',
              text: "A 60-foot container's nose extends 10 to 12 feet, making the true turning requirement 70 to 72 feet. Plenty of warehouses that look right on a layout drawing fail when a real trailer tries to reverse into a dock.",
            },
            {
              title: 'Measure highway distance in operating cost.',
              text: 'Options 12+ kilometres from the highway lose money on every truck movement, every day, for the life of the lease. This brief cut everything more than a kilometre off the Nizamabad Highway before discussing rent.',
            },
            {
              title: 'Truck parking is a lease term, negotiate it like one.',
              text: "An acre of adjacent staging space was as important to this operation as the building itself. If an advisor won't put parking on the negotiating table, the operational problem becomes worse.",
            },
            {
              title: 'Carpet area is the number that matters.',
              text: "The brief specified 55,000 to 62,500 sqft of carpet, not built-up area. The difference between the two can be the difference between an operation that fits and one that doesn't.",
            },
          ],
        },
      ],
      faqs: [
        {
          q: 'What does an automobile warehouse in Hyderabad cost?',
          a: "This transaction closed at ₹17 to 18/sqft for 55,000 to 62,500 sqft of carpet area in Yellampet, on the Nizamabad Highway corridor, in line with the client's budget after a month and a half of negotiation.",
        },
        {
          q: 'What should a two-wheeler distribution warehouse have?',
          a: 'Based on this brief: carpet area matched to throughput (here 55,000 to 62,500 sqft), verified 60-foot container maneuverability inside the premises, dedicated truck parking adjacent to the building (here one acre), and highway proximity measured in metres, not kilometres.',
        },
        {
          q: 'How much turning space does a 60-foot container need?',
          a: '70 to 72 feet of turning radius. The trailer nose extends 10 to 12 feet beyond the container, and the clearance has to work for turning, docking, and reversing inside the premises, which is why it must be verified physically.',
        },
        {
          q: 'Why does highway distance matter for a distribution warehouse?',
          a: 'Every kilometre between the warehouse and the highway is fuel, time, and risk on every single truck movement for the lease term. In this evaluation, options 12+ kilometres out were rejected outright; the selected facility is 100 metres from the Nizamabad Highway.',
        },
        {
          q: 'What is the difference between carpet area and built-up area in a warehouse?',
          a: 'Carpet area is the usable floor you can actually rack and operate on; built-up area includes walls and common structures. Briefs from sophisticated occupiers, like this one, specify carpet area so that they pay for the space that they will actually use.',
        },
        {
          q: 'Can a smaller advisor compete with large CRE firms on big mandates?',
          a: "This deal is the proof: four of India's biggest CRE firms worked the same brief, 25 options were evaluated, and the one that passed all four filters came from WareOnGo, which is now an approved vendor for the client alongside those firms. A smaller advisor competes on depth of vetting rather than volume of options: fewer properties, each physically verified against the filters that actually decide the deal.",
        },
      ],
      internalLinks: [
        { label: 'Explore verified warehouses for rent in Hyderabad', to: '/listings/city/hyderabad' },
        { label: 'Blog: Carpet Area vs Built-Up Area in Warehouses', to: '/blogs/carpet-area-vs-built-up-area-warehouse' },
        { label: 'Blog: What Makes a Warehouse Grade A', to: '/blogs/grade-a-warehouse-india' },
        { label: 'Previous case study: FSSAI warehouse in Devanahalli', to: '/casestudies/devanahalli-fssai-warehouse' },
        { label: 'Next case study: Warehouse for rent in Hoskote', to: '/casestudies/hoskote-royal-enfield-warehouse' },
      ],
      cta: {
        text: 'Container access, parking, carpet-area math: we verify all of it physically before you visit. Send us your requirement and get a shortlist within 4 hours.',
        links: [
          { label: 'Browse Hyderabad listings', to: '/listings/city/hyderabad' },
          { label: 'Get My Shortlist in 4 Hours', to: '/request-warehouse' },
        ],
      },
      tags: ['automobile warehouse Hyderabad', 'warehouse Hyderabad Nizamabad Highway', 'container access warehouse India', 'WareOnGo automobile case study'],
    },
  },
  {
    slug: 'hoskote-royal-enfield-warehouse',
    citySlug: 'bengaluru',
    cityLabel: 'Bengaluru',
    number: '05',
    // Deal closed first week of May 2026 per the story timeline.
    published: '2026-06-01',
    updated: '2026-07-29',
    seoTitle: 'Hoskote Warehouse for Rent at ₹19/sqft in a ₹24 Market | WareOnGo',
    metaDescription:
      "A motorcycle maker's logistics partner needed exactly 20,000 sqft in Hoskote at ₹19/sqft with a 2-month deposit. The market said no. Here's how the deal closed in 3 months.",
    previewTitle: 'How WareOnGo Closed a Warehouse for Rent in Hoskote at ₹19/sqft, 5 Rs below the Market Rate.',
    previewSub:
      'Logistics partner of a leading Indian motorcycle manufacturer · 25,000 sqft warehouse, charged for 20,000 · Gate demolished & rebuilt.',
    card: {
      tabLabel: '05 · Hoskote',
      badge: "Deal 05 · Motorcycle Manufacturer's Logistics Partner · Automobile Spare Parts · Hoskote Bangalore",
      title: (
        <>Hoskote, Bangalore — A 20,000 sqft deal<br />in a 24-rupee market. Closed at 19.</>
      ),
      sub: 'Logistics partner of a leading Indian motorcycle manufacturer · Exact 20,000 sqft · Hoskote · February 2026 → Closed May 2026 · Gate demolished and rebuilt',
      metrics: [
        { n: '₹19/sqft', l: 'vs ₹23 to 24 Hoskote market' },
        { n: '25,000 sqft', l: 'warehouse — charged only 20,000' },
        { n: '2 months', l: 'deposit vs 6 to 10 month market norm' },
        { n: '20→35 ft', l: 'gate rebuilt wider for 60-ft containers' },
      ],
      brief: [
        { strong: 'Client:', text: ' Logistics partner of a leading Indian motorcycle manufacturer' },
        { strong: 'Cargo:', text: ' Automobile spare parts' },
        { strong: 'Size:', text: ' Exact 20,000 sqft — no flexibility' },
        { strong: 'Rent budget:', text: ' ₹19/sqft maximum' },
        { strong: 'Deposit:', text: ' 2-month (company standard)' },
        { strong: 'Comparable:', text: ' Same client closed at ₹17 in Hyderabad' },
      ],
      challenge: [
        { strong: 'Hoskote market:', text: ' ₹23 to 24/sqft — ₹4 to 5 above budget' },
        { strong: 'Standard deposit:', text: ' 6 to 10 months — client paying only 2' },
        { strong: 'Entry gate:', text: " Only 20 feet wide — 60-ft container can't enter" },
        { text: 'Required: labour rooms, washrooms, docks, scissor lift, 1,000 sqft office' },
        { text: 'No owner initially willing to modify gate + add full infra at ₹19' },
      ],
      did: [
        { strong: 'Found 25,000 sqft warehouse', text: ' — owner agreed to charge only 20,000' },
        { strong: 'Negotiated 2-month deposit', text: ' in a 6 to 10 month market' },
        { strong: 'Gate demolished and rebuilt', text: ' — widened from 20 ft to 35 ft' },
        { strong: 'Labour rooms + washrooms + loading docks constructed', text: '' },
        { strong: 'Scissor lift installed', text: ' + 1,000 sqft office created' },
        { strong: 'All at the ₹19/sqft', text: ' client had already decided not to exceed' },
      ],
      outcomes: [
        { n: '₹4 to 5/sqft', l: 'Monthly saving below Hoskote market rate' },
        { n: 'Only 20,000', l: 'Paying for less sqft than occupied — unheard of' },
        { n: 'Full infra', l: 'Docks · lift · office · rooms — all done' },
        { n: '3 months', l: 'Feb to May 2026 · Operational and running' },
      ],
      attribution: 'Logistics Partner of a Leading Indian Motorcycle Manufacturer · Automobile Spare Parts · Hoskote, Bangalore',
      follow: '→ Warehouse operational · Relationship continues',
    },
    story: {
      badge: "Case Study 05 · Motorcycle Manufacturer's Logistics Partner · Automobile Spare Parts · Hoskote Bangalore",
      title: 'How WareOnGo Closed a Warehouse for Rent in Hoskote at ₹19/sqft, 5 Rs below the Market Rate.',
      meta: 'Logistics partner of a leading Indian motorcycle manufacturer · Exactly 20,000 sqft · Hoskote, Bangalore · February 2026 → May 2026',
      summary:
        'The logistics partner of a leading Indian motorcycle manufacturer needed exactly 20,000 sqft in Hoskote at ₹19/sqft, when the market rate was ₹23 to 24, with a 2-month security deposit against a market standard of 6 to 10 months. WareOnGo closed all of it in 3 months: a 25,000 sqft facility with rent charged on only the 20,000 sqft used, the entry gate demolished and rebuilt from 20 to 35 feet for 60-foot container access, and labour rooms, washrooms, docks, a scissor lift, and a 1,000 sqft office added, all inside the ₹19/sqft rate.',
      metrics: [
        { n: '₹19/sqft', l: 'vs ₹23 to 24 market' },
        { n: '25,000 sqft', l: 'charged for 20,000' },
        { n: '2 months', l: 'deposit vs 6 to 10' },
        { n: '3 months', l: 'Feb to May 2026' },
      ],
      sections: [
        {
          label: 'At a Glance',
          table: {
            rows: [
              { label: 'Client', value: 'Logistics partner of a leading Indian motorcycle manufacturer (spare parts distribution)' },
              { label: 'Location', value: 'Hoskote, Bangalore' },
              { label: 'Requirement', value: '20,000 sqft' },
              { label: 'Market rate', value: '₹23 to 24/sqft' },
              { label: 'Closed at', value: '₹19/sqft' },
              { label: 'Deposit', value: '2 months (market standard: 6 to 10 months)' },
              { label: 'Space taken', value: '25,000 sqft facility, rent charged on 20,000' },
              { label: 'Gate', value: 'Demolished and rebuilt, 20 feet to 35 feet' },
              { label: 'Timeline', value: 'February 2026 inquiry, closed first week of May 2026' },
            ],
          },
        },
        {
          label: 'The Situation',
          prose: [
            "Motorcycle spare parts distribution runs on corporate terms, and this client, the logistics partner of a leading Indian motorcycle manufacturer, arrived in February 2026 with terms that Hoskote's market had no intention of accepting.",
            "The budget was ₹19/sqft in a market quoting ₹23 to 24. The deposit was 2 months, the client's standard corporate term, in a market that expects 6 to 10. And the size was exactly 20,000 sqft, which is an awkward number in Hoskote: too big for the standard small units, too small for owners to justify investing in modifications.",
            'Then there was the gate. The operation needed 60-foot container access, and the kind of property available had a 20-foot entry gate. A 60-foot trailer needs around 35 feet of clearance to swing in. No gate, no deal, whatever the rent.',
          ],
        },
        {
          label: 'What WareOnGo did, multiple things at once',
          prose: [
            'The size problem got the most creative fix. Rather than hunting for a 20,000 sqft unicorn, WareOnGo found a 25,000 sqft facility and negotiated rent on only the 20,000 sqft the client would use. The client occupies more space than they pay for.',
            'Price and deposit came down to landlord work. The rate landed at ₹19/sqft, which is ₹4 to 5 under the ₹23 to 24 market, roughly an 18 to 22% saving, and the owner accepted the 2-month corporate deposit in place of the usual 6 to 10.',
            'The gate was solved with demolition. The owner agreed to tear down the 20-foot entry and rebuild it at 35 feet, wide enough for 60-foot containers to turn in cleanly.',
            'And the facility gaps were closed inside the rate: labour rooms, washrooms, loading docks, a scissor lift, and a 1,000 sqft built-in office, all delivered without moving the ₹19/sqft number.',
            'Inquiry to closed deal: February to the first week of May 2026. Three months, operational immediately.',
          ],
        },
        {
          label: 'The Numbers',
          table: {
            headers: ['Metric', 'Value'],
            rows: [
              { label: 'Market rate in Hoskote', value: '₹23 to 24/sqft' },
              { label: 'Closed rate', value: '₹19/sqft' },
              { label: 'Saving', value: '₹4 to 5/sqft (roughly 18 to 22%)' },
              { label: 'Space occupied', value: '25,000 sqft' },
              { label: 'Space charged', value: '20,000 sqft' },
              { label: 'Security deposit', value: '2 months (vs 6 to 10 market standard)' },
              { label: 'Gate rebuild', value: '20 feet to 35 feet' },
              { label: 'Container clearance achieved', value: 'Full 60-foot access' },
              { label: 'Office built', value: '1,000 sqft' },
              { label: 'Timeline', value: '3 months (Feb to early May 2026)' },
            ],
          },
        },
        {
          label: 'The WareOnGo Impact',
          prose: [
            "The warehouse went operational immediately on closing, with full 60-foot container clearance, every infrastructure item delivered, and the rent exactly at the client's predetermined ₹19/sqft ceiling.",
          ],
        },
        {
          label: 'Lessons',
          heading: "If you're leasing a warehouse in Hoskote, this deal teaches three things",
          steps: [
            {
              title: 'Seemingly unreasonable demands can be solved with strong relationships.',
              text: 'If your requirement (like 20,000 sqft) sits between market unit sizes, look at larger facilities and negotiate rent on the area you use. Owners with hard-to-let space will structure around a committed tenant. But this depends entirely on the relationship with the owner, and that is where WareOnGo came in: the owner was promised another tenant for the remaining 5,000 sqft, which is what closed the deal. That kind of structure is only possible with cultivated owner relationships.',
            },
            {
              title: 'Structural modifications belong in the deal, not after it.',
              text: 'The 20-foot gate would have quietly killed this operation. It was demolished and rebuilt at 35 feet as a condition of the lease, before possession.',
            },
            {
              title: 'Fit-out items priced separately add up; fold them into the rate.',
              text: 'Labour rooms, washrooms, docks, a scissor lift, and an office all landed inside ₹19/sqft. Every item billed separately would have pushed the effective rate well past the budget the rent was protecting.',
            },
          ],
        },
      ],
      faqs: [
        {
          q: 'What is the warehouse rent in Hoskote?',
          a: 'At the time of this 2026 deal, the Hoskote market quoted ₹23 to 24/sqft. This transaction closed at ₹19/sqft, a saving of ₹4 to 5/sqft, through direct landlord negotiation.',
        },
        {
          q: 'What security deposit do warehouses in Bangalore ask for?',
          a: "The market standard around Hoskote runs 6 to 10 months of rent. This client's corporate terms allowed only 2 months, and the landlord accepted it as part of the overall deal structure.",
        },
        {
          q: 'Will a landlord modify a warehouse before you move in?',
          a: 'If the tenancy justifies it. This owner rebuilt the entry gate and added labour rooms, washrooms, loading docks, a scissor lift, and a 1,000 sqft office, all folded into the ₹19/sqft rate rather than billed separately.',
        },
        {
          q: 'How long does it take to close a warehouse deal in Hoskote?',
          a: 'This one took 3 months from the February 2026 inquiry to closing in the first week of May, including the gate rebuild negotiation and full fit-out agreement, with the warehouse operational immediately after.',
        },
      ],
      internalLinks: [
        { label: 'Explore verified warehouses for rent in Bengaluru', to: '/listings/city/bengaluru' },
        { label: 'Blog: Warehouse Rent in India', to: '/blogs/warehouse-rent-india-guide' },
        { label: 'Blog: What Makes a Warehouse Grade A', to: '/blogs/grade-a-warehouse-india' },
        { label: 'Previous case study: Automobile warehouse in Hyderabad', to: '/casestudies/hyderabad-automobile-warehouse' },
        { label: 'Next case study: Kochi 3PL warehouse', to: '/casestudies/kochi-3pl-warehouse' },
      ],
      cta: {
        text: 'Tight budgets, awkward sizes, gates that need rebuilding: complex briefs are our speciality. Send us your requirement and get a curated shortlist within 4 hours.',
        links: [
          { label: 'Browse Bengaluru listings', to: '/listings/city/bengaluru' },
          { label: 'Get My Shortlist in 4 Hours', to: '/request-warehouse' },
        ],
      },
      tags: ['warehouse for rent in Hoskote', 'warehouse Hoskote Bangalore', 'automobile spare parts warehouse', 'warehouse ₹19/sqft Hoskote', 'WareOnGo Bangalore case study'],
    },
  },
];

export const getCaseStudyBySlug = (slug: string): CaseStudy | undefined =>
  caseStudies.find((c) => c.slug === slug);

export const getCaseStudyIndex = (slug: string): number =>
  caseStudies.findIndex((c) => c.slug === slug);
