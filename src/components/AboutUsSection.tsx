import { ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUsSection = () => {
  return (
    <section className="bg-wareongo-ivory py-16 md:py-24">
      <div className="container mx-auto max-w-5xl [perspective:1200px]">
        <Link
          to="/about-us"
          className="ui-card ui-card--action about-card group block overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image Side */}
            <div className="md:w-2/5 aspect-[16/10] md:aspect-auto relative overflow-hidden bg-wareongo-ivory border-b md:border-b-0 md:border-r border-ui-outline">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=720&q=70"
                alt="WareOnGo Team"
                width={720}
                height={447}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-wareongo-blue/10 group-hover:bg-transparent transition-colors duration-500">
                <Users className="w-12 h-12 text-ui-surface drop-shadow-md" />
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
              <span className="ui-eyebrow text-wareongo-slate mb-3">
                Behind WareOnGo
              </span>
              <h2 className="ui-section-title text-wareongo-blue mb-4">
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
      </div>
    </section>
  );
};

export default AboutUsSection;
