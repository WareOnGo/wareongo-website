
import React, { useEffect } from 'react';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLegalPage } from '@/data/legalPages';
import { LegalDates, LegalBody } from '@/components/LegalContent';

const TermsOfService = () => {
  const content = getLegalPage('terms-of-service');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHead
        title={content.seoTitle}
        description={content.description}
        path="/terms-of-service"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-wareongo-blue">{content.title}</h1>
        
        <LegalDates content={content} />
        <LegalBody content={content} />
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
