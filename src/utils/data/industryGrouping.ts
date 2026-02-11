import { t } from "i18next";

/**
 * Extract industry/sector name directly from company data (no translations)
 * @param company - Company object with industry information
 * @returns Industry name or undefined
 */
export function getCompanyIndustryFromData(company: any): string | undefined {
  const industryGics = company?.industry?.industryGics;
  if (!industryGics) return undefined;

  // Prefer English, fallback to Swedish
  return industryGics.en?.sectorName || industryGics.sv?.sectorName;
}

/**
 * Get the sector name for a company, using translated names when available
 *
 * @param company - Company object with industry information (accepts any company-like object)
 * @param sectorNames - Map of sector codes to translated names (from useSectorNames hook)
 * @returns Sector name string
 */
export function getCompanySectorName(
  company: any,
  sectorNames: Record<string, string>,
): string {
  const sectorCode = company?.industry?.industryGics?.sectorCode;

  if (sectorCode && sectorCode in sectorNames) {
    return sectorNames[sectorCode];
  }

  // Fallback to direct extraction from company data
  return (
    getCompanyIndustryFromData(company) ||
    t("companies.overview.unknownSector", "Unknown Sector")
  );
}

/**
 * Group companies by industry/sector name
 * Generic function that works with any company-like type
 *
 * @param companies - Array of companies (or company-like objects)
 * @param getSectorName - Function to extract sector name from a company
 * @returns Array of industry groups with key and companies
 */
export function groupCompaniesByIndustry<T>(
  companies: T[],
  getSectorName: (company: T) => string,
): Array<{ key: string; comps: T[] }> {
  const map = new Map<string, T[]>();

  for (const company of companies) {
    const sectorName = getSectorName(company);
    if (!map.has(sectorName)) {
      map.set(sectorName, []);
    }
    map.get(sectorName)!.push(company);
  }

  return Array.from(map.entries()).map(([key, comps]) => ({ key, comps }));
}
