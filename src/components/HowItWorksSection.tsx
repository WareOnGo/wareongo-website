
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
      
      {/* Infographic visualization */}
      <div className="relative mb-16 hidden md:block">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-wareongo-blue/20 -translate-y-1/2 z-0"></div>
        <div className="grid grid-cols-4 gap-4 relative z-10">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`bg-wareongo-blue h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${index % 2 === 0 ? 'shadow-wareongo-blue/20' : 'shadow-wareongo-sienna/20'}`}>
                <step.icon className="h-8 w-8 text-white" />
              </div>
              <div className={`absolute w-12 h-12 top-2 ${index < steps.length - 1 ? 'block' : 'hidden'} left-[calc(100%-18px)]`}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 24H44M44 24L28 8M44 24L28 40" stroke="#0A2239" strokeWidth="2" strokeOpacity="0.3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-wareongo-blue mb-2">{step.title}</h3>
              <p className="text-wareongo-slate text-center max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile view with vertical steps */}
      <div className="grid grid-cols-1 md:hidden gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex">
            <div className="mr-4">
              <div className="bg-wareongo-blue text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="h-full w-0.5 bg-wareongo-blue/20 mx-auto my-2"></div>
              )}
            </div>
            <div>
              <div className="flex items-center mb-2">
                <step.icon className="h-6 w-6 text-wareongo-blue mr-2" />
                <h3 className="text-xl font-semibold text-wareongo-blue">{step.title}</h3>
              </div>
              <p className="text-wareongo-slate">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Original grid layout as fallback or additional detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mt-16 md:mt-8">
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
