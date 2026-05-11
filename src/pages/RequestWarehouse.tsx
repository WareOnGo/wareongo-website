import React, { useState, useEffect } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.email || !formData.company || !formData.location) {
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
        throw new Error(result.error);
      }

      trackEvent('form_submit', { form_type: 'warehouse_request', source: 'request_warehouse_page' });

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "We'll be in touch with warehouse options shortly!",
      });
    } catch (err: any) {
      trackEvent('form_error', { form_type: 'warehouse_request', source: 'request_warehouse_page', error_message: err?.message || 'unknown' });
      setError(err.message || 'Something went wrong. Please try again.');
      toast({
        title: "Error",
        description: err.message || 'Failed to submit request. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <Navbar />

      <main className="flex-1 py-6 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="space-y-4">

            {/* Direct contact row at top */}
            <div className="space-y-3">
              <p className="text-sm text-wareongo-slate">Prefer to reach out directly? Contact us at:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:Sales@wareongo.com"
                  onClick={() => trackEvent('contact_click', { contact_type: 'email', value: 'Sales@wareongo.com', location: 'request_warehouse_page' })}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 border border-wareongo-blue/20 flex items-center justify-center transition-colors group-hover:bg-wareongo-blue/5">
                    <Mail className="w-4 h-4 text-wareongo-blue" />
                  </div>
                  <p className="text-sm font-medium text-wareongo-blue group-hover:underline">Sales@wareongo.com</p>
                </a>
                <a
                  href="https://wa.me/917400184225"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('contact_click', { contact_type: 'whatsapp', value: '+917400184225', location: 'request_warehouse_page' })}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 border border-wareongo-blue/20 flex items-center justify-center transition-colors group-hover:bg-wareongo-blue/5">
                    <MessageCircle className="w-4 h-4 text-wareongo-blue" />
                  </div>
                  <p className="text-sm font-medium text-wareongo-blue group-hover:underline">+91 74001 84225</p>
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="bg-transparent border border-wareongo-blue rounded-2xl p-5 sm:p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <h2 className="text-2xl font-semibold text-wareongo-blue mb-4">Thank you!</h2>
                  <p className="text-wareongo-slate mb-6">
                    Our team is curating the best-fit warehouses for you.
                  </p>
                  <p className="text-sm text-wareongo-slate">
                    For any questions, reach our POC at{' '}
                    <a href="tel:+917400184225" className="text-wareongo-blue hover:underline">+91 74001 84225</a>{' '}
                    or{' '}
                    <a href="mailto:Sales@wareongo.com" className="text-wareongo-blue hover:underline">Sales@wareongo.com</a>.
                  </p>
                </div>
              ) : (
              <>
              {error && (
                <div className="p-3 mb-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-[13px]">Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30 h-10"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-[13px]">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30 h-10"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[13px]">Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30 h-10"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company" className="text-[13px]">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your Company, Inc."
                    className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30 h-10"
                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-[13px]">Location of requirement</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Bangalore, Hyderabad"
                    className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30 h-10"
                    required
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="additionalComments" className="text-[13px]">Additional comments</Label>
                  <textarea
                    id="additionalComments"
                    rows={3}
                    placeholder="Area, budget, timeline, business type, etc."
                    className="w-full rounded-md border border-wareongo-blue/20 bg-wareongo-ivory px-3 py-2 text-sm text-wareongo-blue placeholder:text-wareongo-slate/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue/30 resize-y"
                    value={formData.additionalComments}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-1">
                  <Button type="submit" className="w-full bg-wareongo-blue hover:bg-wareongo-blue/90 text-white h-11 rounded-xl text-sm font-medium tracking-wide transition-colors" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit request'
                    )}
                  </Button>
                  <p className="text-[11px] leading-relaxed text-center text-wareongo-slate/80 mt-2">
                    By submitting, you agree to our <Link to="/terms-of-service" className="text-wareongo-blue hover:underline">Terms</Link> and <Link to="/privacy-policy" className="text-wareongo-blue hover:underline">Privacy Policy</Link>.
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
