export const COMPANY_COUNTRY_TAG_SLUGS = [
  "sweden",
  "norway",
  "finland",
  "denmark",
  "iceland",
] as const;

export type CompanyCountryTagSlug = (typeof COMPANY_COUNTRY_TAG_SLUGS)[number];

export const isCompanyCountryTagSlug = (
  value: string,
): value is CompanyCountryTagSlug =>
  COMPANY_COUNTRY_TAG_SLUGS.includes(value as CompanyCountryTagSlug);
