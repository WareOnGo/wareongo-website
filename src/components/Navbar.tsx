
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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

  const navLinkClass =
    "text-wareongo-charcoal hover:text-wareongo-blue hover:bg-wareongo-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue/40 transition-colors duration-200 whitespace-nowrap text-sm font-medium px-4 py-3 rounded-lg";

  return (
    <nav className="sticky top-0 z-50 pt-4 px-4">
      <div className="container mx-auto flex justify-between items-center gap-4">
        {/* Logo pill */}
        <Link
          to="/"
          className="flex items-center justify-center bg-wareongo-ivory/80 backdrop-blur-md shadow-sm rounded-xl px-5 py-3"
        >
          <img
            src="/logo_transparent.png"
            alt="WareOnGo Logo"
            className="h-7 w-auto"
          />
        </Link>

        {/* Desktop nav pill */}
        <div className="hidden md:flex items-center bg-wareongo-ivory/80 backdrop-blur-md shadow-sm rounded-xl p-2 gap-1">
          <button onClick={() => scrollToSection('request')} className={navLinkClass}>
            Request a Warehouse
          </button>
          <Link to="/listings" className={navLinkClass}>
            Listings
          </Link>
          <Link to="/about-us" className={navLinkClass}>
            About Us
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin-panel" className={`${navLinkClass} text-wareongo-blue`}>
              Admin Panel
            </Link>
          )}
          {user?.role === 'user' && (
            <Link to="/user-dashboard" className={`${navLinkClass} text-wareongo-blue`}>
              Dashboard
            </Link>
          )}

          {isAuthenticated && user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="rounded-lg ml-1 text-wareongo-charcoal hover:text-wareongo-blue"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          )}

          {/* Highlighted CTA */}
          <button
            onClick={() => setIsContactDialogOpen(true)}
            className="ml-1 bg-wareongo-blue text-white text-sm font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Contact Us
          </button>
        </div>

        {/* Mobile toggle pill */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            ref={mobileButtonRef}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
            className="bg-wareongo-ivory/80 backdrop-blur-md shadow-sm rounded-xl p-3 flex items-center justify-center"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-wareongo-blue" />
            ) : (
              <Menu className="h-5 w-5 text-wareongo-blue" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg z-40 transition-all duration-300 transform ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-5 flex flex-col space-y-3">
          <button
            onClick={() => {
              scrollToSection('request');
              setIsMobileMenuOpen(false);
            }}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 text-center w-full"
          >
            Request a Warehouse
          </button>
          <Link
            to="/listings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 text-center w-full"
          >
            Listings
          </Link>
          <Link
            to="/about-us"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-wareongo-charcoal hover:text-wareongo-blue transition-colors text-base font-medium py-2 text-center w-full"
          >
            About Us
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin-panel"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-wareongo-blue text-base font-medium py-2 text-center w-full"
            >
              Admin Panel
            </Link>
          )}
          {user?.role === 'user' && (
            <Link
              to="/user-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-wareongo-blue text-base font-medium py-2 text-center w-full"
            >
              Dashboard
            </Link>
          )}

          {isAuthenticated && user && (
            <div className="pt-3 border-t border-gray-200">
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
            </div>
          )}

          <button
            onClick={() => {
              setIsContactDialogOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="bg-wareongo-blue text-white text-base font-medium px-5 py-3 rounded-full hover:opacity-90 transition-opacity w-full"
          >
            Contact Us
          </button>
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
