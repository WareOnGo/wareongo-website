
import React from 'react';
import { Search, Clock, IndianRupee, Star } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="bg-wareongo-ivory p-3 rounded-full mb-3">
        <Icon className="h-6 w-6 text-wareongo-blue" />
      </div>
      <h3 className="text-lg font-semibold text-wareongo-blue mb-2">{title}</h3>
      <p className="text-wareongo-slate text-sm">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Verified Owners",
      description: "Access to 6,000+ warehouse spaces pan-India, tailored to your needs."
    },
    {
      icon: Clock,
      title: "Fast Response Time",
      description: "Find suitable options within 3 hours of sharing requirement."
    },
    {
      icon: IndianRupee,
      title: "Reduce Costs",
      description: "Negotiate better rates and find spaces that maximize operational efficiency."
    },
    {
      icon: Star,
      title: "Tailored Guidance",
      description: "Get personalized recommendations from warehousing specialists."
    }
  ];

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
