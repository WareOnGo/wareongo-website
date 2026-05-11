
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
import { Mail, Phone, User, Loader } from 'lucide-react';
import { submitContactForm } from '@/services/formSubmission';
import { trackEvent } from '@/lib/analytics';

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

      trackEvent('form_submit', { form_type: 'contact', source });

      toast({
        title: "Success",
        description: successMessage,
      });

      setName('');
      setPhone('');
      setEmail('');
      onOpenChange(false);
    } catch (err: any) {
      trackEvent('form_error', { form_type: 'contact', source, error_message: err?.message || 'unknown' });
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
      <DialogContent className="font-sans bg-wareongo-ivory border border-wareongo-blue rounded-2xl sm:max-w-[460px] p-6 sm:p-8 shadow-none gap-0">
        <DialogHeader className="mb-5">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-2 text-left">
            Get in touch
          </p>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-wareongo-blue text-left">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-wareongo-slate text-left pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-wareongo-sienna/10 border border-wareongo-sienna text-wareongo-sienna rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs uppercase tracking-[0.18em] font-medium text-wareongo-slate block">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-wareongo-blue/70">
                <User className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="name"
                className="w-full h-11 pl-10 pr-3.5 bg-transparent border border-wareongo-blue rounded-xl text-sm text-wareongo-blue placeholder:text-wareongo-slate/60 focus:outline-none focus:ring-2 focus:ring-wareongo-blue/20 focus:border-wareongo-blue transition-colors"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs uppercase tracking-[0.18em] font-medium text-wareongo-slate block">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-wareongo-blue/70">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="phone"
                className="w-full h-11 pl-10 pr-3.5 bg-transparent border border-wareongo-blue rounded-xl text-sm text-wareongo-blue placeholder:text-wareongo-slate/60 focus:outline-none focus:ring-2 focus:ring-wareongo-blue/20 focus:border-wareongo-blue transition-colors"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs uppercase tracking-[0.18em] font-medium text-wareongo-slate block">
              Email <span className="lowercase tracking-normal text-wareongo-slate/70 normal-case">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-wareongo-blue/70">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <input
                id="email"
                type="email"
                className="w-full h-11 pl-10 pr-3.5 bg-transparent border border-wareongo-blue rounded-xl text-sm text-wareongo-blue placeholder:text-wareongo-slate/60 focus:outline-none focus:ring-2 focus:ring-wareongo-blue/20 focus:border-wareongo-blue transition-colors"
                placeholder="Enter your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

export default ContactFormDialog;
