import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUsSection = () => {
  return (
    <section className="bg-wareongo-ivory py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl [perspective:1200px]">
        <Link
          to="/about-us"
          className="about-card group block bg-transparent border border-wareongo-blue rounded-2xl overflow-hidden hover:bg-wareongo-blue/5 transition-colors"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image Side */}
            <div className="md:w-2/5 aspect-[16/10] md:aspect-auto relative overflow-hidden bg-wareongo-ivory border-b md:border-b-0 md:border-r border-wareongo-blue">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="WareOnGo Team"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-wareongo-blue/10 group-hover:bg-transparent transition-colors duration-500">
                <Users className="w-12 h-12 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate mb-3">
                Behind WareOnGo
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-wareongo-blue mb-4 leading-tight">
                Redefining Industrial Real Estate
              </h2>
              <p className="text-wareongo-slate text-sm sm:text-base mb-8 leading-relaxed max-w-lg">
                We are a team of supply chain experts, tech innovators, and real estate veterans on a mission to bring unprecedented transparency and speed to commercial leasing in India.
              </p>

              <div className="inline-flex items-center text-wareongo-blue font-semibold">
                Learn more about our mission
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>
        <style>{`
          .about-card {
            transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0);
            transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 400ms;
            will-change: transform;
          }
          .about-card:hover {
            transform: perspective(1200px) rotateX(2deg) rotateY(-2deg) translateY(-4px);
          }
          @media (prefers-reduced-motion: reduce) {
            .about-card, .about-card:hover { transform: none; transition: none; }
          }
        `}</style>
      </div>
    </section>
  );
};

export default AboutUsSection;
