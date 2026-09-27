// Curated from the public Bangalore inventory on 2026-09-26.
// Photo provenance and refresh notes: public/bangalore/README.md.
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
  coverImage: string;
}

export const BANGALORE_AVAILABLE_WAREHOUSES: BangaloreAvailableWarehouse[] = [
  {
    "id": 1398,
    "locality": "Vijayanagar",
    "address": "Govindaraja Nagar Ward ,Vijay Nagar",
    "size": 2000,
    "price": 100,
    "ceilingHeight": 14,
    "warehouseType": "PEB",
    "numberOfDocks": null,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1776331426848.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1776331426848.jpeg",
    "coverImage": "/bangalore/available-1398.webp"
  },
  {
    "id": 612,
    "locality": "Attibele",
    "address": "Attibele",
    "size": 4450,
    "price": 22,
    "ceilingHeight": 35,
    "warehouseType": "PEB",
    "numberOfDocks": 0,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1763251050083.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1763251050083.jpeg",
    "coverImage": "/bangalore/available-612.webp"
  },
  {
    "id": 2429,
    "locality": "Sampigehalli",
    "address": "Sri Venkateshpura Layout, Sampigehalli, Bengaluru, Karnataka 560064",
    "size": 4600,
    "price": 35,
    "ceilingHeight": 20,
    "warehouseType": "PEB",
    "numberOfDocks": 1,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_3a3323e41b3287611285fa79ee7955ce.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_3a3323e41b3287611285fa79ee7955ce.jpg",
    "coverImage": "/bangalore/available-2429.webp"
  },
  {
    "id": 1196,
    "locality": "Jakkur",
    "address": "Jakkur, Jakkuru",
    "size": 3000,
    "price": 50,
    "ceilingHeight": 14,
    "warehouseType": "PEB",
    "numberOfDocks": 3,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/37520f1855b025c3a91b78aaafe03b73.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/37520f1855b025c3a91b78aaafe03b73.jpg",
    "coverImage": "/bangalore/available-1196.webp"
  },
  {
    "id": 1697,
    "locality": "Mahalakshmi Layout",
    "address": "MEC Rd, opp. Ullas Theatre, Marappanapalya, Mahalakshmi Layout",
    "size": 4300,
    "price": 40,
    "ceilingHeight": 20,
    "warehouseType": "PEB",
    "numberOfDocks": null,
    "fireCompliance": false,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_20dc049e278b01b75f4488463868247a.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/scout_20dc049e278b01b75f4488463868247a.jpg",
    "coverImage": "/bangalore/available-1697.webp"
  },
  {
    "id": 1222,
    "locality": "Uttarahalli",
    "address": "Anjanapura BDA Layout,Uttarahalli",
    "size": 2500,
    "price": 35,
    "ceilingHeight": 15,
    "warehouseType": "PEB",
    "numberOfDocks": null,
    "fireCompliance": null,
    "image": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1773659471790.webp",
    "imageFallback": "https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/media_1773659471790.jpeg",
    "coverImage": "/bangalore/available-1222.webp"
  },
  {
    "id": 2744,
    "locality": "Muthasandra",
    "address": "4RW5+C6C Muthasandra, Karnataka",
    "size": 10000,
    "price": 60,
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

// A balanced opening selection: two listings from each of the three size bands.
export const BANGALORE_ALL_SIZES_IDS = [2369, 2744, 1398, 1121, 2142, 612];
