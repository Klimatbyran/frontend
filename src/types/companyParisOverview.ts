import type { CompanyListItem, CompanyWithKPIs } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";

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

export function mapCompanyListItemToParisOverview(
  company: CompanyListItem,
): CompanyParisOverviewItem {
  const latestPeriod = [...(company.reportingPeriods ?? [])].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  )[0];

  const emissions = latestPeriod?.emissions?.calculatedTotalEmissions ?? null;
  const emissionsYear = latestPeriod?.endDate
    ? new Date(latestPeriod.endDate).getFullYear()
    : null;

  const trendAnalysis = calculateTrendline(company);
  const meetsParis =
    emissions == null || emissions <= 0
      ? null
      : trendAnalysis
        ? calculateMeetsParis(company, trendAnalysis)
        : null;

  const wikidataId =
    company.wikidataId && /^Q\d+$/.test(company.wikidataId)
      ? company.wikidataId
      : null;

  return {
    id: company.id,
    wikidataId,
    name: company.name,
    meetsParis,
    emissions: emissions != null && emissions > 0 ? emissions : null,
    emissionsYear: Number.isFinite(emissionsYear) ? emissionsYear : null,
    sectorCode: company.industry?.industryGics?.sectorCode ?? null,
    tags: company.tags ?? [],
  };
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
