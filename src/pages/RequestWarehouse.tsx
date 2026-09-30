import React, { useState, useEffect, useRef } from 'react';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Loader, Mail, MessageCircle } from 'lucide-react';
import { submitWarehouseRequest } from '@/services/warehouseRequest';
import { trackEvent } from '@/lib/analytics';
import { useLeadAnalytics } from '@/hooks/useLeadAnalytics';

const RequestWarehouse = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    location: '',
    additionalComments: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const analytics = useLeadAnalytics(true, { form_id: 'warehouse_request', lead_type: 'warehouse_request', placement: 'request_page' }, true);

  const submissionError = useRef('server');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    analytics.attempt();


    if (![formData.fullName, formData.phone, formData.email, formData.company, formData.location].every(value => value.trim())) {
      analytics.invalid();
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const requirementsPayload = JSON.stringify({
      location: formData.location,
      additionalComments: formData.additionalComments || null,
      contact: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
      },
    });

    try {
      const result = await submitWarehouseRequest({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        location: formData.location,
        requirements: requirementsPayload
      });

      if (!result.success) {
        submissionError.current = result.errorCode || 'server';
        throw new Error(result.error);
      }

      analytics.success(result.leadId);

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "We'll be in touch with warehouse options shortly!",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined;
      analytics.failure(submissionError.current);
      setError(message || 'Something went wrong. Please try again.');
      toast({
        title: "Error",
        description: message || 'Failed to submit request. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="Request Warehouse Space in India | WareOnGo"
        description="Tell us your warehouse requirements and our team will match you with verified options across India. Get custom shortlist & site visit within 48 hours."
        path="/request-warehouse"
      />
      <Navbar />

      <main className="page-content flex-1 pb-6 md:pb-12 lg:pb-16">
        <div className="container mx-auto max-w-2xl">
          <div className="space-y-4">
            <h1 className="ui-page-title text-wareongo-blue">
              Request a Warehouse
            </h1>

            {/* Direct contact row at top */}
            <div className="space-y-3">
              <p className="text-sm text-wareongo-slate">Prefer to reach out directly? Contact us at:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:sales@wareongo.com"
                  onClick={() => trackEvent('contact_click', { contact_method: 'email', contact_target: 'sales_email', placement: 'request_warehouse_page' })}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 border border-ui-line flex items-center justify-center transition-colors group-hover:bg-ui-tint">
                    <Mail className="w-4 h-4 text-wareongo-blue" />
                  </div>
                  <p className="text-sm font-medium text-wareongo-blue group-hover:underline">sales@wareongo.com</p>
                </a>
                <a
                  href="https://wa.me/917400184225"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('contact_click', { contact_method: 'whatsapp', contact_target: 'sales_whatsapp', placement: 'request_warehouse_page' })}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 border border-ui-line flex items-center justify-center transition-colors group-hover:bg-ui-tint">
                    <MessageCircle className="w-4 h-4 text-wareongo-blue" />
                  </div>
                  <p className="text-sm font-medium text-wareongo-blue group-hover:underline">+91 74001 84225</p>
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="bg-ui-surface border border-ui-outline rounded-xl p-5 sm:p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <h2 className="ui-section-title text-wareongo-blue mb-4">Thank You!</h2>
                  <p className="text-wareongo-slate mb-6">
                    Our team is curating the best-fit warehouses for you.
                  </p>
                  <p className="text-sm text-wareongo-slate">
                    For any questions, reach our POC at{' '}
                    <a href="tel:+917400184225" className="text-wareongo-blue underline underline-offset-2">+91 74001 84225</a>{' '}
                    or{' '}
                    <a href="mailto:sales@wareongo.com" className="text-wareongo-blue underline underline-offset-2">sales@wareongo.com</a>.
                  </p>
                </div>
              ) : (
              <>
              {error && (
                <div className="p-3 mb-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <form {...analytics.formProps} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="ui-label">Name</Label>
                  <Input
                    id="fullName" name="fullName"
                    placeholder="John Doe"

                    required
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="ui-label">Phone</Label>
                  <Input
                    id="phone" name="phone"
                    placeholder="+91 98765 43210"

                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="ui-label">Mail</Label>
                  <Input
                    id="email" name="email"
                    type="email"
                    placeholder="you@company.com"

                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company" className="ui-label">Company</Label>
                  <Input
                    id="company" name="company"
                    placeholder="Your Company, Inc."

                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location" className="ui-label">Location of requirement</Label>
                  <Input
                    id="location" name="location"
                    placeholder="e.g. Bangalore, Hyderabad"

                    required
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="additionalComments" className="ui-label">Additional comments</Label>
                  <textarea
                    id="additionalComments" name="additionalComments"
                    rows={3}
                    placeholder="Area, budget, timeline, business type, etc."
                    className="ui-field w-full px-3 py-2 text-wareongo-blue resize-y"
                    value={formData.additionalComments}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-1">
                  <Button type="submit" className="ui-button w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit request'
                    )}
                  </Button>
                  <p className="text-xs leading-relaxed text-center text-wareongo-slate mt-2">
                    By submitting, you agree to our <Link to="/terms-of-service" className="text-wareongo-blue underline underline-offset-2">Terms</Link> and <Link to="/privacy-policy" className="text-wareongo-blue underline underline-offset-2">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
              </>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestWarehouse;
