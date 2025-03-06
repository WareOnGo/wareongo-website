
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wareongo-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WareOnGo</h3>
            <p className="mb-4 text-gray-300">
              Finding the perfect warehouse space for your business needs, faster and more affordably.
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
              <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
              <li><a href="#listings" className="text-gray-300 hover:text-white">Listings</a></li>
              <li><a href="#request" className="text-gray-300 hover:text-white">Request a Warehouse</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Warehouse Search</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Logistics Consulting</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Lease Negotiation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Warehouse Analysis</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Supply Chain Optimization</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>123 Logistics Way, Suite 456<br />Chicago, IL 60601</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>info@wareongo.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} WareOnGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
