
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const scrollToSection = (id: string) => {
    // If not on homepage, navigate to homepage first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Add a small delay to ensure navigation happens before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If already on homepage, just scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center mr-10">
          <div className="w-10 h-10 bg-wareongo-sienna rounded-lg flex items-center justify-center mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 8.5V13.5L12 17.5L4 13.5V8.5L12 4.5L20 8.5Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8.5L12 12.5L20 8.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12.5V17.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-wareongo-blue text-2xl font-bold">WareOnGo</h1>
        </Link>
        
        <div className="hidden md:flex items-center space-x-10 flex-grow justify-center">
          <button 
            onClick={() => scrollToSection('request')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            Request a Warehouse
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('listings')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            Listings
          </button>
          <button 
            onClick={() => scrollToSection('about-us')}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            About Us
          </button>
        </div>
        
        <div className="hidden md:block">
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
        description="Share your details, and we'll get back to you!"
        successMessage="We will reach out within 2 hours."
        source="Contact_Us_topnav"
      />
    </nav>
  );
};

export default Navbar;
