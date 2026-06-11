
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
    image: `${SITE_URL}/og-image.jpg`,
    description: 'WareOnGo connects businesses with warehouse space across India — transparent listings, verified compliance, faster discovery.',
    slogan: 'A better warehouse, on better terms.',
    foundingDate: '2024',
    founder: [
      { '@type': 'Person', name: 'Jayanth Chunduru', jobTitle: 'Co-founder & CEO' },
      { '@type': 'Person', name: 'Dhaval Gupta', jobTitle: 'Co-founder & CPO' },
    ],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ib-21, Ridgewood Estate, DLF Phase 4',
      addressLocality: 'Gurugram',
      addressRegion: 'Haryana',
      addressCountry: 'IN',
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
    // Social profiles — strengthen entity attribution for Google + AI engines.
    // Add Instagram / X here when those accounts exist.
    sameAs: ['https://www.linkedin.com/company/wareongo'],
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
        title="Warehouse & Godown for Rent in India | WareOnGo"
        description="Find verified warehouse & godown space for rent across India — 1,500+ listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours."
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
