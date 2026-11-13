import { getApiUrl } from '@/config/config';

export interface CareerApplicationDetails {
  name: string;
  email: string;
  phoneNumber: string;
  note: string;
}
export type CareerApplicationErrors = Partial<Record<keyof CareerApplicationDetails, string>>;

export function validateCareerApplication(values: CareerApplicationDetails): CareerApplicationErrors {
  const errors: CareerApplicationErrors = {};
  if (!values.name.trim() || values.name.trim().length > 100) errors.name = 'Enter your name (up to 100 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 254) errors.email = 'Enter a valid email address.';
  const phone = values.phoneNumber.trim();
  if (phone && (!/^\+?[\d ()-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15 || phone.length > 30)) errors.phoneNumber = 'Enter a valid phone number, or leave it blank.';
  if (values.note.trim().length > 2000) errors.note = 'Keep your note under 2,000 characters.';
  return errors;
}

/** Careers has its own endpoint: no lead attribution, CRM payload or analytics. */
export async function submitCareerApplication(values: CareerApplicationDetails): Promise<{ success: boolean; error?: string; fieldErrors?: CareerApplicationErrors }> {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/preview/')) return { success: false, error: 'Applications cannot be sent from a preview.' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(getApiUrl('/career-applications'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), phoneNumber: values.phoneNumber.trim(), note: values.note.trim() }),
    });
    const data = await response.json();
    if (response.ok && data.success === true) return { success: true };
    const fieldErrors: CareerApplicationErrors = {};
    for (const key of ['name', 'email', 'phoneNumber', 'note'] as const) {
      if (typeof data.fieldErrors?.[key] === 'string') fieldErrors[key] = data.fieldErrors[key].slice(0, 240);
    }
    return { success: false, fieldErrors, error: response.status === 429 ? 'Too many attempts. Please try again in a few minutes.' : 'We couldn’t send your details. Please check the fields and try again.' };
  } catch {
    return { success: false, error: 'We couldn’t connect. Your details are still here; please try again.' };
  } finally { clearTimeout(timeout); }
}
