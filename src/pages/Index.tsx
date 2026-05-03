
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TrustedBySection from '@/components/TrustedBySection';
import WhatWeStandForSection from '@/components/WhatWeStandForSection';
import BentoSection from '@/components/BentoSection';
import StatsSection from '@/components/StatsSection';
import EdgeSection from '@/components/EdgeSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import FeaturedListingsSection from '@/components/FeaturedListingsSection';
import AboutUsSection from '@/components/AboutUsSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <WhatWeStandForSection />
      <BentoSection />
      <StatsSection />
      <EdgeSection />
      <CaseStudiesSection />
      <FeaturedListingsSection />
      <AboutUsSection />
      <Footer />
    </div>
  );
};

export default Index;
