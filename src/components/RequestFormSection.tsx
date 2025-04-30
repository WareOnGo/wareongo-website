
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const RequestFormSection = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the form data to a backend service
    toast({
      title: "Request Submitted",
      description: "We'll be in touch with warehouse options shortly!",
    });
  };

  return (
    <section id="request" className="section-container">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title">Request a Warehouse</h2>
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(123) 456-7890" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Your Company, Inc." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Input id="location" placeholder="City & Locality/ZIP" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Tell us about any specific needs (loading docks, location radius, ceiling height, compliance, etc.)"
                className="min-h-[120px]"
              />
            </div>
            
            <div className="text-center">
              <Button type="submit" className="btn-primary px-8">Submit Request</Button>
              <p className="text-sm text-wareongo-slate mt-4">
                By submitting this form, you agree to our <Link to="/terms-of-service" className="text-wareongo-blue hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-wareongo-blue hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RequestFormSection;
