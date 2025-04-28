
import React from 'react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-wareongo-ivory to-white py-16 md:py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-wareongo-blue mb-6">
            Find the Right Warehouse, Faster.
          </h1>
          <p className="text-lg md:text-xl text-wareongo-slate mb-10 max-w-2xl">
            Verified warehouses tailored to your business needs.<br/>
            Save time, start operations in days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="btn-primary text-lg"
              onClick={() => scrollToSection('request')}
            >
              Request a Warehouse
            </Button>
            <Button 
              variant="outline" 
              className="text-wareongo-blue border-wareongo-blue text-lg"
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
