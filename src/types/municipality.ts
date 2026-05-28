import type { paths } from "@/lib/api-types";
import { SectorEmissionsByYear } from "./emissions";

export { getLatestYearData, getAvailableYears } from "@/utils/data/yearUtils";
export { transformEmissionsData } from "@/utils/data/municipalityTransforms";

export type Municipality = {
  name: string;
  region: string;
  logoUrl: string | null;
  meetsParisGoal: boolean;
  totalTrend: number;
  totalCarbonLaw: number;
  historicalEmissionChangePercent: number;
  climatePlan: boolean;
  climatePlanYear: number | null;
  climatePlanComment: string | null;
  climatePlanLink: string | null;
  electricVehiclePerChargePoints: number | null;
  bicycleMetrePerCapita: number;
  procurementScore: number;
  procurementLink: string | null;
  totalConsumptionEmission: number;
  electricCarChangePercent: number;
  wikidataId?: string;
  description?: string | null;
  sectorEmissions?: SectorEmissionsByYear;
  politicalRule: string[];
  politicalKSO: string;
} & EmissionsData;

// Detailed municipality type from API
export type MunicipalityDetails = NonNullable<
  paths["/municipalities/{name}"]["get"]["responses"][200]["content"]["application/json"]
>;

// Helper type for emissions data by year
export type EmissionsByYear = Record<
  string,
  {
    total: number;
    historical: number;
    target: number;
  }
>;

// Helper type for metrics data by year
export type MetricsByYear = Record<
  string,
  {
    rank: string;
    targetDate: string;
    yearlyReduction: number;
  }
>;

export type EmissionDataPoint = {
  year: number;
  value: number;
};

export type EmissionsData = {
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
};

const MUNICIPALITY_SORT_BY = [
  "meets_paris",
  "name",
  "total_emissions",
  "emissions_reduction",
] as const;
export type MunicipalitySortBy = (typeof MUNICIPALITY_SORT_BY)[number];

export function isMunicipalitySortBy(
  value: string,
): value is MunicipalitySortBy {
  return MUNICIPALITY_SORT_BY.includes(value as MunicipalitySortBy);
}

const MEETS_PARIS_OPTIONS = ["all", "yes", "no"] as const;
export type MeetsParisFilter = (typeof MEETS_PARIS_OPTIONS)[number];

export function isMeetsParisFilter(value: string): value is MeetsParisFilter {
  return MEETS_PARIS_OPTIONS.includes(value as MeetsParisFilter);
}
