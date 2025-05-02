
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

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
          
          <div className="mt-24 mb-16">
            <h2 className="text-3xl font-bold text-wareongo-blue text-center mb-16">Founders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {/* Founder 1 */}
              <Card className="bg-white rounded-lg shadow-lg overflow-hidden border-0 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center p-8">
                    <div className="mb-6">
                      <Avatar className="w-40 h-40 border-4 border-wareongo-blue">
                        <AvatarImage src="/lovable-uploads/62bd98f3-a5c6-450d-9480-ce6b1f89d3d7.png" alt="Jayanth Chunduru" />
                        <AvatarFallback className="bg-wareongo-blue text-white text-2xl font-bold">JC</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-2xl font-bold text-wareongo-blue mb-1">Jayanth Chunduru</h3>
                    <p className="text-wareongo-slate text-lg mb-4">Founder & CEO</p>
                    <a 
                      href="https://in.linkedin.com/in/jayanth-chunduru-85150a191" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-wareongo-blue hover:text-wareongo-sienna transition-colors font-medium"
                    >
                      LinkedIn Profile
                      <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
              
              {/* Founder 2 */}
              <Card className="bg-white rounded-lg shadow-lg overflow-hidden border-0 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center p-8">
                    <div className="mb-6">
                      <Avatar className="w-40 h-40 border-4 border-wareongo-green">
                        <AvatarImage src="/lovable-uploads/6ade9b1e-ee38-4568-bfb6-68ec3b0ecb2f.png" alt="Dhaval Gupta" />
                        <AvatarFallback className="bg-wareongo-green text-white text-2xl font-bold">DG</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-2xl font-bold text-wareongo-blue mb-1">Dhaval Gupta</h3>
                    <p className="text-wareongo-slate text-lg mb-4">Co-Founder & CPO</p>
                    <a 
                      href="https://in.linkedin.com/in/dhaval-gupta-7b6009128" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-wareongo-blue hover:text-wareongo-sienna transition-colors font-medium"
                    >
                      LinkedIn Profile
                      <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="text-center text-xl bg-wareongo-blue text-white py-10 px-6 rounded-lg max-w-2xl mx-auto shadow-lg">
            <p>Reach out to us at <a href="mailto:sales@wareongo.com" className="font-bold underline hover:text-wareongo-ivory transition-colors">sales@wareongo.com</a></p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
