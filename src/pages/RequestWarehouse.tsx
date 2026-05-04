import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Loader, Mail, MessageCircle } from 'lucide-react';
import { submitWarehouseRequest } from '@/services/warehouseRequest';

const BUSINESS_TYPES = ['Ecommerce', 'FMCG', 'Manufacturing', '3PL / Logistics'] as const;
const PROPERTY_TYPES = ['PEB/SHED', 'RCC', 'BTS'] as const;

const RequestWarehouse = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    city: '',
    requiredArea: '',
    microLocations: '',
    businessType: '',
    businessTypeOther: '',
    budget: '',
    timeline: '',
    propertyTypes: [] as string[],
    fullName: '',
    phone: '',
    email: '',
    company: '',
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

  const togglePropertyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const businessTypeFinal = formData.businessType === 'Other' ? formData.businessTypeOther : formData.businessType;

    if (!formData.city || !formData.requiredArea || !businessTypeFinal || !formData.budget || !formData.timeline || formData.propertyTypes.length === 0 || !formData.fullName || !formData.phone || !formData.email || !formData.company) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const requirementsSummary = [
      `City: ${formData.city}`,
      `Required Area: ${formData.requiredArea} sq ft`,
      formData.microLocations ? `Preferred Micro Locations: ${formData.microLocations}` : null,
      `Business Type: ${businessTypeFinal}`,
      `Budget Range: ₹${formData.budget}/sq ft`,
      `Timeline: ${formData.timeline}`,
      `Property Type: ${formData.propertyTypes.join(', ')}`,
    ].filter(Boolean).join('\n');

    try {
      const result = await submitWarehouseRequest({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        location: formData.city,
        requirements: requirementsSummary
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "We'll be in touch with warehouse options shortly!",
      });
    } catch (err: any) {
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

      <main className="flex-1 py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left Column: Content */}
            <div className="space-y-8 lg:sticky lg:top-32 order-1">
              <div>
                <span className="text-sm font-semibold tracking-widest uppercase text-wareongo-slate mb-3 block">
                  Get Started
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-wareongo-blue leading-tight mb-6">
                  Find the perfect space for your business.
                </h1>
                <p className="text-lg md:text-xl text-wareongo-slate leading-relaxed">
                  Share your requirements with us. Our expert team will review your needs and get back to you with custom, verified proposals within 3 hours.
                </p>
              </div>

              <div className="hidden lg:block pt-8 border-t border-black/10 space-y-6">
                <h3 className="text-xl font-semibold text-wareongo-blue">Prefer to reach out directly?</h3>

                <div className="flex flex-col space-y-4">
                  <a href="mailto:Sales@wareongo.com" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-wareongo-blue/20 flex items-center justify-center transition-colors group-hover:bg-wareongo-blue/5">
                      <Mail className="w-5 h-5 text-wareongo-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-wareongo-slate">Email us</p>
                      <p className="font-medium text-wareongo-blue group-hover:underline">Sales@wareongo.com</p>
                    </div>
                  </a>

                  <a href="https://wa.me/917400184225" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-wareongo-blue/20 flex items-center justify-center transition-colors group-hover:bg-wareongo-blue/5">
                      <MessageCircle className="w-5 h-5 text-wareongo-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-wareongo-slate">WhatsApp Support</p>
                      <p className="font-medium text-wareongo-blue group-hover:underline">+91 74001 84225</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-transparent border border-wareongo-blue rounded-2xl p-6 sm:p-8 md:p-10 order-2">
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
              <h2 className="text-xl font-semibold text-wareongo-blue tracking-tight">Request details</h2>
              <p className="text-sm text-wareongo-slate mt-1.5 mb-8">Tell us about your space — we'll get back within 3 hours.</p>

              {error && (
                <div className="p-3 mb-6 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="border border-wareongo-blue/30 rounded-xl px-6 pt-3 pb-6">
                  <legend className="px-2 text-[11px] uppercase tracking-[0.18em] font-medium text-wareongo-slate">Location & Size</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-[13px]">City</Label>
                      <Input
                        id="city"
                        placeholder="Bangalore"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="requiredArea" className="text-[13px]">Required area (sq ft)</Label>
                      <Input
                        id="requiredArea"
                        type="number"
                        placeholder="e.g. 25,000"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.requiredArea}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="microLocations" className="text-[13px]">Preferred micro locations</Label>
                      <span className="text-[11px] text-wareongo-slate/70 font-normal">Optional</span>
                    </div>
                    <Input
                      id="microLocations"
                      placeholder="e.g. Medchal, Shamshabad"
                      className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                      value={formData.microLocations}
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>

                <fieldset className="border border-wareongo-blue/30 rounded-xl px-6 pt-3 pb-6">
                  <legend className="px-2 text-[11px] uppercase tracking-[0.18em] font-medium text-wareongo-slate">Business Use</legend>
                  <div className="space-y-1.5 mt-2">
                    <Label htmlFor="businessType" className="text-[13px]">What will you use this warehouse for?</Label>
                    <Select
                      required
                      value={formData.businessType}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, businessType: val, businessTypeOther: val === 'Other' ? prev.businessTypeOther : '' }))}
                    >
                      <SelectTrigger id="businessType" className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">{type}</SelectItem>
                        ))}
                        <SelectItem value="Other" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.businessType === 'Other' && (
                    <div className="space-y-1.5 mt-3">
                      <Label htmlFor="businessTypeOther" className="text-[13px]">Please specify</Label>
                      <Input
                        id="businessTypeOther"
                        placeholder="Tell us your industry"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        value={formData.businessTypeOther}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                </fieldset>

                <fieldset className="border border-wareongo-blue/30 rounded-xl px-6 pt-3 pb-6">
                  <legend className="px-2 text-[11px] uppercase tracking-[0.18em] font-medium text-wareongo-slate">Commercials & Timeline</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="budget" className="text-[13px]">Budget (₹ / sq ft)</Label>
                      <Input
                        id="budget"
                        placeholder="e.g. 18 – 22"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.budget}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="timeline" className="text-[13px]">Timeline to start</Label>
                      <Select
                        required
                        value={formData.timeline}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, timeline: val }))}
                      >
                        <SelectTrigger id="timeline" className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                          <SelectItem value="Immediate (0–15 days)" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Immediate (0–15 days)</SelectItem>
                          <SelectItem value="Within 30 days" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Within 30 days</SelectItem>
                          <SelectItem value="1–3 months" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">1–3 months</SelectItem>
                          <SelectItem value="Flexible" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-baseline justify-between">
                      <Label className="text-[13px]">Property type</Label>
                      <span className="text-[11px] text-wareongo-slate/70 font-normal">Select all that apply</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {PROPERTY_TYPES.map((type) => {
                        const selected = formData.propertyTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => togglePropertyType(type)}
                            className={`h-10 rounded-md border text-[13px] font-medium transition-colors ${
                              selected
                                ? 'border-wareongo-blue bg-wareongo-blue text-white'
                                : 'border-wareongo-blue/20 bg-wareongo-ivory text-wareongo-blue hover:bg-wareongo-blue/5'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-wareongo-blue/30 rounded-xl px-6 pt-3 pb-6">
                  <legend className="px-2 text-[11px] uppercase tracking-[0.18em] font-medium text-wareongo-slate">Contact</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[13px]">Full name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-[13px]">Phone number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[13px]">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-[13px]">Company name</Label>
                      <Input
                        id="company"
                        placeholder="Your Company, Inc."
                        className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                        required
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-wareongo-blue hover:bg-wareongo-blue/90 text-white h-12 rounded-xl text-sm font-medium tracking-wide transition-colors" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit request'
                    )}
                  </Button>
                  <p className="text-[11px] leading-relaxed text-center text-wareongo-slate/80 mt-3">
                    By submitting, you agree to our <Link to="/terms-of-service" className="text-wareongo-blue hover:underline">Terms</Link> and <Link to="/privacy-policy" className="text-wareongo-blue hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
              </>
              )}
            </div>

            {/* Mobile-only: contact block below form */}
            <div className="lg:hidden order-3 space-y-6 pt-2">
              <h3 className="text-xl font-semibold text-wareongo-blue">Prefer to reach out directly?</h3>

              <div className="flex flex-col space-y-4">
                <a href="mailto:Sales@wareongo.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-wareongo-blue/20 flex items-center justify-center transition-colors group-hover:bg-wareongo-blue/5">
                    <Mail className="w-5 h-5 text-wareongo-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-wareongo-slate">Email us</p>
                    <p className="font-medium text-wareongo-blue group-hover:underline">Sales@wareongo.com</p>
                  </div>
                </a>

                <a href="https://wa.me/917400184225" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-wareongo-blue/20 flex items-center justify-center transition-colors group-hover:bg-wareongo-blue/5">
                    <MessageCircle className="w-5 h-5 text-wareongo-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-wareongo-slate">WhatsApp Support</p>
                    <p className="font-medium text-wareongo-blue group-hover:underline">+91 74001 84225</p>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestWarehouse;
