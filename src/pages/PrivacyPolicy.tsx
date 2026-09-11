import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { getLegalPage } from '@/data/legalPages';
import { LegalDates, LegalBody } from '@/components/LegalContent';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const content = getLegalPage('privacy-policy');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHead
        title={content.seoTitle}
        description={content.description}
        path="/privacy-policy"
      />
      <Navbar />

      <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
        <div className="section-container px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button 
              onClick={handleBackClick} 
              variant="ghost" 
              className="text-wareongo-blue hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Privacy Policy Content */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-wareongo-charcoal mb-4">
              {content.title}
            </h1>
            
            <LegalDates content={content} />
            <LegalBody content={content} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
