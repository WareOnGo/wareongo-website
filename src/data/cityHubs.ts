// Curated warehousing micro-markets per city slug. Fed into CollectionPage
// JSON-LD `keywords` on city pages (machine-readable, not rendered) so locality
// queries ("warehouse in okhla", "warehouse in palsana") associate with the
// parent city page. Several entries come straight from Search Console queries.
//
// Only cities with confidently-known hubs are listed — leave a city out rather
// than guess.

export const CITY_HUBS: Record<string, string[]> = {
  bengaluru: [
    'Nelamangala', 'Hoskote', 'Bommasandra', 'Devanahalli', 'Soukya Road',
    'Peenya Industrial Area', 'Attibele', 'Jigani', 'Dabaspete', 'Bidadi',
    'Whitefield', 'Tumkur Road',
  ],
  delhi: [
    'Okhla Industrial Area', 'Mundka', 'Naraina', 'Samalka',
    'Patparganj Industrial Area', 'Bawana', 'Narela', 'GT Karnal Road',
  ],
  // Okhla is also its own city page in the listings data — Search Console shows
  // phase-level queries ("warehouse for rent in okhla phase 1/2").
  okhla: ['Okhla Phase 1', 'Okhla Phase 2', 'Okhla Phase 3'],
  mumbai: [
    'Bhiwandi', 'JNPT', 'Taloja', 'Vasai',
    'Panvel', 'Turbhe', 'Ambernath', 'Kalher', 'Padgha',
  ],
  hyderabad: [
    'Medchal', 'Patancheru', 'Shamshabad', 'Nizamabad Highway',
    'Jeedimetla', 'Balanagar', 'Kompally', 'Shadnagar', 'Devarayamjal',
  ],
  chennai: [
    'Oragadam', 'Sriperumbudur', 'Red Hills', 'Madhavaram',
    'Ambattur', 'Gummidipoondi', 'Poonamallee',
  ],
  pune: [
    'Chakan', 'Wagholi', 'Talegaon',
    'Ranjangaon', 'Bhosari', 'Sanaswadi', 'Lonikand',
  ],
  kolkata: ['Dankuni', 'Dhulagarh', 'Howrah', 'Uluberia', 'Taratala'],
  gurugram: [
    'Farukhnagar', 'Pataudi Road', 'Bilaspur Chowk',
    'Manesar', 'Binola', 'Sohna Road', 'Tauru Road',
  ],
  noida: ['Sector 63', 'Sector 80', 'Noida Phase 2'],
  'greater-noida': ['Ecotech 1', 'Ecotech 3', 'Surajpur', 'Dadri'],
  ghaziabad: ['Sahibabad', 'Loni Industrial Area', 'Tronica City', 'Dasna'],
  faridabad: ['Ballabhgarh', 'Sector 24', 'Sector 25', 'Mathura Road'],
  hosur: ['SIPCOT Industrial Park', 'Bagalur Road', 'Shoolagiri'],
  surat: ['Palsana', 'Sachin GIDC', 'Kadodara', 'Hazira', 'Kamrej'],
  ahmedabad: [
    'Aslali', 'Changodar', 'Sanand',
    'Bavla', 'Vatva GIDC', 'Naroda GIDC',
  ],
  vadodara: ['Makarpura GIDC', 'Padra Road'],
  indore: ['Pithampur', 'Dewas Naka', 'Sanwer Road', 'Rau', 'Palda'],
  jaipur: ['VKI Area', 'Sitapura Industrial Area', 'Ajmer Road', 'Bagru'],
  guwahati: ['Azara', 'Lokhra', 'Changsari', 'Amingaon'],
  kochi: ['Kalamassery', 'Aroor', 'Angamaly', 'Aluva'],
  kanpur: ['Panki Industrial Area', 'Dada Nagar', 'Rooma Industrial Area'],
  patna: ['Fatuha', 'Didarganj', 'Transport Nagar'],
  raipur: ['Urla Industrial Area', 'Siltara', 'Bhanpuri'],
  aurangabad: ['Waluj MIDC', 'Shendra MIDC', 'Chikalthana MIDC'],
  goa: ['Verna Industrial Estate', 'Kundaim Industrial Estate'],
  varanasi: ['Ramnagar Industrial Area', 'Chandpur Industrial Area'],
};
