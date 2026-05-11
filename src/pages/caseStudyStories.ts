
export type StoryStep = { title: string; text: string };
export type StorySection = {
  label: string;
  heading?: string;
  prose?: string[];
  quote?: string;
  steps?: StoryStep[];
  table?: { metric: string; result: string }[];
  outcomes?: { n: string; l: string }[];
};

export type Story = {
  badge: string;
  title: string;
  meta: string;
  metrics: { n: string; l: string }[];
  sections: StorySection[];
  tags: string[];
  ctaText: string;
  ctaStrong: string;
  ctaBtn: string;
};

export const stories: Story[] = [
  // STORY 0: KOCHI
  {
    badge: 'Case Study 01 · 3PL · Third-Party Logistics · Kerala',
    title: 'How WareOnGo Closed a Kochi Warehouse at ₹22/sqft When the Market Wouldn\'t Move Below ₹24.5',
    meta: '3PL Company · Electrical goods & appliances · June 2024 → November 2024 · Kochi, Kerala',
    metrics: [
      { n: '₹22/sqft', l: 'vs ₹24.5–25 market minimum' },
      { n: '8 visits', l: 'WareOnGo managed all stakeholders' },
      { n: '5 months', l: 'June inquiry to November possession' },
      { n: '5+ follow-on', l: 'Mandates from this single deal' },
    ],
    sections: [
      {
        label: 'The Situation',
        heading: 'A 3PL company needed a warehouse in Kochi by November. The budget was ₹22/sqft. The market said it was impossible.',
        prose: [
          'A third-party logistics company handling operations for one of India\'s largest industrial conglomerates approached WareOnGo in June 2024. They needed a warehouse in Kochi, Kerala — possession required by November. Their budget ceiling was ₹21–22/sqft. Non-negotiable.',
          'The problem: the Kochi warehouse market doesn\'t work that way. Every landlord in the market was quoting ₹24.5–25/sqft minimum. Not one was willing to negotiate below. And no landlord would hold a warehouse for a 3PL with a 6-month forward possession date from a June inquiry.',
        ],
        quote: 'Most brokers would have told the client to increase their budget or look elsewhere. WareOnGo changed the approach entirely.',
      },
      {
        label: 'What Made This Hard',
        heading: 'Five compounding problems that the market hadn\'t solved in 2+ months of searching',
        prose: [
          'No ready-to-move option existed at ₹21–22 — the budget simply didn\'t exist in the Kochi market.',
          'No landlord would hold 6 months in advance — a standard practice in most markets was completely unavailable in Kochi.',
          'Fire NOC, building approvals, building number, GST registration — all had to align precisely with the client\'s notice period.',
          'Kerala labour union issue — a significant operational blocker specific to Kerala.',
          'Three separate stakeholders visited on different trips — Operations Manager, Sales Manager, and VP — each needing independent management.',
        ],
      },
      {
        label: 'What WareOnGo Did — Step by Step',
        heading: 'Five actions that turned an impossible brief into a running warehouse',
        steps: [
          { title: 'Changed the inventory strategy entirely', text: 'Instead of chasing ready-to-move options at ₹24.5+, WareOnGo identified under-construction warehouses that would be ready by November within the ₹22 budget.' },
          { title: 'Tracked all approvals in real time, in parallel', text: 'Fire NOC, building approvals, building number, GST registration — WareOnGo tracked every milestone. All cleared before the client needed to move.' },
          { title: 'Managed all 8 site visits independently', text: 'Operations Manager visit. Sales Manager visit. VP of the end-user conglomerate. WareOnGo handled every one without the process starting over each time.' },
          { title: 'Solved the Kerala labour union problem', text: 'Before handover, WareOnGo identified, negotiated with, and onboarded the right labour contractors. The client received a running warehouse, not a construction site.' },
          { title: 'Closed at ₹22/sqft — ₹2.5–3 below the market floor', text: 'Every commercial term favourable. ₹2.5–3/sqft below what the entire market was offering. Warehouse handed over operationally running.' },
        ],
      },
      {
        label: 'The Numbers',
        table: [
          { metric: 'Rent closed', result: '₹22/sqft' },
          { metric: 'Market asking rate', result: '₹24.5–25/sqft' },
          { metric: 'Monthly saving', result: '₹2.5–3/sqft' },
          { metric: 'Site visits managed by WareOnGo', result: '8' },
          { metric: 'Timeline', result: 'June 2024 → November 2024' },
          { metric: 'Handover type', result: 'Operationally running — labour in place' },
          { metric: 'Follow-on mandates', result: '5+ from the same VP & CEO relationship' },
        ],
      },
      {
        label: 'The Outcome',
        outcomes: [
          { n: '₹2.5–3/sqft saved', l: 'Monthly saving vs. every other option in the market' },
          { n: 'Operational Day 1', l: 'Labour sorted. Warehouse running. No gap between old and new.' },
          { n: '5+ follow-on deals', l: 'VP of end user + CEO of 3PL gave 5 more requirements immediately after' },
          { n: 'Compounding trust', l: 'One deal done right became five more. Performance compounds.' },
        ],
        quote: 'The VP of the end-user company and the CEO of the 3PL company both walked away satisfied — not just with the deal, but with the execution. Within months, WareOnGo received 5 more requirements directly from the same relationship.',
      },
    ],
    tags: ['warehouse in Kochi', '3PL warehouse Kerala', 'warehouse at ₹22/sqft Kochi', 'fire NOC warehouse Kerala', 'Kerala warehouse advisory', 'WareOnGo Kochi case study'],
    ctaText: 'Looking for a warehouse in Kerala or any other hard market?',
    ctaStrong: 'WareOnGo works specifically in the markets where others give up.',
    ctaBtn: 'Get a shortlist →',
  },
  // STORY 1: HYDERABAD FIRE
  {
    badge: 'Case Study 02 · Manufacturer · Fire Compliance · Telangana',
    title: '22 Properties Screened. 6 Shortlisted. One Fire-Compliant Warehouse Closed in Hyderabad at ₹18.5/sqft.',
    meta: 'Manufacturer · 35,000 sqft (2 warehouses) → 50,000 sqft fire-compliant · Devarayamjal, Hyderabad',
    metrics: [
      { n: '₹18.5/sqft', l: 'vs ₹21 asking' },
      { n: '22 screened', l: '6 shortlisted' },
      { n: '45 days', l: 'rent-free negotiated' },
      { n: '~₹90L', l: '5-year savings' },
    ],
    sections: [
      {
        label: 'The Situation',
        heading: '2 months of searching. Zero fire-compliant options. Then WareOnGo closed one at ₹18.5 — 12% below asking.',
        prose: [
          'A manufacturer operating two warehouses — 20,000 sqft and 15,000 sqft — needed to consolidate into a single 50,000 sqft facility. After a fire incident at their Bhiwandi facility, their legal compliance team issued a firm directive: the new warehouse must have a Fire NOC. No exceptions.',
          'The client spent over two months searching independently. They found nothing that met the compliance standard in the required size range.',
        ],
      },
      {
        label: 'What WareOnGo Did — Step by Step',
        steps: [
          { title: 'Legal due diligence on 22 properties', text: 'WareOnGo conducted a thorough check of land titles, ownership, and fire NOC eligibility for 22 properties in Devarayamjal ranging from 50,000 to 60,000 sqft.' },
          { title: 'Shortlisted 6 — eliminated 16', text: 'From 22, six properties met the eligibility criteria. WareOnGo had already eliminated 16 — saving weeks of due diligence time.' },
          { title: 'Worked directly with the fire department', text: 'WareOnGo spoke directly with the fire department and fire inspector to understand exact compliance requirements.' },
          { title: 'Drove the full compliance process', text: 'Fire hydrants installed. Fire inspector visit arranged. NOC secured. WareOnGo managed the entire compliance verification from start to finish.' },
          { title: '₹18.5/sqft + 45 days rent-free', text: '₹18.5/sqft — on the main road — ₹2.5/sqft below market. 45 days rent-free negotiated for relocation and epoxy flooring.' },
        ],
      },
      {
        label: 'The Numbers',
        table: [
          { metric: 'Properties screened', result: '22' },
          { metric: 'Properties shortlisted', result: '6 (all fire-compliant)' },
          { metric: 'Size closed', result: '50,000 sqft' },
          { metric: 'Rent closed', result: '₹18.5/sqft' },
          { metric: 'Market asking rate', result: '₹21/sqft' },
          { metric: 'Monthly saving', result: '₹2.5/sqft = ₹1,25,000/month' },
          { metric: '5-year lease saving', result: '~₹90 lakhs' },
          { metric: 'Rent-free negotiated', result: '45 days' },
          { metric: 'Pre-WareOnGo search', result: '2+ months · zero compliant options' },
          { metric: 'Follow-on mandates', result: '3 — Chennai · Bangalore · Delhi' },
        ],
      },
      {
        label: 'The Outcome',
        outcomes: [
          { n: '₹1,25,000/month', l: 'Absolute monthly saving on 50,000 sqft at ₹2.5/sqft delta' },
          { n: '~₹90 lakhs', l: 'Savings over 5-year lease horizon' },
          { n: '100% compliant', l: 'Legal team signed off — zero fire compliance risk' },
          { n: '3 new cities', l: 'Chennai · Bangalore · Delhi mandates given immediately after' },
        ],
      },
    ],
    tags: ['fire compliant warehouse Hyderabad', 'fire NOC warehouse Devarayamjal', 'warehouse Hyderabad ₹18/sqft', 'warehouse compliance India', 'WareOnGo Hyderabad'],
    ctaText: 'Facing a compliance-first warehouse requirement?',
    ctaStrong: 'Fire NOC, GDP, FSSAI — WareOnGo handles the briefs others avoid.',
    ctaBtn: 'Talk to us →',
  },
  // STORY 2: DEVANAHALLI
  {
    badge: 'Case Study 03 · Food Manufacturer · FSSAI + Vastu + BTS · Bangalore North',
    title: 'Vastu Compliant. 250KW Power. FSSAI Certified. And a Rent-Free Extension When Machinery Got Stuck in the Strait of Hormuz.',
    meta: 'Premium Food Manufacturer · 3–5 star hotel supply chain · July 2024 → January 2026 signing → April 2026 full operations · Devanahalli, Bangalore',
    metrics: [
      { n: '₹27/sqft', l: 'incl. 250KW power' },
      { n: '6 months', l: 'on-ground scouting' },
      { n: '3.5 months', l: 'rent-free secured' },
      { n: '18 hrs/day', l: 'factory at capacity' },
    ],
    sections: [
      {
        label: 'The Situation',
        heading: 'The most complex warehouse brief WareOnGo has ever closed.',
        prose: [
          'A premium food manufacturer supplying organic produce, seasonal fruits, and noodles to every three-star, four-star, and five-star hotel in Karnataka needed a factory-grade space in Devanahalli, Bangalore. Five simultaneous requirements: Vastu-compliant with east-facing entry, 250KW power supply, FSSAI certification, full BTS fit-out — and no internal logistics team to manage any of it.',
        ],
        quote: 'After visiting 6 warehouses, not one had the east-facing orientation required. WareOnGo\'s team went fully on-ground — speaking to hundreds of individual warehouse owners across the Devanahalli corridor over months.',
      },
      {
        label: 'The Five Layers of Difficulty',
        steps: [
          { title: 'Vastu compliance', text: 'East-facing entry — non-negotiable cultural mandate. After 6 warehouse visits, zero had the correct orientation.' },
          { title: '250KW power', text: 'Standard warehouses in Devanahalli are built for 100–200KW. 250KW requires a transformer upgrade costing ₹75L–1Cr. Most owners refused.' },
          { title: 'FSSAI compliance', text: 'Chemical treatment, specific floor specs, pest-controlled perimeter, insulation — requirements most Devanahalli landlords had never encountered.' },
          { title: 'No internal team', text: 'The client had no warehousing or logistics function. WareOnGo was designing, fitting out, and handing over a fully operational factory.' },
          { title: 'The Strait of Hormuz', text: 'At signing in January 2026, machinery was held in the Strait of Hormuz due to the Iran-Israel conflict. WareOnGo negotiated an additional 45 days mid-deal.' },
        ],
      },
      {
        label: 'The Numbers',
        table: [
          { metric: 'Inquiry date', result: 'July 2024' },
          { metric: 'Agreement signed', result: 'January 2026' },
          { metric: 'Full operations', result: 'April 2026' },
          { metric: 'Rent closed', result: '₹27/sqft inclusive of 250KW power' },
          { metric: '250KW power infrastructure value', result: '₹75 lakh – ₹1 crore' },
          { metric: 'Rent-free at signing', result: '3 months (January–March 2026)' },
          { metric: 'Hormuz extension', result: '45 additional days' },
          { metric: 'Total rent-free secured', result: '3.5 months' },
          { metric: 'Factory operating hours', result: '18 hours/day at full capacity' },
        ],
      },
      {
        label: 'The Outcome',
        prose: [
          'The factory is operational 18 hours a day at full capacity. All machinery is installed. 250KW power is live. The facility is FSSAI certified. The client handed all future warehousing and logistics requirements entirely to WareOnGo. Not because we asked. Because we delivered.',
        ],
      },
    ],
    tags: ['warehouse Devanahalli Bangalore', 'FSSAI warehouse Bangalore', 'Vastu compliant warehouse Devanahalli', '250KW warehouse Bangalore North', 'factory setup Devanahalli'],
    ctaText: 'Building a factory or food-grade facility?',
    ctaStrong: 'If your brief involves power, Vastu, FSSAI, or compliance — WareOnGo has done it.',
    ctaBtn: 'Discuss your requirement →',
  },
  // STORY 3: HYDERABAD AUTO
  {
    badge: 'Case Study 04 · Automobile Manufacturer · Logistics Warehouse · Hyderabad',
    title: 'India\'s Largest Two-Wheeler Brand Had Four of the Biggest CRE Firms Working on One Brief. They Chose WareOnGo.',
    meta: 'Automobile Manufacturer · 55,000–62,500 sqft · Nizamabad Highway · July 2025 · Approved vendor status achieved',
    metrics: [
      { n: '25 → 1', l: 'Options filtered' },
      { n: '100 metres', l: 'From highway' },
      { n: '1 acre', l: 'Parking secured' },
      { n: '3 mandates', l: 'Expansion active' },
    ],
    sections: [
      {
        label: 'The Situation',
        heading: 'Four large CRE firms showed 25 options. WareOnGo showed one. The only one that worked.',
        prose: [
          'India\'s largest two-wheeler motorcycle manufacturer floated a warehouse requirement in Hyderabad in July 2025: 55,000 to 62,500 sqft, budget ₹17–18/sqft, location on the Nizamabad Highway. The requirement was open for three months.',
          'Four of India\'s largest commercial real estate firms were working this mandate simultaneously. Their approach: present all 25 warehouse options in the market that matched the size criteria. WareOnGo asked one question first: which of these 25 can actually accept a 60-foot container on the Nizamabad Highway?',
        ],
        quote: 'A 60-foot container with its nose adds another 10–12 feet. Total turning radius needed: 70–72 feet. Most of the 25 options were 12+ kilometres inside from the highway.',
      },
      {
        label: 'The Four Filters',
        steps: [
          { title: 'Road accessibility for 60-ft containers', text: 'Eliminated all options more than a kilometre from the Nizamabad Highway. Container movement requires clear turning radius, cable clearance, and road width.' },
          { title: 'Commercial terms', text: 'Eliminated all options where landlords would not match the ₹17–18/sqft budget and security deposit terms.' },
          { title: 'Internal container movement', text: 'Verified that 60-foot containers can move freely inside the warehouse — turning, docking, reversing.' },
          { title: '1-acre truck parking', text: 'The client needed 1 acre of truck parking adjacent to the warehouse. Every other firm refused to negotiate this. WareOnGo secured it.' },
        ],
      },
      {
        label: 'The Numbers',
        table: [
          { metric: 'Total options in Hyderabad market', result: '25' },
          { metric: 'After WareOnGo filtering', result: '1 — Yellampet, 100m from Nizamabad Highway' },
          { metric: 'Distance of other options from highway', result: '12+ kilometres' },
          { metric: 'Size closed', result: '55,000–62,500 sqft carpet area' },
          { metric: 'Rent closed', result: '₹17–18/sqft — within client budget' },
          { metric: 'Parking area secured', result: '1 acre — others refused to negotiate' },
          { metric: 'Total deal timeline', result: '3 months scouting + 1.5 months negotiation' },
          { metric: 'Vendor status', result: 'Approved vendor alongside India\'s 4 largest CRE firms' },
          { metric: 'Expansion mandates active', result: '3 — Pune · Bhiwandi · Coimbatore' },
        ],
      },
      {
        label: 'Why This Matters',
        prose: [
          'The four largest CRE firms in India — with far greater resources and brand recognition — presented 25 options and left the decision to the client. WareOnGo presented one. The only one that worked.',
          'The logistics and commercials heads of one of India\'s largest companies acknowledged this explicitly. WareOnGo is now an active vendor for a company that had worked exclusively with India\'s top 4 commercial real estate firms for decades.',
        ],
      },
    ],
    tags: ['warehouse Hyderabad Nizamabad Highway', 'automobile warehouse Hyderabad', 'container access warehouse India', 'WareOnGo automobile case study'],
    ctaText: 'Looking for a warehouse with specific access or infrastructure requirements?',
    ctaStrong: 'WareOnGo applies the right filters before you visit a single property.',
    ctaBtn: 'Get filtered options →',
  },
  // STORY 4: HOSKOTE
  {
    badge: 'Case Study 05 · Royal Enfield Logistics Partner · Automobile Spare Parts · Hoskote Bangalore',
    title: 'A ₹19/sqft Deal in a ₹24 Market. A Gate Demolished. And Rent Charged on Less Space Than Occupied.',
    meta: 'Royal Enfield\'s Logistics Partner · Exactly 20,000 sqft · Hoskote, Bangalore · February 2026 → May 2026',
    metrics: [
      { n: '₹19/sqft', l: 'vs ₹23–24 market' },
      { n: '25,000 sqft', l: 'charged for 20,000' },
      { n: '2 months', l: 'deposit vs 6–10' },
      { n: '3 months', l: 'Feb to May 2026' },
    ],
    sections: [
      {
        label: 'The Situation',
        heading: 'Most advisors would have told this client ₹19/sqft in Hoskote was not possible. WareOnGo closed it — and demolished a gate in the process.',
        prose: [
          'The logistics partner of one of India\'s most iconic motorcycle brands came to WareOnGo in February 2026: exactly 20,000 sqft in Hoskote, Bangalore, budget ₹19/sqft, 2-month security deposit.',
          'Hoskote runs ₹23–24/sqft. Security deposits are 6–10 months. 20,000 sqft is a problematic size — large enough to need container access, small enough that owners resist investing in modifications. WareOnGo closed all four gaps simultaneously.',
        ],
      },
      {
        label: 'What WareOnGo Did — Six Things at Once',
        steps: [
          { title: 'Found a 25,000 sqft warehouse and got the owner to charge only 20,000', text: 'Paying for less space than you physically occupy essentially does not happen in the Indian warehouse market. It happened here because of the relationship WareOnGo had built with the landlord.' },
          { title: 'Negotiated 2-month deposit in a 6–10 month market', text: 'The client\'s standard terms are 2 months. Hoskote\'s standard is 6–10 months. WareOnGo convinced the owner to accept the client\'s terms.' },
          { title: 'Demolished and rebuilt the entry gate', text: 'The warehouse entry was 20 feet wide. A 60-foot container needs at least 35 feet to turn. WareOnGo convinced the owner to demolish the gate and rebuild it wider — from 20 feet to 35 feet.' },
          { title: 'Full infrastructure delivered at the same rental', text: 'Labour rooms constructed. Washrooms built. Loading docks created. Scissor lift installed. 1,000 sqft office created inside the warehouse footprint. All at ₹19/sqft.' },
        ],
      },
      {
        label: 'The Numbers',
        table: [
          { metric: 'Inquiry date', result: 'February 2026' },
          { metric: 'Deal closed', result: 'May 2026 (first week)' },
          { metric: 'Size required', result: 'Exactly 20,000 sqft' },
          { metric: 'Warehouse found', result: '25,000 sqft — charged only 20,000' },
          { metric: 'Rent closed', result: '₹19/sqft' },
          { metric: 'Hoskote market rate', result: '₹23–24/sqft' },
          { metric: 'Security deposit', result: '2 months (vs 6–10 standard)' },
          { metric: 'Entry gate', result: 'Demolished and rebuilt — 20 ft → 35 ft' },
          { metric: 'Infrastructure added', result: 'Docks · Scissor lift · Labour rooms · Washrooms · 1,000 sqft office' },
          { metric: 'Container access', result: 'Full 60-foot clearance achieved' },
        ],
      },
      {
        label: 'The Outcome',
        prose: [
          'The deal closed in May 2026, 3 months after the inquiry. The warehouse is operational. Full 60-foot container access. Every infrastructure requirement delivered. At the rental the client had already decided they would not exceed.',
        ],
      },
    ],
    tags: ['warehouse Hoskote Bangalore', 'automobile spare parts warehouse', 'warehouse ₹19/sqft Hoskote', 'WareOnGo Bangalore case study'],
    ctaText: 'Is your brief in a tight market with non-standard terms?',
    ctaStrong: 'WareOnGo closes the gaps others say can\'t be closed.',
    ctaBtn: 'Share your requirement →',
  },
];
