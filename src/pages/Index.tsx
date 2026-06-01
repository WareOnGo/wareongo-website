
import React, { useEffect } from 'react';
import PageHead from '@/components/PageHead';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WhatWeStandForSection from '@/components/WhatWeStandForSection';
import BentoSection from '@/components/BentoSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import EdgeSection from '@/components/EdgeSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import FeaturedListingsSection from '@/components/FeaturedListingsSection';
import AboutUsSection from '@/components/AboutUsSection';
import RequestCTASection from '@/components/RequestCTASection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'WareOnGo',
    legalName: 'Neuroware Technologies Private Limited',
    url: SITE_URL,
    logo: `${SITE_URL}/WOG_Logo_light.png`,
    image: `${SITE_URL}/og-image.png`,
    description: 'WareOnGo connects businesses with warehouse space across India — transparent listings, verified compliance, faster discovery.',
    slogan: 'A better warehouse, on better terms.',
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    knowsAbout: [
      'Warehouse leasing',
      'Industrial real estate',
      'Warehousing',
      'Dark stores',
      'Third-party logistics (3PL)',
      'Supply chain real estate',
      'Commercial leasing in India',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-83188-25478',
        email: 'sales@wareongo.com',
        contactType: 'sales',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
    ],
    // TODO: add social profile URLs (LinkedIn / Instagram / X) here for stronger entity attribution.
    sameAs: [],
  };

  const webSiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'WareOnGo',
    description: 'Verified warehouse space for rent across India — transparent listings, expert advisory, faster discovery.',
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-IN',
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="Warehouse for Rent in India | WareOnGo"
        description="Find verified warehouse space for rent across India — 1,500+ listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours."
        path="/"
      >
        <script type="application/ld+json">{JSON.stringify(organizationLd)}</script>
        <script type="application/ld+json">{JSON.stringify(webSiteLd)}</script>
      </PageHead>
      <Navbar />
      <HeroSection />
      <WhatWeStandForSection />
      {/* <BentoSection /> */}
      <HowItWorksSection />
      <EdgeSection />
      {/* <CaseStudiesSection /> */}
      <FeaturedListingsSection />
      {/* <AboutUsSection /> */}
      <RequestCTASection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
