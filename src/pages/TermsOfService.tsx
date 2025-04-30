
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-wareongo-blue">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <p className="text-sm text-gray-500 mb-6">(Last updated: 29 Apr, 2025)</p>
          
          <h2 className="text-xl font-bold mt-6 mb-3 text-wareongo-blue">GENERAL</h2>
          <p>We, Neuroware Technologies Private Limited(hereinafter referred to as the "Company") is a Private Limited company registered under the Companies Act 1956/2013, having its registered office at "B-21, Near Galleria Market, Gurgaon – 122022" represented by its proprietor and members, where such expression shall unless repugnant to the context thereof, be deemed to include its proprietor, respective legal heirs, representatives, administrators, permitted successors and assigns. The creator of these Terms of Service ensures steady commitment to Your privacy with regard to the protection of your invaluable information. This document contains information about the Application "Wareongo" and Website www.wareongo.com (hereinafter collectively referred to as the "Platform")</p>
          
          <p>For the purpose of these Terms of Use ("Terms"), wherever the context so requires,</p>
          <p>"We", "Our", and "Us" shall mean and refer to the Platform and/or the Company, as the context so requires.</p>
          <p>"You", "Your", "Yourself", "Customer" shall mean and refer to natural and legal individuals who use the Platform and who is competent to enter into binding contracts, as per Indian laws.</p>
          <p>"Services" refer to providing a Platform for Customers to avail service including but not limited to warehousing and distribution services through this platform.</p>
          <p>"Third Parties" refer to any Application, company or individual apart from the Customer and the creator of this Platform.</p>
          <p>The term "Platform" to the website only works as a bridge between the Company and the Customers to facilitate or list warehouse operations.</p>
          
          {/* Add additional content as needed */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
