import React, { useState, useRef } from 'react';
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
import { useLeadAnalytics } from '@/hooks/useLeadAnalytics';

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

  const analytics = useLeadAnalytics(open, { form_id: 'edge_beta', lead_type: 'edge_beta', placement: 'edge_section' }, false);

  const submissionError = useRef('server');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    analytics.attempt();

    const trimmedName = name.trim();
    const trimmedCompany = company.trim();
    const trimmedDesignation = designation.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedCompany || !trimmedDesignation || !trimmedEmail || !trimmedPhone) {
      analytics.invalid();
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
        submissionError.current = result.errorCode || 'server';
        throw new Error(result.error);
      }

      analytics.success(result.leadId);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined;
      analytics.failure(submissionError.current);
      setError(message || 'Something went wrong. Please try again.');
      toast({
        title: "Error",
        description: message || 'Failed to submit form. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full h-11 pl-10 pr-3.5 bg-transparent border border-ui-outline rounded-xl text-sm text-wareongo-blue placeholder:text-ui-placeholder focus:outline-none focus:ring-2 focus:ring-wareongo-blue/20 focus:border-ui-outline transition-colors";
  const labelClass = "ui-eyebrow font-medium text-wareongo-slate block";
  const iconWrapClass = "absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-ui-accent";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isSubmitting) onOpenChange(next); }}>
      <DialogContent className="font-sans bg-ui-surface border border-ui-outline rounded-xl sm:max-w-[460px] p-6 sm:p-8 shadow-none gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-5">
          <p className="ui-eyebrow text-wareongo-slate font-medium mb-2 text-left">
            Get in touch
          </p>
          <DialogTitle className="ui-panel-title text-wareongo-blue text-left">
            Request Beta Access
          </DialogTitle>
          <DialogDescription className="text-sm text-wareongo-slate text-left pt-1">
            Share your details and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>

        <form {...analytics.formProps} onSubmit={handleSubmit} className="space-y-4">
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
                id="edge-name" name="edge-name"
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
                id="edge-company" name="edge-company"
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
                id="edge-designation" name="edge-designation"
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
                id="edge-email" name="edge-email"
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
                id="edge-phone" name="edge-phone"
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
                className="ui-button ui-button--secondary"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ui-button disabled:opacity-60 disabled:cursor-not-allowed"
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
