import React, { useState } from 'react';
import { MapPin, Ruler, Building2, IndianRupee, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CircularCursor from './CircularCursor';

const featuredListings = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    address: "Prime Logistics Park, NH-44",
    location: { city: "Bangalore", state: "Karnataka" },
    size: 45000,
    price: 22,
    ceilingHeight: 12
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    address: "Industrial Estate Phase II",
    location: { city: "Hyderabad", state: "Telangana" },
    size: 32000,
    price: 18,
    ceilingHeight: 10
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    address: "Modern Grade-A Facility",
    location: { city: "Delhi", state: "Delhi" },
    size: 75000,
    price: 26,
    ceilingHeight: 14
  }
];

const FeaturedListingsSection = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

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
            className="inline-flex items-center gap-2 text-wareongo-blue font-medium hover:underline whitespace-nowrap"
          >
            View all listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 [perspective:1200px]">
          {featuredListings.map((listing) => (
            <button
              key={listing.id}
              onClick={() => navigate(`/warehouse/${listing.id}`)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="listing-card text-left group bg-transparent border border-wareongo-blue rounded-2xl overflow-hidden flex flex-col hover:bg-wareongo-blue/5 transition-colors"
            >
              <div className="aspect-[16/10] overflow-hidden w-full relative">
                <img
                  src={listing.image}
                  alt={listing.address}
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
          .listing-card,
          .listing-card * {
            cursor: none !important;
          }
          .listing-card {
            transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0);
            transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 400ms;
            will-change: transform;
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
          @media (prefers-reduced-motion: reduce) {
            .listing-card, .listing-card:hover { transform: none; transition: none; }
          }
        `}</style>
      </div>

      <CircularCursor visible={isHovering} text="EXPLORE ★ EXPLORE ★ EXPLORE ★" />
    </section>
  );
};

export default FeaturedListingsSection;
