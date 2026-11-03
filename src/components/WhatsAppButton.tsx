import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import './WhatsAppButton.css';

/** The sales WhatsApp line used across the site (hero, About, Request a warehouse). */
export const SALES_WHATSAPP = '917400184225';

/** Fixed bottom-right WhatsApp contact. RootLayout renders the site default; ad pages render their own. */
export default function WhatsAppButton({ number = SALES_WHATSAPP, message, analytics }: {
  number?: string; message?: string; analytics?: AnalyticsParams;
}) {
  return (
    <a className="whatsapp-button" href={`https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`}
      target="_blank" rel="noopener noreferrer" aria-label="Message us on WhatsApp"
      onClick={() => trackEvent('contact_click', {
        placement: 'floating_whatsapp', contact_method: 'whatsapp', contact_target: 'sales_whatsapp', ...analytics,
      })}>
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z" /></svg>
      <span className="whatsapp-button__label" aria-hidden="true">Message Us</span>
    </a>
  );
}
