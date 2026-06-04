// Curated industrial/warehousing corridors per state slug. Fed into
// CollectionPage JSON-LD `keywords` on state pages (machine-readable, not
// rendered), alongside the cities derived live from that state's inventory.
//
// Same rule as cityHubs.ts: only confidently-known corridors — leave a state
// out rather than guess.

export const STATE_HUBS: Record<string, string[]> = {
  karnataka: [
    'Nelamangala', 'Hoskote', 'Dabaspete', 'Bommasandra', 'Jigani',
    'Peenya Industrial Area', 'Bidadi',
  ],
  maharashtra: [
    'Bhiwandi', 'Chakan', 'Ranjangaon', 'Taloja', 'JNPT',
    'Waluj MIDC', 'Shendra MIDC',
  ],
  haryana: [
    'Manesar', 'Farukhnagar', 'Ballabhgarh', 'Sohna Road', 'Bilaspur Chowk',
    'Kundli', 'Rai Industrial Area',
  ],
  'uttar-pradesh': [
    'Noida Sector 80', 'Sahibabad', 'Tronica City', 'Dadri',
    'Panki Industrial Area', 'Dada Nagar',
  ],
  telangana: [
    'Medchal', 'Patancheru', 'Jeedimetla', 'Shamshabad', 'Shadnagar', 'Kompally',
  ],
  'tamil-nadu': [
    'Oragadam', 'Sriperumbudur', 'Hosur SIPCOT', 'Shoolagiri',
    'Ambattur', 'Gummidipoondi', 'Madhavaram',
  ],
  gujarat: [
    'Aslali', 'Changodar', 'Sanand', 'Vatva GIDC', 'Sachin GIDC',
    'Palsana', 'Makarpura GIDC', 'Mundra',
  ],
  'west-bengal': ['Dankuni', 'Dhulagarh', 'Uluberia', 'Howrah', 'Taratala'],
  rajasthan: ['VKI Area', 'Sitapura Industrial Area', 'Bagru', 'Bhiwadi'],
  'madhya-pradesh': ['Pithampur', 'Dewas Naka', 'Sanwer Road', 'Malanpur'],
  kerala: ['Kalamassery', 'Angamaly', 'Aroor', 'Aluva'],
  punjab: ['Mandi Gobindgarh', 'Rajpura', 'Ludhiana Focal Point'],
  bihar: ['Fatuha', 'Didarganj', 'Transport Nagar'],
  assam: ['Azara', 'Changsari', 'Amingaon', 'Lokhra'],
  chhattisgarh: ['Urla Industrial Area', 'Siltara', 'Bhanpuri'],
  odisha: ['Mancheswar Industrial Estate', 'Jagatpur Industrial Estate'],
  'andhra-pradesh': ['Sri City', 'Autonagar'],
  goa: ['Verna Industrial Estate', 'Kundaim Industrial Estate'],
  uttarakhand: ['Rudrapur', 'Pantnagar', 'Haridwar'],
  'himachal-pradesh': ['Baddi', 'Barotiwala'],
};
