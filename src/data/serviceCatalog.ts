export const SERVICE_PAGES = {
  'warehouse-search': 'Warehouse Search',
  'build-to-suit': 'Build-To-Suit',
  'lease-negotiation': 'Lease Negotiation',
  'compliance-procurement': 'Compliance Procurement',
} as const;

export type ServiceSlug = keyof typeof SERVICE_PAGES;
export const servicePath = (slug: string) => `/services/${slug}`;
