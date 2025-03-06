
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
          {/* Logo */}
          <div className="mb-6 inline-flex items-center">
            <div className="w-12 h-12 bg-wareongo-sienna rounded-lg flex items-center justify-center mr-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8.5V13.5L12 17.5L4 13.5V8.5L12 4.5L20 8.5Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8.5L12 12.5L20 8.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12.5V17.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-wareongo-blue">Ware</span>
              <span className="text-wareongo-sienna">On</span>
              <span className="text-wareongo-blue">Go</span>
            </h1>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-wareongo-blue mb-6 max-w-4xl">
            Find the Perfect Warehouse Space for Your Business
          </h2>
          
          <p className="text-lg md:text-xl text-wareongo-slate mb-10 max-w-2xl">
            WareOnGo connects businesses with the right warehouse space, faster and more affordably. Save time, reduce costs, and scale with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="bg-wareongo-sienna hover:bg-wareongo-sienna/90 text-white text-lg group"
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
                <path d="M12 5V19M12 5L6 11M12 5L18 11" stroke="#B3502D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
