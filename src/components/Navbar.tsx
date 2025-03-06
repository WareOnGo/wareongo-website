
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";

const Navbar = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-wareongo-blue text-2xl font-bold">WareOnGo</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('listings')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors"
          >
            Listings
          </button>
          <button 
            onClick={() => scrollToSection('request')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors"
          >
            Request
          </button>
          <Button 
            className="btn-primary"
            onClick={() => setIsContactDialogOpen(true)}
          >
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
