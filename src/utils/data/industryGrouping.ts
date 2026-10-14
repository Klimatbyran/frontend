import type { CompanyWithIndustryGics } from "@/types/company";

/**
 * Extract industry/sector name directly from company data (no translations)
 * @param company - Company object with industry information
 * @returns Industry name or undefined
 */
/** Page company header/overview only expose GICS codes; SEO needs localized sector names. */
export function industryGicsForSeo(
  sectorCode: string | null | undefined,
  sectorName: string,
): CompanyWithIndustryGics["industry"] | null {
  if (!sectorCode || !sectorName) {
    return null;
  }

  return {
    industryGics: {
      sectorCode,
      en: { sectorName },
      sv: { sectorName },
    },
  };
}

export function getCompanyIndustryFromData(
  company: CompanyWithIndustryGics,
): string | undefined {
  const industryGics = company?.industry?.industryGics;
  if (!industryGics) return undefined;

  // Prefer English, fallback to Swedish
  return industryGics.en?.sectorName || industryGics.sv?.sectorName;
}

/** Translated sector label for a GICS sector code, or `fallback` when missing. */
export function getCompanySectorName(
  sectorCode: string | null | undefined,
  sectorNames: Record<string, string>,
  fallback = "",
): string {
  if (!sectorCode) return fallback;
  return sectorNames[sectorCode] ?? sectorCode;
}

/** Translated industry-group label for a GICS group code, or `fallback`. */
export function getCompanyIndustryGroupName(
  industryGroupCode: string | null | undefined,
  industryGroupNames: Record<string, string>,
  fallback = "",
): string {
  if (!industryGroupCode) return fallback;
  return industryGroupNames[industryGroupCode] ?? industryGroupCode;
}
