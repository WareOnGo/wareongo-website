import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFooterNav = (label: string, destination: string, action: () => void) => {
    trackEvent('nav_click', { label, destination, position: 'footer' });
    action();
  };

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

  const handleAboutUsClick = () => {
    // Navigate to About Us page
    if (location.pathname !== '/about-us') {
      navigate('/about-us');
    } else {
      // If already on About Us page, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-wareongo-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WareOnGo</h3>
            <p className="mb-4 text-gray-300">
              Find the Right Warehouse, Faster.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleFooterNav('Home', '/', () => navigate('/'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('How It Works', '#how-it-works', () => scrollToSection('how-it-works'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('Listings', '#listings', () => scrollToSection('listings'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Listings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('Request a Warehouse', '#request', () => scrollToSection('request'))}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Request a Warehouse
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterNav('About Us', '/about-us', handleAboutUsClick)}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Warehouse Search</li>
              <li className="text-gray-300">Build-To-Suit</li>
              <li className="text-gray-300">Lease Negotiation</li>
              <li className="text-gray-300">Compliance Procurement</li>
              <li className="text-gray-300">Manpower Services</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <a
                  href="tel:+918318825478"
                  onClick={() => trackEvent('contact_click', { contact_type: 'phone', value: '+918318825478', location: 'footer' })}
                  className="hover:text-wareongo-ivory transition-colors"
                >
                  (+91) 83188-25478
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <a
                  href="mailto:sales@wareongo.com"
                  onClick={() => trackEvent('contact_click', { contact_type: 'email', value: 'sales@wareongo.com', location: 'footer' })}
                  className="hover:text-wareongo-ivory transition-colors"
                >
                  sales@wareongo.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-400 text-sm">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
            <Link
              to="/privacy-policy"
              onClick={() => trackEvent('nav_click', { label: 'Privacy Policy', destination: '/privacy-policy', position: 'footer' })}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              to="/terms-of-service"
              onClick={() => trackEvent('nav_click', { label: 'Terms of Service', destination: '/terms-of-service', position: 'footer' })}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              to="/login"
              onClick={() => trackEvent('nav_click', { label: 'Login', destination: '/login', position: 'footer' })}
              className="text-gray-500 hover:text-white transition-colors text-xs"
            >
              Login
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Neuroware Technologies Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
