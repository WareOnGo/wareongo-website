import React, { useState } from 'react';
import { MapPin, Ruler, Building2, IndianRupee, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CircularCursor from './CircularCursor';
import { trackEvent } from '@/lib/analytics';
import { warehousePath } from '@/lib/warehouseSlug';

const featuredListings = [
  {
    id: 776,
    image: "/featured/media_1765620707915_md.webp",
    imageWidth: 675,
    imageHeight: 900,
    address: "Munirabad, Medchal",
    location: { city: "Hyderabad", state: "Telangana" },
    size: 90000,
    price: 21,
    ceilingHeight: 40
  },
  {
    id: 995,
    image: "/featured/media_1770224907258_md.webp",
    imageWidth: 900,
    imageHeight: 675,
    address: "Attibele-Anekal Road, near Jigani",
    location: { city: "Bangalore", state: "Karnataka" },
    size: 77530,
    price: 29,
    ceilingHeight: 40
  },
  {
    id: 1088,
    image: "/featured/media_1771237298929_md.webp",
    imageWidth: 900,
    imageHeight: 404,
    address: "Pudur, Medchal",
    location: { city: "Hyderabad", state: "Telangana" },
    size: 125000,
    price: 23,
    ceilingHeight: 36
  }
];

const FeaturedListingsSection = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [entryPos, setEntryPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <section className="bg-wareongo-ivory py-16 md:py-24 border-t border-black/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-wareongo-blue mb-2 md:mb-3">
              Featured Listings
            </h2>
            <p className="text-wareongo-slate text-sm sm:text-base md:text-lg">
              Explore some of our top verified properties ready for immediate possession.
            </p>
          </div>
          <Link
            to="/listings"
            onClick={() => trackEvent('nav_click', { label: 'View all listings', destination: '/listings', position: 'featured_listings_section' })}
            className="inline-flex items-center gap-2 text-wareongo-blue font-medium hover:underline whitespace-nowrap"
          >
            View all listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="listings-scroller -mx-4 pl-5 pr-5 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 md:mx-0 md:pl-0 md:pr-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 [perspective:1200px]">
          {featuredListings.map((listing, idx) => (
            <button
              key={listing.id}
              onClick={() => {
                trackEvent('listing_open', {
                  warehouse_id: listing.id,
                  source: 'featured_listings',
                  position: idx + 1,
                  address: listing.address,
                  city: listing.location.city,
                  state: listing.location.state,
                  size_sqft: listing.size,
                  price_per_sqft: listing.price,
                });
                navigate(
                  warehousePath({
                    id: listing.id,
                    size: listing.size,
                    city: listing.location.city,
                  }),
                );
              }}
              onMouseEnter={(e) => {
                if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
                setEntryPos({ x: e.clientX, y: e.clientY });
                setIsHovering(true);
              }}
              onMouseLeave={() => setIsHovering(false)}
              className="listing-card text-left group bg-transparent border border-wareongo-blue rounded-2xl overflow-hidden flex flex-col hover:bg-wareongo-blue/5 transition-colors shrink-0 w-[78%] min-[400px]:w-[70%] snap-start md:w-auto md:shrink"
            >
              <div className="aspect-[16/10] overflow-hidden w-full relative">
                <img
                  src={listing.image}
                  alt={listing.address}
                  width={listing.imageWidth}
                  height={listing.imageHeight}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-wareongo-blue px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm border border-wareongo-blue/20">
                  ID: {listing.id}
                </div>
              </div>
              
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-wareongo-blue mb-1.5 truncate" title={listing.address}>
                    {listing.address}
                  </h3>
                  <div className="flex items-center text-wareongo-slate text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{listing.location.city}, {listing.location.state}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                  <div className="flex items-center text-wareongo-slate text-xs sm:text-sm">
                    <Ruler className="w-4 h-4 mr-1.5 text-wareongo-blue/70" />
                    <span>{listing.size.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex items-center text-wareongo-slate text-xs sm:text-sm">
                    <Building2 className="w-4 h-4 mr-1.5 text-wareongo-blue/70" />
                    <span>{listing.ceilingHeight}m height</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-wareongo-blue/10 flex items-center justify-between">
                  <div className="flex items-center text-wareongo-blue font-semibold text-sm sm:text-base">
                    <IndianRupee className="w-4 h-4 mr-0.5" />
                    <span>{listing.price} / sqft</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <style>{`
          .listings-scroller {
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            scroll-padding-left: 1.25rem;
          }
          @media (min-width: 768px) {
            .listings-scroller { scroll-padding-left: 0; }
          }
          .listings-scroller::-webkit-scrollbar { display: none; }
          .listings-scroller > :last-child {
            margin-right: 1rem;
          }
          @media (min-width: 768px) {
            .listings-scroller > :last-child { margin-right: 0; }
          }
          .listing-card {
            transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0);
            transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 400ms;
            will-change: transform;
          }
          @media (hover: hover) and (pointer: fine) {
            .listing-card,
            .listing-card * {
              cursor: none !important;
            }
            .listing-card:hover {
              transform: perspective(1200px) rotateX(3deg) rotateY(-4deg) translateY(-4px);
            }
            .listing-card:nth-child(2):hover {
              transform: perspective(1200px) rotateX(3deg) rotateY(0deg) translateY(-4px);
            }
            .listing-card:nth-child(3):hover {
              transform: perspective(1200px) rotateX(3deg) rotateY(4deg) translateY(-4px);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .listing-card, .listing-card:hover { transform: none; transition: none; }
          }
        `}</style>
      </div>

      <CircularCursor visible={isHovering} initialPos={entryPos} text="EXPLORE ★ EXPLORE ★ EXPLORE ★" />
    </section>
  );
};

export default FeaturedListingsSection;
