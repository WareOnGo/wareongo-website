
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

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
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(123) 456-7890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Your Company, Inc." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseSize">Warehouse Size Needed</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Under 10,000 sq ft</SelectItem>
                    <SelectItem value="medium">10,000 - 50,000 sq ft</SelectItem>
                    <SelectItem value="large">Over 50,000 sq ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Input id="location" placeholder="City & Locality/ZIP" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Within 30 days</SelectItem>
                    <SelectItem value="soon">1-3 months</SelectItem>
                    <SelectItem value="planning">3-6 months</SelectItem>
                    <SelectItem value="future">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Rental Budget</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under5k">Grade A</SelectItem>
                    <SelectItem value="5-10k">Grade B</SelectItem>
                    <SelectItem value="10-20k">Others</SelectItem>
                  </SelectContent>
                </Select>
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
                By submitting this form, you agree to our <a href="#" className="text-wareongo-blue hover:underline">Terms of Service</a> and <a href="#" className="text-wareongo-blue hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RequestFormSection;
