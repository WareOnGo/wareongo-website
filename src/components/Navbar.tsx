
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  
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

  // Handle clicks outside of mobile menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current && 
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <a 
            href="/about-us"
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            About Us
          </a>
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            ref={mobileButtonRef}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-wareongo-blue" />
            ) : (
              <Menu className="h-6 w-6 text-wareongo-blue" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-md z-40 transition-all duration-300 transform ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col space-y-5">
          <button 
            onClick={() => {
              scrollToSection('request');
              setIsMobileMenuOpen(false);
            }}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100"
          >
            Request a Warehouse
          </button>
          <button 
            onClick={() => {
              scrollToSection('how-it-works');
              setIsMobileMenuOpen(false);
            }}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100"
          >
            How It Works
          </button>
          <button 
            onClick={() => {
              scrollToSection('listings');
              setIsMobileMenuOpen(false);
            }}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100"
          >
            Listings
          </button>
          <Link 
            to="/about-us"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100"
          >
            About Us
          </Link>
          <Button 
            className="btn-primary w-full mt-4"
            onClick={() => {
              setIsContactDialogOpen(true);
              setIsMobileMenuOpen(false);
            }}
          >
            Contact Us
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
