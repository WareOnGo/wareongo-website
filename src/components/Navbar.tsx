
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`bg-white shadow-md py-4 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo section */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-wareongo-sienna rounded-md flex items-center justify-center mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 8.5V13.5L12 17.5L4 13.5V8.5L12 4.5L20 8.5Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8.5L12 12.5L20 8.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12.5V17.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-wareongo-blue font-bold text-xl">WareOnGo</h1>
        </div>
        
        {/* Navigation options - modern, clean spacing */}
        <div className="hidden md:flex items-center">
          <div className="flex space-x-8 mr-8">
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors font-medium whitespace-nowrap text-sm"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('listings')}
              className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors font-medium whitespace-nowrap text-sm"
            >
              Featured Warehouses
            </button>
            <button 
              onClick={() => scrollToSection('request')}
              className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors font-medium whitespace-nowrap text-sm"
            >
              Request
            </button>
            <button 
              onClick={() => scrollToSection('about-us')}
              className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors font-medium whitespace-nowrap text-sm"
            >
              About Us
            </button>
          </div>
          <Button 
            size="sm"
            className="bg-wareongo-blue hover:bg-wareongo-blue/90 text-white font-medium px-5 py-2 rounded-md whitespace-nowrap"
            onClick={() => setIsContactDialogOpen(true)}
          >
            Contact Us
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title="Contact Us"
        description="Leave your details, and we'll get back to you soon."
        successMessage="We will reach out within 2 hours."
      />
    </nav>
  );
};

export default Navbar;
