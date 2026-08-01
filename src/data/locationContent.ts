// Editorial content for location pages, from the marketing content doc
// "WareOnGo-ThinContent-Location-Pages (revised)". Prose is ported verbatim —
// do not normalise dashes or punctuation.
//
// Text in {curly braces} is data-bound: filled at build time from live
// inventory by fillLocationTemplate (src/lib/locationStats.ts). A section
// whose template references a stat we can't compute is dropped rather than
// rendered broken (Rule #1: never pad / never publish half-filled copy).
//
// Tokens: {count} {count_plus} {min_size} {max_size} {min_rent} {max_rent}
//         {median_rent} {small_rent} {large_rent} {min_height} {max_height}
//         {count_compliant}

export interface LocationFaq {
  q: string;
  a: string;
}

export interface CityContent {
  /** Canonical state for the breadcrumb / H1 suffix */
  stateName: string;
  /** Slug of the parent state page, e.g. "chhattisgarh" */
  stateSlug: string;
  /** Title tag template (≤60 chars after fill) */
  title: string;
  /** Meta description template (≤160 chars after fill) */
  metaDescription: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faq: LocationFaq[];
}

export const CITY_CONTENT: Record<string, CityContent> = {
  raipur: {
    stateName: 'Chhattisgarh',
    stateSlug: 'chhattisgarh',
    title: 'Warehouse for Rent in Raipur – {count_plus} Spaces | WareOnGo',
    metaDescription:
      'Find warehouse & godown space for rent in Raipur. {count_plus} verified listings from ₹{min_rent}/sq ft, {min_size}–{max_size} sq ft near Urla & Tatibandh.',
    h1: 'Warehouse for Rent in Raipur, Chhattisgarh',
    intro:
      "Raipur has {count} verified warehouse and godown spaces available for rent on WareOnGo, from {min_size} to {max_size} sq ft. Chhattisgarh's commercial capital and the largest warehousing cluster in central-east India, Raipur sits on the NH-53 (GE Road) and Bilaspur Road corridors, with rail-linked EXIM capacity at the Naya Raipur Multi-Modal Logistics Park. Steel, rice-milling and FMCG distribution all stock here to reach a wide central-Indian catchment. Rents run from ₹{min_rent} to ₹{max_rent} per sq ft per month.",
    sections: [
      {
        heading: 'Warehouse & industrial areas in Raipur',
        body: 'Warehousing in Raipur concentrates in three belts, and the right one depends on the job. The Urla–Birgaon–Bhanpuri belt along the Ring Roads and Bilaspur Road is the established cluster – 3PL, general godowns and cold storage, and the first place most regional distributors look. The Tatibandh–Guma corridor on NH-53 (GE Road) to the west is where the modern large-format sheds and FMCG distribution centres are coming up, with better truck movement and higher clear heights. Naya Raipur (Atal Nagar) hosts the CONCOR Multi-Modal Logistics Park with rail sidings and on-site customs clearance, so it suits EXIM and rail-borne cargo rather than city distribution. Heavy manufacturing storage sits separately around the Siltara steel and sponge-iron zone. In short: Urla for reach into the city and the lowest rents, Tatibandh for modern space, Naya Raipur for rail and export.',
      },
      {
        heading: 'Typical warehouse rents in Raipur',
        body: "The median asking rent across our Raipur listings is ₹{median_rent}/sq ft. Smaller godowns ask around ₹{small_rent}, while larger sheds and Grade-A space sit nearer ₹{large_rent}. Raipur works as a regional distribution base for Chhattisgarh, eastern Madhya Pradesh and western Odisha, and its rents sit well below the metros – which is exactly why brands stock here instead of trucking the region daily from Nagpur or Kolkata. The spread on the ground is simple: older RCC godowns in Urla carry the lowest rents, modern sheds on the Tatibandh side ask a premium for the clear height and access, and rail-linked space at Naya Raipur is priced for the customs clearance, not the floor rate. If you're weighing a warehouse for rent in Raipur, the belt you pick moves the number more than the size does.",
      },
    ],
    faq: [
      {
        q: 'What is the rent for a warehouse in Raipur?',
        a: 'Rents on our Raipur listings run from ₹{min_rent} to ₹{max_rent}/sq ft per month, with a median of ₹{median_rent}/sq ft. Older RCC godowns in Urla carry the lowest rents, while modern sheds on the Tatibandh side ask a premium for the clear height and access.',
      },
      {
        q: 'What sizes are available in Raipur?',
        a: 'Listings range from {min_size} to {max_size} sq ft – from small godowns to large distribution and manufacturing spaces.',
      },
      {
        q: 'What are the best areas for a warehouse in Raipur?',
        a: "Urla is the established cluster with the lowest rents and quick reach into the city, the Tatibandh–Guma corridor on NH-53 holds the modern large-format sheds, and Naya Raipur's CONCOR Multi-Modal Logistics Park is the pick for EXIM and rail-borne cargo. The Siltara zone covers heavy manufacturing storage.",
      },
    ],
  },
};
