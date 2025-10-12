
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, User, Loader } from 'lucide-react';
import { submitContactForm } from '@/services/formSubmission';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  successMessage: string;
  source: string;
}

const ContactFormDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  description,
  successMessage,
  source
}: ContactFormDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim values
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    
    if (!trimmedName || !trimmedPhone) {
      toast({
        title: "Validation Error",
        description: "Name and phone number are required",
        variant: "destructive"
      });
      return;
    }

    console.log('Form values before submit:', { 
      name: trimmedName, 
      phone: trimmedPhone, 
      email: trimmedEmail || null, 
      source 
    });

    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await submitContactForm({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
        source
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Success",
        description: successMessage,
      });
      
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      toast({
        title: "Error",
        description: err.message || 'Failed to submit form. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-wareongo-charcoal">Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-wareongo-slate">
                <User className="h-4 w-4" />
              </div>
              <Input 
                id="name" 
                className="pl-10" 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-wareongo-charcoal">Phone Number</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-wareongo-slate">
                <Phone className="h-4 w-4" />
              </div>
              <Input 
                id="phone" 
                className="pl-10" 
                placeholder="Enter your phone number" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-wareongo-charcoal">Email (Optional)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-wareongo-slate">
                <Mail className="h-4 w-4" />
              </div>
              <Input 
                id="email" 
                type="email" 
                className="pl-10" 
                placeholder="Enter your email (optional)" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
