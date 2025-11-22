
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
        <div className="section-container">
          <h1 className="section-title mb-12 text-4xl md:text-5xl">About Us</h1>
          
          <div className="max-w-3xl mx-auto text-wareongo-charcoal space-y-8 bg-white rounded-xl p-8 shadow-md">
            <p className="text-xl leading-relaxed">
              At WareOnGo we're building the future of warehousing discovery. Our mission is simple: make finding the right warehouse as seamless and fast as booking a hotel. In a sector plagued by opacity, outdated listings, and inefficiencies, we bring transparency, speed, and intelligence.
            </p>
            
            <div className="border-l-4 border-wareongo-blue pl-6 py-2 my-10">
              <p className="text-2xl font-semibold text-wareongo-blue italic">
                Our vision is to become India's most trusted warehousing intelligence platform - empowering businesses of all sizes to discover, compare, and finalise warehousing spaces with confidence.
              </p>
            </div>
          </div>
          
          <div className="text-center text-xl bg-wareongo-blue text-white py-10 px-6 rounded-lg max-w-2xl mx-auto shadow-lg mt-16">
            <p>Reach out to us at <a href="mailto:sales@wareongo.com" className="font-bold underline hover:text-wareongo-ivory transition-colors">sales@wareongo.com</a></p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
