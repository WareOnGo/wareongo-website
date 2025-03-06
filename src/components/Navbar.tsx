
import React from 'react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-wareongo-blue text-2xl font-bold">WareOnGo</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#how-it-works" className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors">
            How It Works
          </a>
          <a href="#listings" className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors">
            Listings
          </a>
          <a href="#request" className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors">
            Request
          </a>
          <Button className="btn-primary">
            Contact Us
          </Button>
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
