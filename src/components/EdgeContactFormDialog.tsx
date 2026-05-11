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
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, User, Building, Briefcase, Loader } from 'lucide-react';
import { submitContactForm } from '@/services/formSubmission';
import { trackEvent } from '@/lib/analytics';

interface EdgeContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
}

const EdgeContactFormDialog = ({ open, onOpenChange, source }: EdgeContactFormDialogProps) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCompany = company.trim();
    const trimmedDesignation = designation.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedCompany || !trimmedDesignation || !trimmedEmail || !trimmedPhone) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Pack extra fields into the name field as JSON so the backend doesn't need changes.
    const packedName = JSON.stringify({
      name: trimmedName,
      company: trimmedCompany,
      designation: trimmedDesignation,
    });

    try {
      const result = await submitContactForm({
        name: packedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        source,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      trackEvent('form_submit', { form_type: 'edge_beta_access', source });

      toast({
        title: "Success",
        description: "We'll get back to you soon.",
      });

      setName('');
      setCompany('');
      setDesignation('');
      setEmail('');
      setPhone('');
      onOpenChange(false);
    } catch (err: any) {
      trackEvent('form_error', { form_type: 'edge_beta_access', source, error_message: err?.message || 'unknown' });
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

  const inputClass = "w-full h-11 pl-10 pr-3.5 bg-transparent border border-wareongo-blue rounded-xl text-sm text-wareongo-blue placeholder:text-wareongo-slate/60 focus:outline-none focus:ring-2 focus:ring-wareongo-blue/20 focus:border-wareongo-blue transition-colors";
  const labelClass = "text-xs uppercase tracking-[0.18em] font-medium text-wareongo-slate block";
  const iconWrapClass = "absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-wareongo-blue/70";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-sans bg-wareongo-ivory border border-wareongo-blue rounded-2xl sm:max-w-[460px] p-6 sm:p-8 shadow-none gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-5">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-2 text-left">
            Get in touch
          </p>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-wareongo-blue text-left">
            Request Beta Access
          </DialogTitle>
          <DialogDescription className="text-sm text-wareongo-slate text-left pt-1">
            Share your details and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-wareongo-sienna/10 border border-wareongo-sienna text-wareongo-sienna rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="edge-name" className={labelClass}>Name</label>
            <div className="relative">
              <div className={iconWrapClass}>
                <User className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="edge-name"
                className={inputClass}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edge-company" className={labelClass}>Company</label>
            <div className="relative">
              <div className={iconWrapClass}>
                <Building className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="edge-company"
                className={inputClass}
                placeholder="Enter your company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edge-designation" className={labelClass}>Designation</label>
            <div className="relative">
              <div className={iconWrapClass}>
                <Briefcase className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="edge-designation"
                className={inputClass}
                placeholder="Enter your designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edge-email" className={labelClass}>Mail</label>
            <div className="relative">
              <div className={iconWrapClass}>
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="edge-email"
                type="email"
                className={inputClass}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edge-phone" className={labelClass}>Number</label>
            <div className="relative">
              <div className={iconWrapClass}>
                <Phone className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="edge-phone"
                className={inputClass}
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 sm:space-x-0">
            <DialogClose asChild>
              <button
                type="button"
                className="h-11 px-5 bg-transparent border border-wareongo-blue rounded-xl text-sm font-semibold text-wareongo-blue hover:bg-wareongo-blue/5 transition-colors"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 bg-wareongo-blue border border-wareongo-blue rounded-xl text-sm font-semibold text-wareongo-ivory hover:bg-wareongo-blue/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EdgeContactFormDialog;
