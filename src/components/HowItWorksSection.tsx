
import React from 'react';
import { ClipboardList, Search, Building, ThumbsUp } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: ClipboardList,
      title: "Submit Requirements",
      description: "Tell us about your space needs, location preferences, and timeline."
    },
    {
      icon: Search,
      title: "We Search For You",
      description: "Our experts identify suitable warehouses from our extensive network."
    },
    {
      icon: Building,
      title: "Review Options",
      description: "Receive curated options with detailed information and virtual tours."
    },
    {
      icon: ThumbsUp,
      title: "Move In",
      description: "Select your ideal space, and we'll facilitate the entire process."
    }
  ];

  return (
    <section id="how-it-works" className="section-container">
      <h2 className="section-title">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center md:items-start">
            <div className="bg-wareongo-blue text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center mb-4">
              {index + 1}
            </div>
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center mb-2">
                <step.icon className="h-6 w-6 text-wareongo-blue mr-2" />
                <h3 className="text-xl font-semibold text-wareongo-blue">{step.title}</h3>
              </div>
              <p className="text-wareongo-slate text-center md:text-left">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
