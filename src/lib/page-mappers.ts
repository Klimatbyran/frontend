import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";
import type {
  CompaniesOverviewItem,
  ExploreCompanyItem,
  ExploreMunicipalityItem,
  ExploreRegionItem,
  SectorCompanyItem,
} from "@/lib/page-paths";

export type CompanyPageFields = {
  source: "explore" | "overview";
  meetsParis: boolean | null;
  emissionsChangeFromBaseYear: number | null;
  latestYear: number | null;
  latestTotalEmissions: number | null;
  emissionsChangeLastTwoYears: number | null;
  emissionsIsAIGenerated: boolean;
  changeRateIsAIGenerated: boolean;
  hasScope3Coverage: boolean;
  isFinancialsSector: boolean;
  scope1Emissions: number | null;
  scope2Emissions: number | null;
  scope3Emissions: number | null;
  turnover: number | null;
  turnoverCurrency: string | null;
  turnoverIsAIGenerated: boolean;
  employees: number | null;
  employeesIsAIGenerated: boolean;
};

export type PageBackedCompany = RankedCompany & {
  pageFields?: CompanyPageFields;
};

export function getPageFields(
  company: RankedCompany,
): CompanyPageFields | undefined {
  return (company as PageBackedCompany).pageFields;
}

function formatReductionValue(value: number | null): string {
  if (value == null) return "0.0";
  if (value > 200) return ">200";
  if (value < -200) return "<-200";
  return value.toFixed(1);
}

function industryFromCodes(
  sectorCode: string | null,
  industryGroupCode: string | null,
) {
  return {
    industryGics: {
      sectorCode: sectorCode ?? undefined,
      groupCode: industryGroupCode ?? undefined,
    },
  };
}

function sharedCompanyFields(
  item: CompaniesOverviewItem | ExploreCompanyItem | SectorCompanyItem,
) {
  return {
    id: item.id,
    wikidataId: item.wikidataId ?? null,
    name: item.name,
    tags: item.tags ?? [],
    industry: industryFromCodes(item.sectorCode, item.industryGroupCode),
  };
}

function pageFieldsFromExplore(item: ExploreCompanyItem): CompanyPageFields {
  return {
    source: "explore",
    meetsParis: item.meetsParis,
    emissionsChangeFromBaseYear: item.emissionsChangeFromBaseYear,
    latestYear: item.latestYear,
    latestTotalEmissions: item.latestTotalEmissions,
    emissionsChangeLastTwoYears: item.emissionsChangeLastTwoYears,
    emissionsIsAIGenerated: item.emissionsIsAIGenerated,
    changeRateIsAIGenerated: item.changeRateIsAIGenerated,
    hasScope3Coverage: item.hasScope3Coverage,
    isFinancialsSector: item.isFinancialsSector,
    scope1Emissions: item.scope1Emissions,
    scope2Emissions: item.scope2Emissions,
    scope3Emissions: item.scope3Emissions,
    turnover: item.turnover,
    turnoverCurrency: item.turnoverCurrency,
    turnoverIsAIGenerated: item.turnoverIsAIGenerated,
    employees: item.employees,
    employeesIsAIGenerated: item.employeesIsAIGenerated,
  };
}

function pageFieldsFromOverview(
  item: CompaniesOverviewItem,
): CompanyPageFields {
  return {
    source: "overview",
    meetsParis: item.meetsParis,
    emissionsChangeFromBaseYear: item.emissionsChangeFromBaseYear,
    latestYear: item.latestYear,
    latestTotalEmissions: item.latestTotalEmissions,
    emissionsChangeLastTwoYears: null,
    emissionsIsAIGenerated: false,
    changeRateIsAIGenerated: false,
    hasScope3Coverage: false,
    isFinancialsSector: item.sectorCode === "40",
    scope1Emissions: null,
    scope2Emissions: null,
    scope3Emissions: null,
    turnover: null,
    turnoverCurrency: null,
    turnoverIsAIGenerated: false,
    employees: null,
    employeesIsAIGenerated: false,
  };
}

export function mapCompaniesOverviewItem(
  item: CompaniesOverviewItem,
): RankedCompany {
  const change = item.emissionsChangeFromBaseYear;
  return {
    ...sharedCompanyFields(item),
    logoUrl: item.logoUrl ?? null,
    baseYear: item.baseYear == null ? null : { year: item.baseYear },
    reportingPeriods: [],
    metrics: {
      emissionsReduction: change ?? 0,
      displayReduction: formatReductionValue(change),
    },
    pageFields: pageFieldsFromOverview(item),
  } as RankedCompany;
}

export function mapExploreCompany(item: ExploreCompanyItem): RankedCompany {
  const change = item.emissionsChangeLastTwoYears;
  return {
    ...sharedCompanyFields(item),
    logoUrl: item.logoUrl ?? null,
    baseYear: item.baseYear == null ? null : { year: item.baseYear },
    reportingPeriods: [],
    metrics: {
      emissionsReduction: change ?? 0,
      displayReduction: formatReductionValue(change),
    },
    pageFields: pageFieldsFromExplore(item),
  } as RankedCompany;
}

export function mapSectorCompany(item: SectorCompanyItem): RankedCompany {
  const periods = [...item.periods].sort((a, b) => b.year - a.year);

  return {
    ...sharedCompanyFields(item),
    logoUrl: null,
    reportingPeriods: periods.map((period) => {
      const year = Math.trunc(period.year);
      const scope1 = period.scope1 ?? 0;
      const scope2 = period.scope2 ?? 0;
      const scope3 = period.scope3 ?? 0;
      return {
        endDate: `${year}-12-31`,
        emissions: {
          calculatedTotalEmissions: period.total ?? scope1 + scope2 + scope3,
          scope1: period.scope1 == null ? undefined : { total: period.scope1 },
          scope2:
            period.scope2 == null
              ? undefined
              : { calculatedTotalEmissions: period.scope2 },
          scope3:
            period.scope3 == null
              ? undefined
              : { calculatedTotalEmissions: period.scope3 },
        },
      };
    }),
    metrics: {
      emissionsReduction: 0,
      displayReduction: "0.0",
    },
  } as RankedCompany;
}

export function mapExploreMunicipality(
  item: ExploreMunicipalityItem,
): Municipality {
  const emissions =
    item.lastYear != null && item.lastYearEmissions != null
      ? [{ year: Math.trunc(item.lastYear), value: item.lastYearEmissions }]
      : [];

  return {
    name: item.name,
    region: item.region,
    logoUrl: item.logoUrl,
    meetsParisGoal: item.meetsParis,
    totalTrend: 0,
    totalCarbonLaw: 0,
    historicalEmissionChangePercent: item.historicalEmissionChangePercent,
    climatePlan: item.climatePlan,
    climatePlanYear: item.climatePlanYear,
    climatePlanComment: null,
    climatePlanLink: null,
    electricVehiclePerChargePoints: item.electricVehiclePerChargePoints,
    bicycleMetrePerCapita: item.bicycleMetrePerCapita,
    procurementScore: item.procurementScore,
    procurementLink: null,
    totalConsumptionEmission: item.totalConsumptionEmission,
    electricCarChangePercent: item.electricCarChangePercent,
    politicalRule: item.politicalRule,
    politicalKSO: item.politicalKSO,
    emissions,
    approximatedHistoricalEmission: [],
    trend: [],
  };
}

export function mapExploreRegion(item: ExploreRegionItem) {
  return {
    name: item.name,
    logoUrl: item.logoUrl ?? null,
    lastYear: item.lastYear,
    lastYearEmissions: item.lastYearEmissions,
    meetsParis: item.meetsParis,
    historicalEmissionChangePercent: item.historicalEmissionChangePercent,
    municipalityCount: item.municipalityCount,
    municipalities: item.municipalities,
  };
}
