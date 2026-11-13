import { useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { titleCase } from '@/lib/headingCase';
import { submitCareerApplication, validateCareerApplication, type CareerApplicationDetails, type CareerApplicationErrors } from '@/services/careerApplications';
import type { CareersContent } from '@/data/careers';

const EMPTY: CareerApplicationDetails = { name: '', email: '', phoneNumber: '', note: '' };

export default function CareersInterestSection({ content }: { content: CareersContent }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<CareerApplicationErrors>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const busy = useRef(false);
  const region = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLParagraphElement>(null);
  const preview = useLocation().pathname.startsWith('/preview/');
  const description = content.interestDescription?.replace(/\s+(\S+)\s*$/, '\u00a0$1');
  const update = (key: keyof CareerApplicationDetails, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setError('');
  };
  const focusError = (fields: CareerApplicationErrors) => {
    const key = Object.keys(fields)[0];
    requestAnimationFrame(() => region.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${key}"]`)?.focus());
  };
  const send = async () => {
    if (preview || busy.current || submitted) return;
    const invalid = validateCareerApplication(values);
    setErrors(invalid);
    if (Object.keys(invalid).length) { focusError(invalid); return; }
    busy.current = true; setPending(true); setError('');
    try {
      const result = await submitCareerApplication(values);
      if (result.success) {
        setValues(EMPTY); setSubmitted(true);
        requestAnimationFrame(() => success.current?.focus());
      } else {
        setError(result.error || 'Please try again.'); setErrors(result.fieldErrors || {});
        if (result.fieldErrors && Object.keys(result.fieldErrors).length) focusError(result.fieldErrors);
      }
    } finally { busy.current = false; setPending(false); }
  };
  const enter = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.target instanceof HTMLInputElement) {
      event.preventDefault(); void send();
    }
  };
  const props = (key: keyof CareerApplicationDetails) => ({
    id: `career-interest-${key}`, name: key, value: values[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, event.target.value),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `career-interest-${key}-error` : undefined,
  });
  const fieldError = (key: keyof CareerApplicationDetails) => errors[key] && <p id={`career-interest-${key}-error`} className="career-interest__field-error">{errors[key]}</p>;

  return <Dialog open={open} onOpenChange={next => { if (!busy.current) setOpen(next); }}>
    <section className="careers-interest" aria-labelledby="career-interest-title" data-analytics-ignore>
      <header className="careers-interest__intro">
        <h2 id="career-interest-title" className="ui-panel-title">{content.interestTitle}</h2>
        <p>{description}</p>
      </header>
      <DialogTrigger asChild>
        <button type="button" className="ui-button ui-button--inverse careers-interest__trigger">
          {content.interestSubmitLabel}<ArrowRight aria-hidden="true" />
        </button>
      </DialogTrigger>
    </section>
    {/* The modal is portaled outside the section, so it needs its own analytics exclusion. */}
    <DialogContent className="careers-interest-dialog" data-analytics-ignore>
      <DialogHeader className="pr-8">
        <DialogTitle>{titleCase(content.interestSubmitLabel || 'Introduce yourself')}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {submitted ? <div className="careers-interest__success">
        <CheckCircle2 aria-hidden="true" />
        <p ref={success} tabIndex={-1} role="status">{content.interestSuccessMessage}</p>
        <DialogClose asChild><button type="button" className="ui-button">Done</button></DialogClose>
      </div> : <div ref={region} role="form" aria-label={content.interestSubmitLabel} aria-busy={pending} onKeyDown={enter}>
        {/* Deliberately not an HTML form: GA4 Enhanced Measurement observes native
            form elements. Keep an accessible form landmark, labels, validation and
            Enter-to-send without emitting native submit or sales-lead events. */}
        <fieldset disabled={pending} className="careers-interest__fields">
          <legend className="sr-only">Your details</legend>
          <div>
            <label className="ui-label" htmlFor="career-interest-name">Name</label>
            <Input {...props('name')} autoComplete="name" required maxLength={100} />
            {fieldError('name')}
          </div>
          <div>
            <label className="ui-label" htmlFor="career-interest-email">Email</label>
            <Input {...props('email')} type="email" autoComplete="email" required maxLength={254} />
            {fieldError('email')}
          </div>
          <div className="careers-interest__wide">
            <label className="ui-label" htmlFor="career-interest-phoneNumber">Phone <span>(optional)</span></label>
            <Input {...props('phoneNumber')} type="tel" autoComplete="tel" maxLength={30} />
            {fieldError('phoneNumber')}
          </div>
          <div className="careers-interest__wide">
            <label className="ui-label" htmlFor="career-interest-note">Tell us a little about yourself <span>(optional)</span></label>
            <Textarea {...props('note')} rows={4} maxLength={2000} placeholder="Your interests, experience, or the kind of work you’d love to do." />
            {fieldError('note')}
          </div>
          {error && <p role="alert" className="careers-interest__error careers-interest__wide">{error}</p>}
          <div className="careers-interest__wide careers-interest__actions">
            <button type="button" className="ui-button" disabled={pending} aria-disabled={preview || pending} onClick={() => void send()}>
              {pending ? <><Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Sending…</> : <>{content.interestSubmitLabel}<ArrowRight aria-hidden="true" /></>}
            </button>
            <p>We’ll use these details to contact you about opportunities at WareOnGo. <Link to="/privacy-policy">Privacy Policy</Link></p>
          </div>
        </fieldset>
      </div>}
    </DialogContent>
  </Dialog>;
}
