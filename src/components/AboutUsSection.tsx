
import React from 'react';
import { Building, Users, Award, Globe } from 'lucide-react';

const AboutUsSection = () => {
  return (
    <section id="about-us" className="section-container bg-wareongo-ivory">
      <h2 className="section-title">About Us</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-wareongo-blue">Who We Are</h3>
          <p className="text-wareongo-slate mb-6">
            WareOnGo is a warehouse marketplace connecting businesses with flexible, 
            verified warehouse spaces. We simplify the warehouse hunting process, 
            allowing businesses to focus on growth instead of logistics hurdles.
          </p>
          
          <h3 className="text-2xl font-semibold mb-4 text-wareongo-blue">Our Mission</h3>
          <p className="text-wareongo-slate mb-6">
            We're on a mission to transform warehouse procurement by making it faster, 
            more transparent, and cost-effective. By leveraging technology and logistics expertise, 
            we help businesses scale operations without the traditional warehousing headaches.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="flex items-start">
              <div className="bg-wareongo-blue/10 p-2 rounded-full mr-3">
                <Building className="h-5 w-5 text-wareongo-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-wareongo-blue">50+ Cities</h4>
                <p className="text-sm text-wareongo-slate">Nationwide network</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-wareongo-green/10 p-2 rounded-full mr-3">
                <Users className="h-5 w-5 text-wareongo-green" />
              </div>
              <div>
                <h4 className="font-semibold text-wareongo-green">200+ Clients</h4>
                <p className="text-sm text-wareongo-slate">Trusted by businesses</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-wareongo-sienna/10 p-2 rounded-full mr-3">
                <Award className="h-5 w-5 text-wareongo-sienna" />
              </div>
              <div>
                <h4 className="font-semibold text-wareongo-sienna">98% Satisfaction</h4>
                <p className="text-sm text-wareongo-slate">Client success rate</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-wareongo-purple/10 p-2 rounded-full mr-3">
                <Globe className="h-5 w-5 text-wareongo-purple" />
              </div>
              <div>
                <h4 className="font-semibold text-wareongo-purple">5+ Years</h4>
                <p className="text-sm text-wareongo-slate">Industry experience</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="aspect-w-16 aspect-h-9 bg-wareongo-blue/5 rounded-lg mb-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-2 p-4">
              <div className="h-48 rounded-md bg-wareongo-blue/10"></div>
              <div className="h-48 rounded-md bg-wareongo-sienna/10"></div>
              <div className="h-48 rounded-md bg-wareongo-green/10"></div>
              <div className="h-48 rounded-md bg-wareongo-purple/10"></div>
            </div>
          </div>
          
          <blockquote className="italic text-wareongo-slate border-l-4 border-wareongo-blue pl-4 py-2">
            "Our mission is to eliminate the complexity and stress from warehouse hunting, 
            allowing businesses to focus on what they do best - growing and serving their customers."
          </blockquote>
          <p className="text-right mt-2 font-semibold text-wareongo-blue">- WareOnGo Founder</p>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
