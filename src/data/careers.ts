import { careersContent } from './careers.generated';
import sample from './careers.sample.json';
import { titleCase } from '@/lib/headingCase';

export interface CareerRole {
  id: string;
  title: string;
  department: string;
  summary: string;
  location: string;
  employmentType: string;
  duration?: string;
  compensation?: string;
  applyUrl: string;
  isOpen: boolean;
}

export interface CareersContent {
  slug: 'careers';
  seoTitle: string;
  description: string;
  title: string;
  intro: string;
  cultureTitle: string;
  cultureDescription: string;
  applicationEmail: string;
  interestTitle?: string;
  interestDescription?: string;
  interestSubmitLabel?: string;
  interestSuccessMessage?: string;
  roles: CareerRole[];
}

const emptyContent: CareersContent = {
  slug: 'careers',
  seoTitle: 'Careers at WareOnGo | Build With Us',
  description: 'Build your career at WareOnGo and help businesses find the right warehouse, faster.',
  title: 'Be Part of Our Mission',
  intro: 'Help us make finding the right warehouse simpler. Bring your curiosity, your ideas, and your drive to solve real problems.',
  cultureTitle: 'Meaningful Work. Room to Grow.',
  cultureDescription: 'Together, we’re bringing clarity to warehousing and helping businesses across India take their next step.',
  applicationEmail: '',
  roles: [],
};

// Samples are a development convenience only. A build never substitutes them
// for an empty or unavailable CMS response, and closed roles stay private.
export const careers: CareersContent = careersContent ?? (__DEV_SERVER__ ? { ...sample, slug: 'careers' } : emptyContent);

export function displayCareers(content: CareersContent): CareersContent {
  return {
    ...content,
    interestTitle: titleCase(content.interestTitle || 'Think You Don’t Fit In?'),
    interestDescription: content.interestDescription || 'The right role isn’t always listed. Tell us a little about yourself and what you’d like to work on.',
    interestSubmitLabel: content.interestSubmitLabel || 'Introduce yourself',
    interestSuccessMessage: content.interestSuccessMessage || 'Thanks for introducing yourself. We’ve received your details and will get in touch if there’s a role that fits.',
    title: titleCase(content.title),
    cultureTitle: titleCase(content.cultureTitle),
    roles: content.roles.filter(role => role.isOpen).map(role => ({ ...role, title: titleCase(role.title) })),
  };
}

export function applicationHref(role: CareerRole, email: string): string | undefined {
  if (role.applyUrl) {
    try {
      const url = new URL(role.applyUrl);
      if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
    } catch { /* An unfinished CMS preview must not render an unsafe link. */ }
  }
  return /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(email)
    ? `mailto:${encodeURIComponent(email).replace('%40', '@')}?subject=${encodeURIComponent(`Application: ${role.title}`)}`
    : undefined;
}
