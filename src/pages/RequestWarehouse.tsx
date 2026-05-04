import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Loader, Mail, MessageCircle } from 'lucide-react';
import { submitWarehouseRequest } from '@/services/warehouseRequest';

const RequestWarehouse = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    spaceType: '',
    location: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (!formData.fullName || !formData.phone || !formData.email || !formData.company || !formData.spaceType || !formData.location || !formData.requirements) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitWarehouseRequest({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        location: formData.location,
        requirements: `Type: ${formData.spaceType}\n\n${formData.requirements}`
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Request Submitted",
        description: "We'll be in touch with warehouse options shortly!",
      });

      setFormData({
        fullName: '',
        phone: '',
        email: '',
        company: '',
        spaceType: '',
        location: '',
        requirements: ''
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
            <div className="space-y-8 lg:sticky lg:top-32">
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

              <div className="pt-8 border-t border-black/10 space-y-6">
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
            <div className="bg-transparent border border-wareongo-blue/20 p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold text-wareongo-blue mb-6">Request details</h2>

              {error && (
                <div className="p-3 mb-6 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Your Company, Inc."
                      className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                      required
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type of space required</Label>
                    <Select
                      required
                      value={formData.spaceType}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, spaceType: val }))}
                    >
                      <SelectTrigger className="bg-wareongo-ivory border-wareongo-blue/20 focus:ring-wareongo-blue/30">
                        <SelectValue placeholder="Select space type" />
                      </SelectTrigger>
                      <SelectContent className="bg-wareongo-ivory border-wareongo-blue/20">
                        <SelectItem value="Warehouse" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Warehouse</SelectItem>
                        <SelectItem value="Factory" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Factory</SelectItem>
                        <SelectItem value="Office" className="focus:bg-wareongo-blue/10 focus:text-black cursor-pointer">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Input
                      id="location"
                      placeholder="City & Locality/ZIP"
                      className="bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30"
                      required
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Find me Grade A warehouse under Rs. 18 in Nelamnagala, Bangalore"
                    className="min-h-[140px] bg-wareongo-ivory border-wareongo-blue/20 focus-visible:ring-wareongo-blue/30 resize-y"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-wareongo-blue hover:bg-wareongo-blue/90 text-white py-6 rounded-xl text-lg font-medium transition-colors" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 mr-3 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                  <p className="text-xs text-center text-wareongo-slate mt-4">
                    By submitting this form, you agree to our <Link to="/terms-of-service" className="text-wareongo-blue hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-wareongo-blue hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestWarehouse;
