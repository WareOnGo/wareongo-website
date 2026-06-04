// Informational guides — deliberately "hidden": not linked from the navbar or
// footer, but present in sitemap.xml and llms.txt so search engines and AI
// assistants can find and cite them. Each guide targets informational queries
// (e.g. "PEB vs RCC warehouse") that transactional listing pages can't rank for.
//
// Content is structured (blocks + FAQs) so the renderer stays simple and the
// FAQPage JSON-LD is generated from the same source of truth as the visible Q&A.

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideTable {
  headers: string[];
  rows: string[][];
}

export type GuideBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; table: GuideTable };

export interface Guide {
  slug: string;
  /** On-page H1 */
  title: string;
  /** <title> tag */
  seoTitle: string;
  /** Meta description */
  description: string;
  /** Direct answer shown in the "In short" callout — first thing AI engines extract. */
  summary: string;
  /** ISO date — rendered on page and used as Article dateModified. */
  updated: string;
  blocks: GuideBlock[];
  faqs: GuideFaq[];
  /** Slugs of related guides, rendered as cross-links. */
  related: string[];
}

export const guides: Guide[] = [
  // ---------------------------------------------------------------------------
  {
    slug: 'peb-vs-rcc-warehouse',
    title: 'PEB vs RCC Warehouse: Which Should You Lease in India?',
    seoTitle: 'PEB vs RCC Warehouse — Differences, Costs & Which to Lease | WareOnGo',
    description:
      'PEB (pre-engineered building) vs RCC warehouse compared: construction, clear height, cost, fire safety, and which suits 3PL, e-commerce, manufacturing or cold storage.',
    summary:
      'PEB (pre-engineered building) warehouses are steel structures — faster to build, cheaper per sqft at scale, with higher clear heights and wider column-free spans, making them the default for modern Grade A logistics. RCC (reinforced cement concrete) warehouses are concrete structures — slower and costlier to build but better suited to multi-storey use, heavy point loads, and in-city locations. For most leasing decisions: large single-storey distribution → PEB; small in-city godown or multi-floor use → RCC.',
    updated: '2026-06-04',
    blocks: [
      {
        kind: 'p',
        text: 'Almost every warehouse listed in India is described as either PEB or RCC. The label refers to how the structure is built, but it has practical consequences for the tenant: clear height, racking density, fire-safety design, ambient temperature, and rent. This guide explains both, compares them point by point, and tells you which to shortlist for your use case.',
      },
      { kind: 'h2', text: 'What is a PEB warehouse?' },
      {
        kind: 'p',
        text: 'A pre-engineered building (PEB) is a steel structure whose columns, rafters and purlins are designed and fabricated off-site in a factory, then bolted together on a concrete plinth at the site. The roof and walls are metal sheeting (usually colour-coated galvalume), often with insulation and polycarbonate skylights. Because the steel frame carries the load, PEB sheds achieve wide column-free spans — typically 20–30 m between columns, and far more with trusses — and eaves heights of 9–13.5 m.',
      },
      {
        kind: 'ul',
        items: [
          'Construction time: typically 4–6 months for a standard big-box shed — roughly 2–3× faster than equivalent RCC.',
          'Clear height: commonly 9–13.5 m at eaves, enabling 4–6 racking levels (VNA racking goes higher).',
          'Spans: wide column-free grids, so racking layouts and material-handling routes are flexible.',
          'Expansion: bays can be added lengthwise later — useful for build-to-suit campuses.',
          'Almost all Grade A logistics parks in India (NH-48 Bengaluru, Bhiwandi, Chakan, Farukhnagar, Hosur) are PEB.',
        ],
      },
      { kind: 'h2', text: 'What is an RCC warehouse?' },
      {
        kind: 'p',
        text: 'A reinforced cement concrete (RCC) warehouse uses cast-in-place concrete columns, beams and slabs. It is the construction style of most older godowns, in-city storage buildings and any multi-storey warehouse. RCC structures take longer to build and cost more per square foot of covered area for large single-storey footprints, but concrete brings real advantages: high inherent fire resistance, better thermal mass (cooler interiors without insulation), and the ability to carry upper floors.',
      },
      {
        kind: 'ul',
        items: [
          'Construction time: typically 12–18 months for a comparable footprint.',
          'Clear height: usually 4.5–8 m per floor — lower than PEB, limiting vertical racking.',
          'Multi-storey: the only practical option for G+1/G+2 warehousing in land-scarce city locations.',
          'Fire: concrete is non-combustible with high fire ratings by default; steel needs applied fire protection and sprinklers to match.',
          'Temperature: thicker thermal mass keeps interiors cooler — relevant for commodities sensitive to heat.',
        ],
      },
      { kind: 'h2', text: 'PEB vs RCC: side-by-side comparison' },
      {
        kind: 'table',
        table: {
          headers: ['Factor', 'PEB warehouse', 'RCC warehouse'],
          rows: [
            ['Structure', 'Factory-fabricated steel frame, metal sheeting', 'Cast-in-place concrete frame and slabs'],
            ['Typical clear height', '9–13.5 m at eaves', '4.5–8 m per floor'],
            ['Column-free span', 'Wide (20–30 m+); flexible racking', 'Narrower grids; columns interrupt layout'],
            ['Construction time', '4–6 months', '12–18 months'],
            ['Shell cost at scale', 'Lower per sqft for large single-storey boxes', 'Higher for the same footprint'],
            ['Multi-storey', 'Rare (mezzanines only)', 'Standard (G+1, G+2 common in cities)'],
            ['Fire resistance', 'Steel loses strength in fire; needs sprinklers/fire-rated design', 'Inherently high fire rating'],
            ['Heat inside', 'Hotter unless roof is insulated', 'Cooler due to thermal mass'],
            ['Typical use', 'Grade A logistics, 3PL, e-commerce fulfilment, light manufacturing', 'In-city godowns, cold storage shells, multi-floor storage, heavy industry'],
            ['Where you find them', 'Highway logistics corridors and industrial parks', 'City peripheries, older industrial areas, urban godown clusters'],
          ],
        },
      },
      { kind: 'h2', text: 'Which should you lease?' },
      { kind: 'h3', text: 'Choose PEB if…' },
      {
        kind: 'ul',
        items: [
          'You need 20,000+ sqft of single-storey space for distribution, fulfilment or 3PL operations.',
          'You rack vertically — pallet racking beyond 3 levels effectively requires 9 m+ clear height.',
          'Dock operations matter: modern PEB parks come with dock levellers, large truck courts and container access.',
          'You want Grade A compliance (sprinklers, FM-grade flooring, insurance-friendly construction) — the Grade A supply in India is overwhelmingly PEB.',
        ],
      },
      { kind: 'h3', text: 'Choose RCC if…' },
      {
        kind: 'ul',
        items: [
          'You need a small (2,000–15,000 sqft) godown inside city limits for last-mile or dark-store operations — in-city stock is mostly RCC.',
          'Your goods are heat-sensitive and the budget does not stretch to an insulated PEB.',
          'You need upper floors, or heavy point loads such as machine foundations.',
          'The micro-market you must be in simply has no PEB supply — many older industrial areas are entirely RCC.',
        ],
      },
      {
        kind: 'p',
        text: 'In practice the decision is usually made by the micro-market: highway logistics corridors offer PEB, urban godown clusters offer RCC, and the right answer is the building that puts you closest to your demand at a workable rent. Listing pages on WareOnGo are segmented by construction type per city, so you can compare actual PEB and RCC availability side by side before deciding.',
      },
    ],
    faqs: [
      {
        q: 'What does PEB stand for in warehousing?',
        a: 'PEB stands for pre-engineered building — a steel structure whose frame is fabricated in a factory and bolted together on site. Most modern Grade A warehouses in India are PEB.',
      },
      {
        q: 'Is PEB cheaper than RCC?',
        a: 'For large single-storey warehouses, yes — a PEB shell is typically cheaper per sqft and 2–3× faster to build than equivalent RCC. For small buildings or multi-storey structures the gap narrows or reverses.',
      },
      {
        q: 'Is an RCC warehouse safer in a fire?',
        a: 'Concrete is non-combustible and holds strength in fire far longer than unprotected steel, so RCC has an inherent advantage. A sprinklered, fire-NOC-compliant PEB is considered safe for insurance and regulatory purposes — what matters is the fire systems, not just the frame material.',
      },
      {
        q: 'What clear height do I need for pallet racking?',
        a: 'As a rule of thumb, each pallet racking level needs roughly 1.8–2 m. A 6 m RCC godown fits about 3 levels; a 12 m PEB fits 5–6. If your storage plan is vertical, the PEB premium usually pays for itself in cube utilisation.',
      },
    ],
    related: ['grade-a-warehouse-india', 'warehouse-rent-india-guide'],
  },

  // ---------------------------------------------------------------------------
  {
    slug: 'grade-a-warehouse-india',
    title: 'What Is a Grade A Warehouse in India? Grade A vs B vs C Explained',
    seoTitle: 'Grade A Warehouse Meaning in India — Grade A vs B vs C | WareOnGo',
    description:
      'What qualifies as a Grade A warehouse in India: clear height, FM2 flooring, docks, fire systems. Grade A vs Grade B vs Grade C compared, with typical rent impact.',
    summary:
      'A Grade A warehouse in India is a modern, institutionally built facility with roughly 10–12 m clear height, FM2-grade flat flooring rated around 5–7 tonnes/sqm, dock levellers (about one per 10,000 sqft), sprinkler and hydrant fire systems, a 30 m+ truck court, insulated roofing with skylights, and full statutory compliance. Grade B is functional but misses several of these specs; Grade C is basic godown stock. Grade A commands a rent premium of roughly 20–40% over Grade B in the same micro-market, which efficient cube utilisation and lower operating risk often offset.',
    updated: '2026-06-04',
    blocks: [
      {
        kind: 'p',
        text: 'There is no statutory definition of "Grade A" in India — the grading is a market convention used by industrial real-estate consultants, developers and occupiers. But the convention is consistent enough that the label carries real meaning in lease negotiations, insurance underwriting and operations planning. This guide lays out the accepted specification, contrasts grades A, B and C, and explains when paying the Grade A premium is rational.',
      },
      { kind: 'h2', text: 'The Grade A specification' },
      {
        kind: 'ul',
        items: [
          'Clear height: 10–12 m at eaves (some new parks go higher), enabling 5–6 racking levels.',
          'Flooring: FM2-category flatness, trimix/VDF concrete, load rating around 5–7 tonnes/sqm — required for VNA forklifts and high racking.',
          'Docks: dock levellers at roughly 1 per 10,000 sqft, dock height ~1.2 m, sectional doors, dock shelters in newer parks.',
          'Fire: sprinklers throughout (ESFR in newer builds), hydrant ring main, fire NOC in place, adequate water storage.',
          'Truck court: 30 m+ apron depth so 40-ft containers can dock and turn without blocking circulation.',
          'Structure: PEB with insulated roof, ~3–5% skylights for daylight, ventilation (ridge vents/louvres).',
          'Power & utilities: sanctioned power adequate for MHE charging and lighting, DG backup provision, borewell/water connection.',
          'Compliance & title: clean land title, approved building plan, occupancy certificate, CLU/industrial land use — institutionally developed parks come pre-papered.',
          'Site: gated campus, 24×7 security, weighbridge in larger parks, driver amenities, increasingly solar rooftops and ESG certifications.',
        ],
      },
      { kind: 'h2', text: 'Grade A vs Grade B vs Grade C' },
      {
        kind: 'table',
        table: {
          headers: ['Attribute', 'Grade A', 'Grade B', 'Grade C'],
          rows: [
            ['Clear height', '10–12 m+', '6–9 m', 'Under 6 m'],
            ['Flooring', 'FM2 flat, 5–7 t/sqm', 'Plain VDF/trimix, uneven possible', 'Basic PCC, undulating'],
            ['Docks', 'Levellers ~1/10,000 sqft', 'Raised platform, few or no levellers', 'Ground-level loading only'],
            ['Fire systems', 'Sprinklers + hydrants + NOC', 'Extinguishers/hydrants, NOC varies', 'Often non-compliant'],
            ['Construction', 'New PEB, insulated', 'Older PEB or good RCC', 'Old RCC/sheds'],
            ['Compliance paperwork', 'Complete, institutional', 'Mostly available', 'Frequently incomplete'],
            ['Typical occupiers', 'E-commerce, 3PL, FMCG, auto', 'Regional distribution, SMEs', 'Local traders, overflow storage'],
            ['Indicative rent vs Grade B', '+20–40%', 'Baseline', '−20–40%'],
          ],
        },
      },
      { kind: 'h2', text: 'Is the Grade A premium worth it?' },
      {
        kind: 'p',
        text: 'Run the comparison on cost per pallet position, not cost per square foot. A 12 m Grade A box racked 5-high can hold roughly twice the pallets of a 6 m Grade B shed of the same footprint — so even at a 30% rent premium, the Grade A facility is often cheaper per unit stored. Add the harder-to-quantify items: lower fire-insurance friction, fewer compliance surprises at licence time, faster truck turnaround at proper docks, and MHE that works on flat floors.',
      },
      {
        kind: 'p',
        text: 'Grade A stops making sense when the operation cannot use the cube: ground-stacked goods, slow-moving inventory, very small footprints, or pure last-mile nodes where proximity beats specification. For dark stores and city fulfilment, a compliant Grade B RCC godown at the right pin code routinely beats a Grade A box 40 km away.',
      },
      { kind: 'h2', text: 'How to verify a "Grade A" claim' },
      {
        kind: 'ol',
        items: [
          'Measure clear height at the lowest obstruction (sprinkler pipes, ducts), not at the ridge.',
          'Ask for the floor specification — flatness category and load rating in t/sqm — in writing.',
          'Count the dock levellers and check apron depth against a 40-ft container turning circle.',
          'Inspect the fire NOC, sprinkler coverage and the water tank capacity, not just the hardware.',
          'Check the paperwork: building approval, occupancy certificate, land-use conversion. A great shed on unconverted land is not Grade A in any way that protects you.',
        ],
      },
      {
        kind: 'p',
        text: 'Every listing on WareOnGo is physically inspected and its specifications and compliances validated before it goes live, so grade claims are verified rather than self-declared.',
      },
    ],
    faqs: [
      {
        q: 'What is the minimum clear height for a Grade A warehouse?',
        a: 'Market convention in India puts Grade A clear height at roughly 10–12 m at the eaves. Anything below about 9 m is generally marketed as Grade B regardless of other specifications.',
      },
      {
        q: 'Is there an official Grade A certification in India?',
        a: 'No. Warehouse grading is a market convention, not a statutory standard — which is why specifications should be verified line by line during diligence rather than taken from the brochure.',
      },
      {
        q: 'How much more expensive is Grade A?',
        a: 'Typically a 20–40% rent premium over Grade B in the same micro-market. Measured per pallet position rather than per sqft, Grade A often comes out cheaper because of vertical storage.',
      },
      {
        q: 'What is FM2 flooring?',
        a: 'FM2 is a floor-flatness category (from the UK TR34 standard, widely referenced in India) indicating a high-tolerance flat floor. It matters because high racking and VNA forklifts need flat, jointed concrete to operate safely at height.',
      },
    ],
    related: ['peb-vs-rcc-warehouse', 'warehouse-rent-india-guide'],
  },

  // ---------------------------------------------------------------------------
  {
    slug: 'warehouse-compliance-checklist-india',
    title: 'Warehouse Compliance Checklist for India: Licences, NOCs & Lease Paperwork',
    seoTitle: 'Warehouse Compliance Checklist India — Fire NOC, GST, Licences | WareOnGo',
    description:
      'Every licence and document needed to lease and operate a warehouse in India: fire NOC, building OC, land-use conversion, GST additional place of business, FSSAI, pollution consents, lease registration.',
    summary:
      'To lease and operate a warehouse in India you need to verify the landlord\'s papers (clean title, approved building plan, occupancy certificate, industrial/warehouse land-use, fire NOC) and then obtain your own registrations: GST additional place of business, trade licence, shops & establishments registration, plus sector-specific licences such as FSSAI for food, drug licence for pharma, or pollution-board consents for chemicals. Leases longer than 11 months must be stamped and registered. Missing any one of these can stall operations, invalidate insurance, or block input-tax credit.',
    updated: '2026-06-04',
    blocks: [
      {
        kind: 'p',
        text: 'Compliance is where Indian warehouse deals slip their timelines. The shed may be ready, but if the fire NOC is pending or the land was never converted from agricultural use, you cannot legally stock goods — and your insurer may decline a claim even if you do. This checklist covers the three layers: documents the landlord must hold, registrations the tenant must obtain, and the lease formalities that make the contract enforceable.',
      },
      { kind: 'h2', text: 'Layer 1 — Verify the landlord\'s documents before signing' },
      {
        kind: 'ul',
        items: [
          'Title documents and encumbrance certificate — confirm the lessor actually owns (or has rights to lease) the property, with no undisclosed mortgage that could disrupt your tenancy.',
          'Land-use status — the land must be converted/zoned for industrial or warehousing use (CLU/NA conversion depending on the state). Warehouses on unconverted agricultural land are a common and serious red flag.',
          'Sanctioned building plan and occupancy/completion certificate — the structure you are leasing should match the approved plan.',
          'Fire NOC from the state fire department — required for warehouses above state-specific thresholds of height and area; verify it covers the actual building and is current, as NOCs require periodic renewal.',
          'Property tax receipts and electricity/water connections in order — arrears surface later as disconnection threats.',
          'Structural stability certificate where the building is older — some municipal licences ask for it.',
        ],
      },
      { kind: 'h2', text: 'Layer 2 — Registrations the tenant needs to operate' },
      {
        kind: 'ul',
        items: [
          'GST — add the warehouse as an "additional place of business" on your GST registration in that state (a new GSTIN if you have no prior registration in the state). Without it, stocking goods there is non-compliant and e-way bill movements to the site will not reconcile.',
          'Trade licence from the local municipal body, where applicable to storage/commercial activity.',
          'Shops & Establishments Act registration for the premises if staff are employed there (state-specific).',
          'Labour-law registrations as headcount grows: EPF, ESI, and the Contract Labour (Regulation & Abolition) Act if you deploy contract workers above the threshold.',
          'Legal metrology registration if you repack or declare weights/measures at the facility.',
        ],
      },
      { kind: 'h3', text: 'Sector-specific licences' },
      {
        kind: 'table',
        table: {
          headers: ['If you store…', 'You need…'],
          rows: [
            ['Food, beverages, nutraceuticals', 'FSSAI licence for the storage premises (state or central licence depending on turnover)'],
            ['Pharmaceuticals', 'Drug licence (wholesale/storage) from the state drug control authority; temperature mapping for cold chain'],
            ['Chemicals, batteries, anything with effluents or hazardous classification', 'State Pollution Control Board consent to establish/operate; PESO licence for petroleum/explosives classes'],
            ['Insecticides/pesticides', 'Licence under the Insecticides Act from the state agriculture department'],
            ['Imported goods under bond', 'Customs bonded warehouse licence under the Customs Act'],
            ['Agri commodities for negotiable receipts', 'WDRA registration of the warehouse'],
          ],
        },
      },
      { kind: 'h2', text: 'Layer 3 — Lease formalities' },
      {
        kind: 'ul',
        items: [
          'Stamp duty — payable on the lease deed at state-specific rates; an under-stamped deed is inadmissible as evidence until rectified with penalty.',
          'Registration — under the Registration Act, 1908, a lease of immovable property for more than 11 months must be registered with the sub-registrar. Long-term warehouse leases (3–9 years) should always be registered; unregistered long leases are read down to month-to-month tenancies in disputes.',
          'Standard commercial terms to negotiate consciously: security deposit (commonly 3–6 months), lock-in period (often 3 years on Grade A), rent escalation (typically ~5% annually or 15% every 3 years), maintenance/CAM charges and who bears property tax and structural repairs.',
          'Fit-out and reinstatement clauses — who owns racking, dock equipment and electrical augmentation at exit.',
          'Insurance split — landlord typically insures the structure; tenant insures stock, fit-outs and liability. Verify the fire systems meet your insurer\'s warranties, not just the fire NOC.',
        ],
      },
      { kind: 'h2', text: 'A realistic sequencing plan' },
      {
        kind: 'ol',
        items: [
          'Diligence the landlord\'s papers (1–2 weeks; run title and land-use checks in parallel with commercial negotiation).',
          'Sign, stamp and register the lease; take possession.',
          'File the GST additional-place-of-business amendment immediately — approval is usually quick, and stocking before approval creates e-way bill friction.',
          'Apply for sector licences (FSSAI, drug, SPCB) as soon as the registered lease exists — most applications require the lease deed and premises proof.',
          'Schedule fire NOC renewal and licence renewals into your compliance calendar; lapses void insurance positions.',
        ],
      },
      {
        kind: 'p',
        text: 'WareOnGo validates compliance documentation on every listed warehouse during physical verification and coordinates the diligence-to-possession paperwork end-to-end, which is how most transactions on the platform close within a couple of weeks.',
      },
    ],
    faqs: [
      {
        q: 'Is a fire NOC mandatory for a warehouse in India?',
        a: 'For warehouses above state-specific height/area thresholds, yes — the fire NOC from the state fire department is mandatory, and it requires periodic renewal. Operating without one risks sealing, prosecution and rejected insurance claims.',
      },
      {
        q: 'Do I need a separate GST registration for a warehouse in another state?',
        a: 'If you have no existing GST registration in that state, yes — you need a GSTIN there. If you already have one, you add the warehouse as an additional place of business. Either way, the warehouse must appear on your GST registration before you stock goods.',
      },
      {
        q: 'Does a warehouse lease need to be registered?',
        a: 'Any lease of immovable property exceeding 11 months must be registered under the Registration Act, 1908, after paying state stamp duty. Unregistered long leases are treated as month-to-month tenancies in court — a serious risk on a multi-year warehouse commitment.',
      },
      {
        q: 'What is the most common compliance deal-breaker?',
        a: 'Land-use conversion. A surprising share of otherwise good sheds sit on land never converted from agricultural use, which jeopardises every downstream licence. Verify CLU/NA status before investing time in negotiation.',
      },
      {
        q: 'Who is responsible for compliance — landlord or tenant?',
        a: 'Both, for different layers. The landlord must hold title, building approvals, land-use conversion and the fire NOC; the tenant must obtain GST, trade and sector-specific licences for their operations. A well-drafted lease records each side\'s obligations explicitly.',
      },
    ],
    related: ['warehouse-rent-india-guide', 'grade-a-warehouse-india'],
  },

  // ---------------------------------------------------------------------------
  {
    slug: 'warehouse-rent-india-guide',
    title: 'Warehouse Rent in India: What Drives the ₹/sqft and Typical Lease Terms',
    seoTitle: 'Warehouse Rent in India — Rates per Sqft & Lease Terms Explained | WareOnGo',
    description:
      'What determines warehouse rent per sqft in India: micro-market, grade, size, compliance. Typical lease terms — security deposit, lock-in, escalation, CAM — and how to negotiate.',
    summary:
      'Warehouse rent in India is quoted in rupees per square foot per month and is driven mostly by micro-market, building grade and deal size. Indicative gross ranges in major markets run from the mid-teens per sqft for Grade B stock in supply-heavy corridors like Bhiwandi to the mid-₹30s and above for Grade A in tight urban-adjacent markets. On top of rent, budget for a 3–6 month security deposit, CAM charges, and roughly 5% annual escalation; lock-ins of around 3 years are standard on Grade A leases. Rates vary sharply within a single city, so compare at the micro-market level, never the city average.',
    updated: '2026-06-04',
    blocks: [
      {
        kind: 'p',
        text: 'Two warehouses 25 km apart in the same city can differ by 60% on rent. Understanding why — and what the quoted ₹/sqft does and does not include — is most of the work of negotiating a good warehouse lease in India. This guide breaks down the pricing drivers, the commercial terms that surround the headline rate, and the levers that actually move the number.',
      },
      { kind: 'h2', text: 'What determines the rate per sqft' },
      {
        kind: 'ul',
        items: [
          'Micro-market, not city: proximity to highways and ring roads, to the consumption centre, and to labour supply. A pin code with container access and city access in under an hour prices at a premium.',
          'Grade and specification: clear height, flooring, docks, fire systems. Grade A typically carries a 20–40% premium over Grade B in the same corridor (see our Grade A guide).',
          'Size and divisibility: very large boxes (1 lakh+ sqft) get volume pricing; small carve-outs of 5,000–10,000 sqft inside a larger shed price higher per sqft.',
          'Compliance completeness: a fully papered warehouse (fire NOC, OC, converted land) commands more — and is worth more, because the alternative externalises risk onto you.',
          'Supply pipeline: corridors with heavy new Grade A construction see soft rents; land-locked urban godown clusters see steady escalation.',
          'Lease tenure and covenant: a 9-year lease from a strong corporate covenant gets a better rate than a 2-year lease from an unknown tenant.',
        ],
      },
      { kind: 'h2', text: 'How rent is quoted — read the fine print' },
      {
        kind: 'ul',
        items: [
          'Carpet vs built-up: confirm whether the ₹/sqft applies to carpet (usable) area or super built-up area including common areas — the same quote can differ ~10–15% in effective cost.',
          'CAM (common area maintenance): in organised parks, charged separately, often a few rupees per sqft — ask for it in writing alongside the rent.',
          'Property tax and structural repairs: conventionally the landlord\'s, but verify; some net leases pass them through.',
          'GST on rent: commercial rent attracts GST (currently 18%); registered businesses can generally claim input credit, but it affects cash flow.',
          'Power, DG and water: sanctioned load, per-unit DG cost and water charges sit outside rent and matter for MHE-heavy or cold-chain operations.',
        ],
      },
      { kind: 'h2', text: 'Standard commercial terms in Indian warehouse leases' },
      {
        kind: 'table',
        table: {
          headers: ['Term', 'Typical range', 'Notes'],
          rows: [
            ['Security deposit', '3–6 months\' rent', 'Refundable, interest-free; negotiable down with strong covenant'],
            ['Lock-in', '~3 years (Grade A); 1–2 years (Grade B/C)', 'Exit during lock-in usually means paying remaining lock-in rent'],
            ['Tenure', '3–9 years, often 3+3+3', 'Leases over 11 months must be stamped and registered'],
            ['Escalation', '~5% per year, or 15% every 3 years', 'Compounding matters — model total occupancy cost over tenure'],
            ['Rent-free fit-out period', '15–60 days', 'Tied to fit-out scope; ask explicitly'],
            ['Notice period', '3–6 months after lock-in', 'Symmetric notice is worth negotiating'],
          ],
        },
      },
      { kind: 'h2', text: 'Negotiation levers that actually work' },
      {
        kind: 'ol',
        items: [
          'Compete the requirement: 3–5 comparable options in the same micro-market is the single biggest source of leverage. Landlords price against the visible alternative.',
          'Trade tenure for rate: a longer lock-in or tenure is worth a lower starting rent or a longer rent-free period to most landlords.',
          'Time the supply cycle: in corridors with new parks leasing up, developers discount to anchor occupancy.',
          'Negotiate escalation and deposit, not just rent: 1% off the annual escalation can be worth more over a 9-year term than ₹1 off the headline rate.',
          'Under-construction inventory: committing before completion routinely prices below ready stock — this is how deals close under the prevailing market rate.',
        ],
      },
      {
        kind: 'p',
        text: 'Clients transacting through WareOnGo typically save around 8–12% on commercials, primarily through micro-market comparables and negotiating the full term sheet rather than the headline rent alone. For live availability and current asking rates in a specific city, the per-city listing pages carry verified, inspected inventory with transparent pricing.',
      },
    ],
    faqs: [
      {
        q: 'How is warehouse rent quoted in India?',
        a: 'In rupees per square foot per month (₹/sqft/month), usually on built-up area. Always confirm whether the quote is carpet or built-up, and what CAM, property tax and GST add on top.',
      },
      {
        q: 'What is a typical security deposit for a warehouse lease?',
        a: 'Three to six months\' rent, refundable and interest-free, is the Indian market norm. Strong corporate covenants can negotiate toward the lower end.',
      },
      {
        q: 'What is a lock-in period?',
        a: 'The initial stretch of the lease during which the tenant cannot exit without paying the remaining lock-in rent. Around 3 years is standard on Grade A warehouse leases; shorter lock-ins are common on smaller Grade B/C godowns.',
      },
      {
        q: 'Why do rents differ so much within one city?',
        a: 'Because warehousing prices at micro-market level: highway access, distance to the consumption centre, land economics and local supply pipelines vary block by block. City-average rents are nearly useless for decision-making — compare specific corridors.',
      },
      {
        q: 'Is GST charged on warehouse rent?',
        a: 'Yes — commercial property rent attracts GST at the prevailing rate (18%). GST-registered tenants can generally claim input tax credit, subject to their output profile.',
      },
    ],
    related: ['grade-a-warehouse-india', 'warehouse-compliance-checklist-india'],
  },
];

export const getGuideBySlug = (slug: string): Guide | undefined =>
  guides.find((g) => g.slug === slug);
