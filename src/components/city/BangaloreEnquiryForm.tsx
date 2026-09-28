import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Building2, CheckCircle2, LoaderCircle, Mail, Phone, User } from 'lucide-react';
import { useLeadAnalytics } from '@/hooks/useLeadAnalytics';
import { submitContactForm } from '@/services/formSubmission';

import type { AdPageCopy } from '@/data/adPages';

const EMPTY_FIELDS = { name: '', companyName: '', phone: '', email: '' };
const FIELDS = [
  { name: 'name', label: 'Name', placeholder: 'Enter your name', type: 'text', autoComplete: 'name', icon: User, required: true },
  { name: 'companyName', label: 'Company Name', placeholder: 'Enter your company name', type: 'text', autoComplete: 'organization', icon: Building2, required: true },
  { name: 'phone', label: 'Phone Number', placeholder: 'Enter your phone number', type: 'tel', autoComplete: 'tel', icon: Phone, required: true },
  { name: 'email', label: 'Email', placeholder: 'Enter your email (optional)', type: 'email', autoComplete: 'email', icon: Mail, required: false },
] as const;

/** The contact form's four fields and submission service, inline in the hero. */
export default function BangaloreEnquiryForm({ copy }: { copy: AdPageCopy }) {
  const [values, setValues] = useState(EMPTY_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const analytics = useLeadAnalytics(true, {
    form_id: 'bangalore_hero_enquiry',
    lead_type: 'warehouse_enquiry',
    placement: 'bangalore_hero',
    market_slug: 'bengaluru',
  });

  useEffect(() => {
    if (submitted) successRef.current?.focus({ preventScroll: true });
  }, [submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || submitted) return;
    analytics.attempt();
    setError(null);

    const missing = FIELDS.find(field => field.required && !values[field.name].trim());
    if (missing) {
      analytics.invalid(missing.name);
      setError(`Please enter your ${missing.label.toLowerCase()}.`);
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${missing.name}"]`)?.focus();
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = await submitContactForm({
        name: values.name,
        companyName: values.companyName,
        phone: values.phone,
        email: values.email.trim() || null,
        source: 'bangalore-landing',
      });
      if (!result.success) {
        analytics.failure(result.errorCode || 'server');
        setError(result.error || 'We couldn’t send your enquiry. Please try again.');
        return;
      }
      analytics.success(result.leadId);
      setValues(EMPTY_FIELDS);
      setSubmitted(true);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section id="bangalore-enquiry" className="bangalore-landing__enquiry" aria-labelledby="bangalore-enquiry-title" tabIndex={-1}>
      <h2 id="bangalore-enquiry-title">{copy.enquiryHeading}</h2>
      <p className="bangalore-landing__enquiry-intro">{copy.enquiryDescription}</p>

      {submitted ? (
        <div ref={successRef} className="bangalore-landing__enquiry-success" role="status" tabIndex={-1}>
          <CheckCircle2 size={42} strokeWidth={1.5} aria-hidden="true" />
          <h3>{copy.enquirySuccessHeading}</h3>
          <p>{copy.enquirySuccessDescription}</p>
          <a href="#locations" className="bangalore-landing__text-link">{copy.enquirySuccessCta} <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      ) : (
        <form {...analytics.formProps} onSubmit={handleSubmit} aria-busy={submitting}>
          {error && <p id="bangalore-enquiry-error" className="bangalore-landing__form-error" role="alert">{error}</p>}
          <fieldset disabled={submitting} className="bangalore-landing__form-fields">
            <legend className="sr-only">Your contact details</legend>
            {FIELDS.map(({ name, label, placeholder, type, autoComplete, icon: Icon, required }) => (
              <div key={name} className="bangalore-landing__form-field">
                <label htmlFor={`bangalore-${name}`}>{label}{!required && <span> (optional)</span>}</label>
                <div className="bangalore-landing__input-wrap">
                  <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                  <input
                    id={`bangalore-${name}`}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    required={required}
                    value={values[name]}
                    onChange={event => setValues(current => ({ ...current, [name]: event.target.value }))}
                    aria-describedby={error ? 'bangalore-enquiry-error' : undefined}
                  />
                </div>
              </div>
            ))}
            <button type="submit" className="bangalore-landing__button bangalore-landing__submit">
              {submitting ? <><LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Sending…</> : <>{copy.enquirySubmit} <ArrowRight size={17} aria-hidden="true" /></>}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
