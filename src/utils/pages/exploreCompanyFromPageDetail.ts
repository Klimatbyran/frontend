import type {
  PageCompanyEmissionsHistory,
  PageCompanyHeader,
  PageCompanyOverview,
  PageExploreCompany,
} from "@/types/pages";

/** Latest reporting period from emissions history (newest year first). */
function latestEmissionsPeriod(history: PageCompanyEmissionsHistory | null) {
  if (!history?.periods.length) return null;
  return [...history.periods].sort((a, b) => b.year - a.year)[0] ?? null;
}

/**
 * Build an explore-shaped company row from the split company detail page
 * endpoints. Used by compare so we only fetch selected companies.
 */
export function exploreCompanyFromPageDetail(
  header: PageCompanyHeader,
  overview: PageCompanyOverview,
  history: PageCompanyEmissionsHistory | null,
): PageExploreCompany {
  const latestPeriod = latestEmissionsPeriod(history);
  const sectorCode = overview.sectorCode ?? header.sectorCode;
  const scope3Value = latestPeriod?.scope3?.value;
  const hasScope3Categories = Boolean(latestPeriod?.scope3Categories.length);

  return {
    id: header.id,
    wikidataId: header.wikidataId,
    name: header.name,
    logoUrl: header.logoUrl,
    tags: [],
    sectorCode,
    industryGroupCode: overview.industryGroupCode ?? header.industryGroupCode,
    baseYear: header.baseYear,
    meetsParis: overview.meetsParis,
    emissionsChangeFromBaseYear: null,
    latestYear: overview.year,
    latestTotalEmissions: overview.totalEmissions,
    emissionsChangeLastTwoYears: overview.emissionsChangeLastTwoYears,
    emissionsIsAIGenerated: overview.emissionsIsAIGenerated,
    changeRateIsAIGenerated: overview.changeRateIsAIGenerated,
    hasScope3Coverage: hasScope3Categories || scope3Value != null,
    isFinancialsSector: sectorCode === "40",
    scope1Emissions: latestPeriod?.scope1?.value ?? null,
    scope2Emissions: latestPeriod?.scope2?.value ?? null,
    scope3Emissions: scope3Value ?? null,
    turnover: overview.turnover,
    turnoverCurrency: overview.turnoverCurrency,
    turnoverIsAIGenerated: overview.turnoverIsAIGenerated,
    employees: overview.employees,
    employeesIsAIGenerated: overview.employeesIsAIGenerated,
  };
}
