import type { CompanyWithKPIs } from "@/types/company";

export interface CompanyParisEmissionsEntry {
  company: CompanyWithKPIs;
  emissions: number;
  meetsParis: boolean;
}

export function getCompanyParisEmissionsData(
  companies: CompanyWithKPIs[],
): CompanyParisEmissionsEntry[] {
  return companies.flatMap((company) => {
    const meetsParis = company.meetsParis;
    if (meetsParis === null || meetsParis === undefined) {
      return [];
    }

    const emissions =
      company.reportingPeriods?.[0]?.emissions?.calculatedTotalEmissions;
    if (emissions == null || emissions <= 0) {
      return [];
    }

    return [{ company, emissions, meetsParis }];
  });
}
