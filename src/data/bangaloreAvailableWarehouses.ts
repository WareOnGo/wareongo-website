import type { AdLandingWarehouse } from './micromarketAdPages';

// Curated from the public Bangalore inventory on 2026-09-26; the first six were
// added and listings under 5,000 sq ft removed on 2026-10-19 (ad review, 17 Oct).
// Photo provenance and refresh notes: public/bangalore/README.md. The newer
// listings use their live photos and have no local cover.
export interface BangaloreAvailableWarehouse {
  id: number;
  locality: string;
  address: string;
  size: number;
  price: number;
  ceilingHeight: number;
  warehouseType: string;
  numberOfDocks: number | null;
  fireCompliance: boolean | null;
  image: string;
  imageFallback: string | null;
  coverImage?: string;
}

export const BANGALORE_AVAILABLE_WAREHOUSES: BangaloreAvailableWarehouse[] = [
  {
    "id": 2454,
    "locality": "Dasanapura",
    "address": "Doddagollahalli, STRR rd, near Foxconn",
    "size": 12000,
    "price": 40,
    "ceilingHeight": 28,
    "warehouseType": "Shed",
    "numberOfDocks": null,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_27f2ba0b8902cff45ffb8f9fe0c43f35.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_27f2ba0b8902cff45ffb8f9fe0c43f35.png"
  },
  {
    "id": 614,
    "locality": "Attibele",
    "address": "Attibele",
    "size": 5000,
    "price": 25,
    "ceilingHeight": 30,
    "warehouseType": "PEB",
    "numberOfDocks": 0,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1763252355177.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1763252355177.jpeg"
  },
  {
    "id": 2910,
    "locality": "Nelamangala",
    "address": "Ahobalapalya, Machanayakanahalli",
    "size": 19000,
    "price": 20,
    "ceilingHeight": 31,
    "warehouseType": "PEB",
    "numberOfDocks": 5,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/835fa7fdcba0f58dabdbd0e81c306b5eb181e3316208260c4a829e5f6a412016/sharp-w1280-q75-v1.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/5100adbea85345b9375f007762bec3a2.jpg"
  },
  {
    "id": 983,
    "locality": "Jigani",
    "address": "Koppa Road, Jigani",
    "size": 31000,
    "price": 30,
    "ceilingHeight": 35,
    "warehouseType": "PEB",
    "numberOfDocks": 4,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1769783790546.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1769783790546.jpeg"
  },
  {
    "id": 1468,
    "locality": "Bidadi",
    "address": "Abhanakuppe, Bidadi",
    "size": 60000,
    "price": 28,
    "ceilingHeight": 25,
    "warehouseType": "PEB",
    "numberOfDocks": 12,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1777287817633.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1777287817633.jpeg"
  },
  {
    "id": 2216,
    "locality": "Devanahalli",
    "address": "KIADB Devanahalli Phase 2",
    "size": 55000,
    "price": 38,
    "ceilingHeight": 40,
    "warehouseType": "PEB",
    "numberOfDocks": 12,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_ba3088769366704cdc0546b6d16a6db9.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_ba3088769366704cdc0546b6d16a6db9.jpg"
  },
  {
    "id": 2744,
    "locality": "Muthasandra",
    "address": "4RW5+C6C Muthasandra, Karnataka",
    "size": 10000,
    "price": 26,
    "ceilingHeight": 22,
    "warehouseType": "PEB",
    "numberOfDocks": 4,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/3ff66644e01ac47d5f797c5ee696e7aab677c6a25fa63e8a14bccf19ada27aaf/sharp-w1280-q75-v1.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_c1e963919653f000641adae01ea67892.jpg",
    "coverImage": "/bangalore/available-2744.webp"
  },
  {
    "id": 2142,
    "locality": "Hoskote",
    "address": "Hoskote",
    "size": 12800,
    "price": 20,
    "ceilingHeight": 25,
    "warehouseType": "Shed",
    "numberOfDocks": 1,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_3a68482740380013f6f0b3a604e23521.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_3a68482740380013f6f0b3a604e23521.jpg",
    "coverImage": "/bangalore/available-2142.webp"
  },
  {
    "id": 1294,
    "locality": "Attibele",
    "address": "Attibele Industrial Area, Attibele",
    "size": 9300,
    "price": 30,
    "ceilingHeight": 36,
    "warehouseType": "PEB",
    "numberOfDocks": null,
    "fireCompliance": null,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1775117527561.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1775117527561.jpeg",
    "coverImage": "/bangalore/available-1294.webp"
  },
  {
    "id": 832,
    "locality": "Devanahalli",
    "address": "Bammanahalli, Devanahalli",
    "size": 10000,
    "price": 32,
    "ceilingHeight": 27,
    "warehouseType": "PEB",
    "numberOfDocks": 1,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1766550503042.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1766550503042.jpeg",
    "coverImage": "/bangalore/available-832.webp"
  },
  {
    "id": 2686,
    "locality": "Bande Bommasandra",
    "address": "Kada Agrahara Main Rd, Nisarga Layout, Bande Bommasandra",
    "size": 10000,
    "price": 18,
    "ceilingHeight": 20,
    "warehouseType": "Shed",
    "numberOfDocks": null,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/1960bdc031e77c3a8daa84dd4e26d838.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/1960bdc031e77c3a8daa84dd4e26d838.jpg",
    "coverImage": "/bangalore/available-2686.webp"
  },
  {
    "id": 2255,
    "locality": "Doddaballapura",
    "address": "Road No. 25, KIADB Industrial Area, Doddaballapura, Bashettihalli",
    "size": 17000,
    "price": 25,
    "ceilingHeight": 28,
    "warehouseType": "PEB",
    "numberOfDocks": null,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/f601ec158a4169b486a95d8af9a4c9a3.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/f601ec158a4169b486a95d8af9a4c9a3.jpg",
    "coverImage": "/bangalore/available-2255.webp"
  },
  {
    "id": 2369,
    "locality": "Hoskote",
    "address": "Chokahalli industrial area, Hoskote",
    "size": 120000,
    "price": 30,
    "ceilingHeight": 39,
    "warehouseType": "PEB",
    "numberOfDocks": 8,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/6986d1720554225334c15c1810219b2f.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/6986d1720554225334c15c1810219b2f.jpg",
    "coverImage": "/bangalore/available-2369.webp"
  },
  {
    "id": 1121,
    "locality": "Dobbaspet",
    "address": "Sompura KIADB Estate, Dobbaspet",
    "size": 190000,
    "price": 28,
    "ceilingHeight": 50,
    "warehouseType": "PEB",
    "numberOfDocks": 11,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/1d85b87b949c2908456e9e8480ec24db.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/1d85b87b949c2908456e9e8480ec24db.jpg",
    "coverImage": "/bangalore/available-1121.webp"
  },
  {
    "id": 408,
    "locality": "Devanahalli",
    "address": "Devanahalli",
    "size": 100000,
    "price": 33,
    "ceilingHeight": 40,
    "warehouseType": "PEB",
    "numberOfDocks": null,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1759230371973.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1759230371973.jpeg",
    "coverImage": "/bangalore/available-408.webp"
  },
  {
    "id": 1037,
    "locality": "Cheemasandra",
    "address": "Cheemasandra",
    "size": 80000,
    "price": 28,
    "ceilingHeight": 40,
    "warehouseType": "PEB",
    "numberOfDocks": 8,
    "fireCompliance": true,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1770635881292.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1770635881292.jpeg",
    "coverImage": "/bangalore/available-1037.webp"
  },
  {
    "id": 2324,
    "locality": "Makali",
    "address": "Harokyathanahalli, Makali",
    "size": 50000,
    "price": 28,
    "ceilingHeight": 32,
    "warehouseType": "PEB",
    "numberOfDocks": 5,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_11f0dc8b37e8ac49ba97066756f14f67.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_11f0dc8b37e8ac49ba97066756f14f67.jpg",
    "coverImage": "/bangalore/available-2324.webp"
  },
  {
    "id": 1884,
    "locality": "Dobbaspet",
    "address": "Dabaspet 4th Phase",
    "size": 55000,
    "price": 26,
    "ceilingHeight": 40,
    "warehouseType": "PEB",
    "numberOfDocks": 5,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/55e2d43430532efad873d91f8ec3acfe.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/55e2d43430532efad873d91f8ec3acfe.jpg",
    "coverImage": "/bangalore/available-1884.webp"
  }
];

// The opening "All sizes" grid: at least one listing in each size chip.
export const BANGALORE_ALL_SIZES_IDS = [2454, 614, 2910, 983, 1468, 2216];

// One card per size band (5,000 to 15,000, 15,000 to 30,000 and 50,000+ sq ft),
// picked in the 17 Oct ad review for Fire NOC, docks, photos and an exact rent.
// #2744 and #1121 reuse their local covers (public/bangalore/README.md); #915
// uses its live photo. #915 records its clear height as a range, so none shows.
export const BANGALORE_FEATURED_LISTINGS: AdLandingWarehouse[] = [
  { id: 2744, locality: 'Hoskote', address: '4RW5+C6C Muthasandra, Karnataka', size: 10000, price: 26, ceilingHeight: 22, numberOfDocks: 4, fireCompliance: true,
    image: '/bangalore/available-2744.webp' },
  { id: 915, locality: 'Peenya', address: 'Hanchipura, Mangalore Highway, Nelamangala', size: 22700, price: 25, ceilingHeight: null, numberOfDocks: 27, fireCompliance: true,
    image: 'https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/bdfdfb0c07d8e78c138935b6f276a512.webp',
    imageFallback: 'https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/bdfdfb0c07d8e78c138935b6f276a512.jpg' },
  { id: 1121, locality: 'Dobbaspet', address: 'Sompura KIADB Estate, Dobbaspet', size: 190000, price: 28, ceilingHeight: 50, numberOfDocks: 11, fireCompliance: true,
    image: '/bangalore/available-1121.webp' },
].map(listing => ({ ...listing, warehouseType: 'PEB' }));
