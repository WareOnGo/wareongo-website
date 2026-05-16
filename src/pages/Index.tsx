
import React, { useEffect } from 'react';
import PageHead from '@/components/PageHead';
import { SITE_URL } from '@/config/config';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TrustedBySection from '@/components/TrustedBySection';
import WhatWeStandForSection from '@/components/WhatWeStandForSection';
import BentoSection from '@/components/BentoSection';
import WhoWeServeSection from '@/components/WhoWeServeSection';
import StatsSection from '@/components/StatsSection';
import EdgeSection from '@/components/EdgeSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import FeaturedListingsSection from '@/components/FeaturedListingsSection';
import AboutUsSection from '@/components/AboutUsSection';
import RequestCTASection from '@/components/RequestCTASection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WareOnGo',
    legalName: 'Neuroware Technologies Private Limited',
    url: SITE_URL,
    logo: `${SITE_URL}/WOG_Logo_light.png`,
    description: 'WareOnGo connects businesses with warehouse space across India — transparent listings, verified compliance, faster discovery.',
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="WareOnGo — Find Warehouse Space Fast Across India"
        description="WareOnGo connects businesses with the right warehouse space across India — faster discovery, transparent listings, and verified compliance. 1,500+ warehouses listed."
        path="/"
      >
        <script type="application/ld+json">{JSON.stringify(organizationLd)}</script>
      </PageHead>
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <WhatWeStandForSection />
      {/* <BentoSection /> */}
      <WhoWeServeSection />
      <StatsSection />
      <EdgeSection />
      {/* <CaseStudiesSection /> */}
      <FeaturedListingsSection />
      <AboutUsSection />
      <RequestCTASection />
      <Footer />
    </div>
  );
};

export default Index;
