import { t } from "i18next";

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

  return (
    company?.industry?.industryGics?.sv?.sectorName ||
    company?.industry?.industryGics?.en?.sectorName ||
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
