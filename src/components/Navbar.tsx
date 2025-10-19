
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import LoginButton from "@/components/LoginButton";
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
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
          <img 
            src="https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/Screenshot%202025-08-27%20153449.png" 
            alt="WareOnGo Logo"
            className="h-10 w-auto mr-3"
          />
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
          <Link 
            to="/listings"
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            Listings
          </Link>
          <a 
            href="/about-us"
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors whitespace-nowrap text-sm"
          >
            About Us
          </a>
          
          {/* Role-based navigation */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin-panel"
              className="text-wareongo-blue hover:text-wareongo-blue/80 transition-colors whitespace-nowrap text-sm"
            >
              Admin Panel
            </Link>
          )}
          {user?.role === 'user' && (
            <Link 
              to="/user-dashboard"
              className="text-wareongo-blue hover:text-wareongo-blue/80 transition-colors whitespace-nowrap text-sm"
            >
              Dashboard
            </Link>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-wareongo-ivory rounded-md">
                <User className="h-4 w-4 text-wareongo-blue" />
                <span className="text-sm font-medium text-wareongo-charcoal">
                  {user.name || user.email}
                </span>
                {user.role && (
                  <span className="text-xs px-2 py-0.5 bg-wareongo-blue/10 text-wareongo-blue rounded-full">
                    {user.role}
                  </span>
                )}
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <LoginButton />
          )}
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
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100 text-center w-full"
          >
            Request a Warehouse
          </button>
          <button 
            onClick={() => {
              scrollToSection('how-it-works');
              setIsMobileMenuOpen(false);
            }}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100 text-center w-full"
          >
            How It Works
          </button>
          <Link 
            to="/listings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100 text-center w-full inline-block"
          >
            Listings
          </Link>
          <div className="text-center w-full">
            <Link 
              to="/about-us"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 border-b border-gray-100 inline-block w-full"
            >
              About Us
            </Link>
          </div>
          
          {/* Role-based navigation for mobile */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin-panel"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-wareongo-blue hover:text-wareongo-blue/80 transition-colors text-base font-medium py-2 border-b border-gray-100 text-center w-full inline-block"
            >
              Admin Panel
            </Link>
          )}
          {user?.role === 'user' && (
            <Link 
              to="/user-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-wareongo-blue hover:text-wareongo-blue/80 transition-colors text-base font-medium py-2 border-b border-gray-100 text-center w-full inline-block"
            >
              Dashboard
            </Link>
          )}
          
          {/* Login/User section in mobile menu */}
          <div className="pt-3 border-t border-gray-200">
            {isAuthenticated && user ? (
              <>
                <div className="flex flex-col items-center gap-2 mb-3 p-3 bg-wareongo-ivory rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-wareongo-blue" />
                    <span className="text-sm font-medium text-wareongo-charcoal">
                      {user.name || user.email}
                    </span>
                  </div>
                  {user.role && (
                    <span className="text-xs px-3 py-1 bg-wareongo-blue/10 text-wareongo-blue rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline"
                  className="w-full mb-3 flex items-center justify-center gap-2"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="mb-3 flex justify-center">
                <LoginButton />
              </div>
            )}
          </div>
          
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
        source="homepage"
      />
    </nav>
  );
};

export default Navbar;
