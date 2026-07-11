import type { CompanyWithKPIs } from "@/types/company";

export interface CompanyParisOverviewItem {
  id: string;
  wikidataId: string | null;
  name: string;
  meetsParis: boolean | null;
  emissions: number | null;
  emissionsYear: number | null;
  sectorCode: string | null;
  tags: string[];
}

export function mapParisOverviewToCompanyWithKPIs(
  item: CompanyParisOverviewItem,
): CompanyWithKPIs {
  return {
    id: item.id,
    name: item.name,
    wikidataId: item.wikidataId,
    tags: item.tags,
    meetsParis: item.meetsParis,
    emissionsChangeFromBaseYear: null,
    industry: item.sectorCode
      ? { industryGics: { sectorCode: item.sectorCode } }
      : null,
    reportingPeriods:
      item.emissions != null && item.emissionsYear != null
        ? [
            {
              endDate: `${item.emissionsYear}-12-31`,
              emissions: { calculatedTotalEmissions: item.emissions },
            },
          ]
        : [],
    metrics: {
      emissionsReduction: 0,
      displayReduction: "0",
    },
  } as CompanyWithKPIs;
}
