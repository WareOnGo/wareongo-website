
import React from 'react';
import Navbar from '@/components/Navbar';
import BrandHero from '@/components/BrandHero';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import ListingsSection from '@/components/ListingsSection';
import AboutUsSection from '@/components/AboutUsSection';
import RequestFormSection from '@/components/RequestFormSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <BrandHero />
      <FeaturesSection />
      <HowItWorksSection />
      <ListingsSection />
      <AboutUsSection />
      <RequestFormSection />
      <Footer />
    </div>
  );
};

export default Index;
