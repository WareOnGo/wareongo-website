
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Zap, CheckCircle, Clock } from 'lucide-react';

const BrandHero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const logoScale = scrollY > 100 ? 0 : 1 - (scrollY / 100);
  const contentOpacity = scrollY > 100 ? 0 : 1 - (scrollY / 100);

  return (
    <section className="relative bg-gradient-to-br from-wareongo-ivory to-white py-16 md:py-24 overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-wareongo-purple opacity-5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-wareongo-sienna opacity-5 rounded-tr-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-col items-center text-center mb-12 transition-opacity duration-300`} style={{ opacity: Math.max(contentOpacity, 0.2) }}>
          <div className={`logo-container mb-6 transform transition-all duration-300`} style={{ transform: `scale(${logoScale + 0.2})`, opacity: logoScale }}>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-wareongo-sienna rounded-lg flex items-center justify-center mr-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 8.5V13.5L12 17.5L4 13.5V8.5L12 4.5L20 8.5Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 8.5L12 12.5L20 8.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12.5V17.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-wareongo-blue mb-6 max-w-4xl">
            Find the Right Warehouse, Faster.
          </h2>
          
          <p className="text-lg md:text-xl text-wareongo-slate mb-10 max-w-2xl">
            Verified warehouses tailored to your business needs. Save time, start operations in days.
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#B3502D" strokeWidth="1.5" fill="none"/>
                <path d="M14.31 8H9.69c-.36 0-.65.29-.65.65v6.7c0 .36.29.65.65.65h4.62c.36 0 .65-.29.65-.65v-6.7c0-.36-.29-.65-.65-.65z" stroke="#B3502D" strokeWidth="1.5" fill="none"/>
                <path d="M12 8v8M9.5 10.5h5M9.5 12.5h5M9.5 14.5h5" stroke="#B3502D" strokeWidth="1.5"/>
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
