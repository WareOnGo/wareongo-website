
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ExternalLink } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="section-container">
          <h1 className="section-title mb-8">About Us</h1>
          
          <div className="max-w-3xl mx-auto text-wareongo-charcoal">
            <p className="mb-6 text-lg">
              At WareOnGo we're building the future of warehousing discovery. Our mission is simple: make finding the right warehouse as seamless and fast as booking a hotel. In a sector plagued by opacity, outdated listings, and inefficiencies, we bring transparency, speed, and intelligence.
            </p>
            
            <p className="mb-12 text-lg">
              Our vision is to become India's most trusted warehousing intelligence platform - empowering businesses of all sizes to discover, compare, and finalise warehousing spaces with confidence.
            </p>
            
            <h2 className="text-2xl font-bold text-wareongo-blue mb-6">The Team Behind WareOnGo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Team Member 1 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden">
                  {/* Placeholder for profile image */}
                  <div className="w-full h-full flex items-center justify-center bg-wareongo-blue text-white text-xl font-bold">
                    JC
                  </div>
                </div>
                <h3 className="text-xl font-bold text-wareongo-blue">Jayanth Chunduru</h3>
                <p className="text-wareongo-slate mb-3">Founder & CEO</p>
                <a 
                  href="https://in.linkedin.com/in/jayanth-chunduru-85150a191" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-wareongo-blue hover:text-wareongo-sienna transition-colors"
                >
                  LinkedIn Profile
                  <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
              
              {/* Team Member 2 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden">
                  {/* Placeholder for profile image */}
                  <div className="w-full h-full flex items-center justify-center bg-wareongo-green text-white text-xl font-bold">
                    DG
                  </div>
                </div>
                <h3 className="text-xl font-bold text-wareongo-blue">Dhaval Gupta</h3>
                <p className="text-wareongo-slate mb-3">Co-Founder & CPO</p>
                <a 
                  href="https://in.linkedin.com/in/dhaval-gupta-7b6009128" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-wareongo-blue hover:text-wareongo-sienna transition-colors"
                >
                  LinkedIn Profile
                  <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            <div className="text-center text-lg">
              <p>Reach out to us at <a href="mailto:sales@wareongo.com" className="text-wareongo-blue hover:text-wareongo-sienna">sales@wareongo.com</a></p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
