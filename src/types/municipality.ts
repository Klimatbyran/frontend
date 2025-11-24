import type { paths } from "@/lib/api-types";

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
  sectorEmissions?: SectorEmissions;
  politicalRule: string[];
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
  year: string;
  value: number;
};

export type EmissionsData = {
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
};

export type DataPoint = {
  year: number;
  total: number | undefined;
  trend: number | undefined;
  approximated: number | undefined;
  carbonLaw: number | undefined;
};

export type SectorEmissions = {
  [year: string]: {
    [sector: string]: number;
  };
};

const MUNICIPALITY_SORT_BY = ["meets_paris", "name"] as const
export type MunicipalitySortBy = (typeof MUNICIPALITY_SORT_BY)[number];

export function isMunicipalitySortBy(value: string): value is MunicipalitySortBy {
  return MUNICIPALITY_SORT_BY.includes(value as MunicipalitySortBy);
}

const MUNICIPALITY_SORT_DIRECTION = ["best", "worst"] as const
export type MunicipalitySortDirection = (typeof MUNICIPALITY_SORT_DIRECTION)[number];

export function isMunicipalitySortDirection(value: string): value is MunicipalitySortDirection {
  return MUNICIPALITY_SORT_DIRECTION.includes(value as MunicipalitySortDirection);
}
