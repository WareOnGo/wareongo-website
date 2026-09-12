import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { analyticsPageContext, normalizeAnalytics, takeLeadOrigin, trackEvent, type AnalyticsParams } from '@/lib/analytics';

export type LeadContext = AnalyticsParams & { form_id: string; lead_type: 'general_contact' | 'warehouse_enquiry' | 'warehouse_request' | 'edge_beta'; placement: string };
export function useLeadAnalytics(open: boolean, context: LeadContext, inheritOrigin = false) {
  const current = useRef(context); current.current = context;
  const session = useRef<{ context: AnalyticsParams; started: boolean; submitted: boolean; attempted: boolean; closed: boolean } | null>(null);
  const close = () => {
    const s = session.current;
    if (!s || s.closed) return;
    if (!s.submitted) trackEvent('form_close', { ...s.context, started: s.started, submitted: false });
    s.closed = true;
  };
  useEffect(() => {
    if (!open) { close(); return; }
    session.current = { context: normalizeAnalytics({ ...analyticsPageContext(), ...(inheritOrigin ? takeLeadOrigin() : {}), ...current.current, lead_source: 'website' }), started: false, submitted: false, attempted: false, closed: false };
    trackEvent('form_open', session.current.context);
    return close;
  }, [open, inheritOrigin]);
  const start = () => {
    const s = session.current;
    if (s && !s.started) { s.started = true; trackEvent('lead_form_start', s.context); }
  };
  const attempt = () => {
    start(); const s = session.current;
    if (s && !s.attempted) { s.attempted = true; trackEvent('form_attempt', s.context); }
  };
  const invalid = (field = 'required_fields', code = 'validation_required') => {
    attempt();
    if (session.current) trackEvent('form_validation_error', { ...session.current.context, field_id: field, error_code: code });
    // Native validity fires for each invalid field during one browser task.
    queueMicrotask(() => { if (session.current) session.current.attempted = false; });
  };
  const success = (leadId?: string) => {
    const s = session.current;
    if (!s || s.submitted) return;
    s.submitted = true;
    trackEvent('generate_lead', { ...s.context, ...(leadId ? { lead_id: leadId } : {}) });
  };
  const failure = (errorCode = 'server') => {
    if (session.current) { trackEvent('form_error', { ...session.current.context, error_code: errorCode }); session.current.attempted = false; }
  };
  return { attempt, invalid, success, failure, formProps: {
    id: context.form_id, name: context.form_id,
    onInput: start,
    onInvalidCapture: (event: FormEvent<HTMLFormElement>) => {
      const input = event.target as HTMLInputElement;
      invalid(input.name || input.id || 'field', input.validity.valueMissing ? 'validation_required' : 'validation_format');
    },
  } };
}
