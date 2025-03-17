
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Zap, CheckCircle, Clock } from 'lucide-react';

const BrandHero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-wareongo-ivory to-white py-16 md:py-24 overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-wareongo-purple opacity-5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-wareongo-sienna opacity-5 rounded-tr-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-wareongo-blue mb-6 max-w-4xl">
            Find the Perfect Warehouse Space for Your Business
          </h2>
          
          <p className="text-lg md:text-xl text-wareongo-slate mb-10 max-w-2xl">
            WareOnGo connects businesses with the right warehouse space, faster and more affordably. Save time, reduce costs, and scale with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="bg-wareongo-blue hover:bg-wareongo-blue/90 text-white text-lg group"
              onClick={() => scrollToSection('request')}
            >
              <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Request a Warehouse
            </Button>
            <Button 
              variant="outline" 
              className="text-wareongo-blue border-wareongo-blue text-lg group"
              onClick={() => scrollToSection('how-it-works')}
            >
              <Zap className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              How It Works
            </Button>
          </div>
        </div>
        
        {/* Unique value proposition badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 flex items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-wareongo-blue/10 p-2 rounded-full mr-3">
              <Clock className="h-5 w-5 text-wareongo-blue" />
            </div>
            <p className="text-wareongo-charcoal font-medium">Fast Matching Process</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 flex items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-wareongo-green/10 p-2 rounded-full mr-3">
              <CheckCircle className="h-5 w-5 text-wareongo-green" />
            </div>
            <p className="text-wareongo-charcoal font-medium">Verified Warehouses</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 flex items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-wareongo-sienna/10 p-2 rounded-full mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#B3502D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M8.5 12.5h7m-7 3h7" stroke="#B3502D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7v10M9 9.5v5M15 9.5v5" stroke="#B3502D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-wareongo-charcoal font-medium">Reduced Costs</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandHero;
