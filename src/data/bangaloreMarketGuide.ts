// Public copy from Bangalore_LP_Areas_and_Market_Copy_2026-10-03-v2.docx.
// The handoff's raw rent figures and listing counts are internal references.
export const BANGALORE_AREA_FIT_GROUPS = [
  {
    id: 'highway-belts',
    title: 'Highway Belts',
    rows: [
      { need: 'Large distribution centres on the Mumbai highway', areas: 'Nelamangala, Dobbaspet' },
      { need: 'Air cargo and north-bound despatch', areas: 'Devanahalli, Doddaballapur' },
      { need: 'Chennai and Andhra-bound despatch on Old Madras Road', areas: 'Hoskote, Soukya Road' },
      { need: 'Storage for the factories on Hosur Road', areas: 'Bommasandra, Jigani' },
      { need: 'West-bound despatch on Mysore Road', areas: 'Bidadi, Kumbalgodu' },
      { need: 'South-bound despatch on Kanakapura Road', areas: 'Harohalli' },
    ],
  },
  {
    id: 'inside-the-city',
    title: 'Inside the City',
    rows: [
      { need: 'Small godowns for north Bangalore', areas: 'Yelahanka, Jakkur, Hebbal' },
      { need: 'Last-mile delivery in east Bangalore', areas: 'Whitefield, Marathahalli, Indiranagar' },
      { need: 'Last-mile delivery in south and south-east Bangalore', areas: 'HSR Layout, JP Nagar, Sarjapur' },
      { need: 'Small industrial godowns close to the city', areas: 'Peenya' },
    ],
  },
];

export const BANGALORE_RENT_GUIDE = {
  intro: 'Warehouses and godowns for rent in Bangalore sit on four highways: Tumkur Road (NH-48), Old Madras Road (NH-75), Hosur Road and the airport road. Smaller godowns sit inside the city.',
  description: 'Warehouse rent in Bangalore follows the land, not the unit size. On Tumkur Road and Old Madras Road, where land is plentiful, large sheds start from ₹17 per sq ft a month. Closer to the city, land gets scarcer, units get smaller and rent rises: godowns in Whitefield, Marathahalli, Sarjapur and HSR Layout ask up to ₹200 to ₹250. On the highway belts, a small unit costs about the same per sq ft as a large one, so choose the area first, then the size.',
  rows: [
    { area: 'Nelamangala, Dobbaspet, Makali', rent: '₹17 to ₹40' },
    { area: 'Hoskote, Budigere, Soukya Road', rent: '₹18 to ₹80' },
    { area: 'Peenya', rent: '₹17 to ₹65' },
    { area: 'Hosur Road: Bommasandra, Jigani, Attibele', rent: '₹22 to ₹205' },
    { area: 'Bidadi, Harohalli', rent: '₹22 to ₹40' },
    { area: 'Kumbalgodu', rent: '₹14 to ₹30' },
    { area: 'Devanahalli', rent: '₹25 to ₹70' },
    { area: 'Whitefield', rent: '₹60 to ₹200' },
    { area: 'Marathahalli, Sarjapur', rent: '₹60 to ₹200' },
    { area: 'HSR Layout', rent: '₹100 to ₹250' },
  ],
};

export const BANGALORE_MARKET_FAQS = [
  {
    q: 'What does WareOnGo charge?',
    a: "You pay nothing to search, visit or shortlist. Our fee is one month's rent, charged only when you sign the lease, so you only pay when you close.",
  },
  {
    q: 'Are the listings verified?',
    a: "Yes. Our area managers verify every space on-site before it reaches your shortlist, so the size, specifications and availability you see are what you'll find on the visit.",
  },
  {
    q: 'Can WareOnGo find a small godown for rent in Bangalore?',
    a: 'Yes. We find warehouses and godowns for rent in Bangalore of every size, from small godowns under 5,000 sq ft in Yelahanka, HSR Layout and Marathahalli to large distribution warehouses on Tumkur Road and Hosur Road. Share your size and area, and we shortlist only spaces that fit.',
  },
];
