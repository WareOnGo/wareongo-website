
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { submitWarehouseRequest } from '@/services/warehouseRequest';

const RequestFormSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    company: '',
    location: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.phone || !formData.company || !formData.location || !formData.requirements) {
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
        company: formData.company,
        location: formData.location,
        requirements: formData.requirements,
        email: null // No email field in this form
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Request Submitted",
        description: "We'll be in touch with warehouse options shortly!",
      });
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        company: '',
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
    <section id="request" className="section-container">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title">Request a Warehouse</h2>
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          {error && (
            <div className="p-3 mb-6 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  required 
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="(123) 456-7890" 
                  required 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input 
                  id="company" 
                  placeholder="Your Company, Inc." 
                  required 
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Input 
                  id="location" 
                  placeholder="City & Locality/ZIP" 
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
                placeholder="Tell us about any specific needs (loading docks, location radius, ceiling height, compliance, etc.)"
                className="min-h-[120px]"
                value={formData.requirements}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="text-center">
              <Button type="submit" className="btn-primary px-8" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
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
