
import React from 'react';
import { Search, Clock, DollarSign, Star } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="bg-wareongo-ivory p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-wareongo-blue" />
      </div>
      <h3 className="text-xl font-semibold text-wareongo-blue mb-2">{title}</h3>
      <p className="text-wareongo-slate">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Extensive Network",
      description: "Access to thousands of warehouse spaces across the country, tailored to your needs."
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Find the perfect warehouse in days, not months, with our specialized search."
    },
    {
      icon: DollarSign,
      title: "Reduce Costs",
      description: "Negotiate better rates and find spaces that maximize operational efficiency."
    },
    {
      icon: Star,
      title: "Expert Guidance",
      description: "Get personalized recommendations from warehousing specialists."
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Why Choose WareOnGo?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
