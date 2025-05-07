import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleAboutUsClick = (e: React.MouseEvent) => {
    if (location.pathname === '/about-us') {
      e.preventDefault();
      // If already on About Us page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Otherwise navigate to About Us page
      navigate('/about-us');
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
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/')} 
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('listings')} 
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Listings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('request')} 
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Request a Warehouse
                </button>
              </li>
              <li>
                <button
                  onClick={handleAboutUsClick}
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
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>502, SV Sai Srinivasam Apartments<br />Hyderabad, TS - 500018</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <a 
                  href="tel:+918318825478" 
                  className="hover:text-wareongo-ivory transition-colors"
                >
                  (+91) 83188-25478
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <a 
                  href="mailto:sales@wareongo.com" 
                  className="hover:text-wareongo-ivory transition-colors"
                >
                  sales@wareongo.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Neuroware Technologies Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
