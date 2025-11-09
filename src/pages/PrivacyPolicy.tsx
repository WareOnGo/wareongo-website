import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
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
              Privacy Policy for Google OAuth Integration
            </h1>
            
            <div className="text-sm text-gray-600 mb-8">
              <p><strong>Effective Date:</strong> 1st November 2025</p>
              <p><strong>Last Updated:</strong> 1st November 2025</p>
            </div>

            <div className="prose prose-gray max-w-none space-y-6">
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy describes how Neuroware Technologies Private Limited ("we," "our," "us") collect, use, and disclose personal information when you use the OAuth consent screen provided by Google to log in to our application using your email address. By logging in with your email address, you consent to the practices described in this policy.
              </p>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Information We Collect
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you use the OAuth consent screen to log in to our application using your email address, we may collect the following types of personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Personal Information:</strong> We may collect your name, email address, and other contact details associated with your email account.
                  </li>
                  <li>
                    <strong>OAuth Permissions:</strong> We may collect and store the permissions you grant to our application during the OAuth consent process. These permissions allow us to access certain information from your email account, as authorized by you.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Use of Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information collected through the OAuth consent screen for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Authentication and Account Access:</strong> We use your email address and associated permissions to authenticate your identity and provide you with access to our application.
                  </li>
                  <li>
                    <strong>Service Provision:</strong> We may use the information to provide you with the requested services, including personalized features, support, and updates related to our application.
                  </li>
                  <li>
                    <strong>Communication:</strong> We may use your email address to send you important notifications, updates, and information related to your use of our application.
                  </li>
                  <li>
                    <strong>Improvements and Analytics:</strong> We may use aggregated and anonymized data for analytical purposes to improve our application, understand user preferences, and optimize our services.
                  </li>
                  <li>
                    <strong>Google API Services Usage:</strong> Information received from Google APIs is not used to develop, improve, or train generalized artificial intelligence (AI) and/or machine learning (ML) models.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Disclosure of Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your explicit consent, except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Service Providers:</strong> We may share your personal information with trusted third-party service providers who assist us in operating our application and providing services to you. These service providers are contractually obligated to maintain the confidentiality and security of your personal information.
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> We may disclose your personal information if required by law, governmental or regulatory authorities, or to protect our rights, property, or safety, or that of our users or the public.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We take reasonable measures to protect the personal information collected through the OAuth consent screen from unauthorized access, use, or disclosure. However, please note that no method of transmission over the internet or method of electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You may have certain rights regarding your personal information, including the right to access, correct, or delete your information. To exercise these rights or if you have any questions or concerns about the processing of your personal information, please contact us using the information provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Changes to this Privacy Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated Privacy Policy on our website or through other communication channels.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mt-8 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at{' '}
                  <a href="mailto:sales@wareongo.com" className="text-wareongo-blue hover:underline">
                    sales@wareongo.com
                  </a>
                </p>
              </section>

              <section className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-sm">
                  By using the OAuth consent screen provided by Google and logging in with your email address, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your personal information as described herein.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
