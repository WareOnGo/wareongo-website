
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
        {/* Hero Section */}
        <div className="bg-wareongo-blue text-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Reimagining Warehousing for India's Logistics Ecosystem</h1>
                <p className="text-xl md:text-2xl mb-8">Enabling faster discovery and seamless leasing for businesses of all sizes</p>
                <button className="bg-wareongo-sienna hover:bg-opacity-90 px-6 py-3 rounded-md font-semibold text-lg transition-all">
                  Learn How It Works
                </button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img 
                  src="/lovable-uploads/fc79915f-546e-49ab-81a7-5649717e13d4.png" 
                  alt="WareOnGo Logistics Ecosystem" 
                  className="max-w-full rounded-lg shadow-xl" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="section-container">
          <h2 className="section-title mb-12 text-4xl md:text-5xl">About Us</h2>
          
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
        </div>
        
        {/* How We Work Section */}
        <div className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="section-title mb-16">How We Work</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-wareongo-blue flex items-center justify-center text-white text-xl font-bold mb-6">1</div>
                <h3 className="text-xl font-bold mb-3">Tell Us Your Requirement</h3>
                <p className="text-wareongo-slate">Share your warehousing needs through our simple form</p>
              </div>
              
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="text-wareongo-sienna" size={36} />
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-wareongo-green flex items-center justify-center text-white text-xl font-bold mb-6">2</div>
                <h3 className="text-xl font-bold mb-3">Get Matched in 24-48 Hours</h3>
                <p className="text-wareongo-slate">We filter suitable options from our extensive database</p>
              </div>
              
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="text-wareongo-sienna" size={36} />
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-wareongo-blue flex items-center justify-center text-white text-xl font-bold mb-6">3</div>
                <h3 className="text-xl font-bold mb-3">Schedule Site Visits</h3>
                <p className="text-wareongo-slate">Book tours of your selected warehouses</p>
              </div>
              
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="text-wareongo-sienna" size={36} />
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-wareongo-green flex items-center justify-center text-white text-xl font-bold mb-6">4</div>
                <h3 className="text-xl font-bold mb-3">Go Live in &lt;5 Days</h3>
                <p className="text-wareongo-slate">Quick setup and onboarding for your new space</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Why Clients Trust Us Section */}
        <div className="section-container bg-wareongo-ivory bg-opacity-50">
          <h2 className="section-title mb-12">Why Clients Trust Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
              <CheckCircle className="text-wareongo-green mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Largest Inventory</h3>
                <p className="text-wareongo-slate">900+ warehouses across 15+ cities in India</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
              <CheckCircle className="text-wareongo-green mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">24-48 Hour Matching</h3>
                <p className="text-wareongo-slate">Quick turnaround on finding suitable options</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
              <CheckCircle className="text-wareongo-green mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Verified Listings Only</h3>
                <p className="text-wareongo-slate">All properties are verified by our team</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
              <CheckCircle className="text-wareongo-green mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Dedicated Relationship Manager</h3>
                <p className="text-wareongo-slate">Personalized assistance throughout your journey</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
              <CheckCircle className="text-wareongo-green mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">End-to-End Support</h3>
                <p className="text-wareongo-slate">From search to contract execution</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
              <CheckCircle className="text-wareongo-green mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Zero Brokerage</h3>
                <p className="text-wareongo-slate">No hidden fees or charges</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Segments Section */}
        <div className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="section-title mb-16">Who We Serve</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-t-4 border-wareongo-blue">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-center">For Logistics & E-commerce Brands</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-blue rounded-full mr-2"></div>
                      <span>Quick warehouse discovery</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-blue rounded-full mr-2"></div>
                      <span>Flexible lease terms</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-blue rounded-full mr-2"></div>
                      <span>Multiple location comparison</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-blue rounded-full mr-2"></div>
                      <span>Detailed property insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-wareongo-green">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-center">For 3PLs</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-green rounded-full mr-2"></div>
                      <span>Rapid expansion capabilities</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-green rounded-full mr-2"></div>
                      <span>Custom infrastructure options</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-green rounded-full mr-2"></div>
                      <span>Network optimization</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-green rounded-full mr-2"></div>
                      <span>Contract flexibility</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-wareongo-sienna">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-center">For Warehouse Owners</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-sienna rounded-full mr-2"></div>
                      <span>Higher occupancy rates</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-sienna rounded-full mr-2"></div>
                      <span>Quality tenant matching</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-sienna rounded-full mr-2"></div>
                      <span>Simplified leasing process</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-wareongo-sienna rounded-full mr-2"></div>
                      <span>Property showcase platform</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Use Cases Section */}
        <div className="section-container bg-wareongo-ivory bg-opacity-50">
          <h2 className="section-title mb-12">Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="overflow-hidden">
              <AspectRatio ratio={16/9}>
                <img src="/warehouse-1.jpg" alt="E-commerce warehouse" className="object-cover w-full h-full" />
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">E-commerce Fulfillment</h3>
                <p className="text-wareongo-slate mb-4">A leading e-commerce platform expanded to 3 new cities in just 45 days.</p>
                <div className="flex items-center text-wareongo-blue font-semibold">
                  <span>50,000 sq. ft.</span>
                  <span className="mx-2">•</span>
                  <span>Multi-city</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <AspectRatio ratio={16/9}>
                <img src="/warehouse-2.jpg" alt="FMCG Distribution Center" className="object-cover w-full h-full" />
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">FMCG Distribution</h3>
                <p className="text-wareongo-slate mb-4">A national FMCG brand established regional distribution centers to optimize supply chain.</p>
                <div className="flex items-center text-wareongo-blue font-semibold">
                  <span>75,000 sq. ft.</span>
                  <span className="mx-2">•</span>
                  <span>5 locations</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <AspectRatio ratio={16/9}>
                <img src="/warehouse-3.jpg" alt="Cold Chain Storage" className="object-cover w-full h-full" />
              </AspectRatio>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Cold Chain Storage</h3>
                <p className="text-wareongo-slate mb-4">A food delivery service found temperature-controlled facilities across major metros.</p>
                <div className="flex items-center text-wareongo-blue font-semibold">
                  <span>30,000 sq. ft.</span>
                  <span className="mx-2">•</span>
                  <span>4 cities</span>
                </div>
              </CardContent>
            </Card>
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
        
        <div className="text-center text-xl bg-wareongo-blue text-white py-10 px-6 rounded-lg max-w-2xl mx-auto shadow-lg mb-16">
          <p>Reach out to us at <a href="mailto:sales@wareongo.com" className="font-bold underline hover:text-wareongo-ivory transition-colors">sales@wareongo.com</a></p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
