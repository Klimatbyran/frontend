import type { paths } from "@/lib/api-types";

export { getLatestYearData, getAvailableYears } from "@/utils/data/yearUtils";
export { transformEmissionsData } from "@/utils/data/municipalityTransforms";

export type Municipality = {
  name: string;
  region: string;
  logoUrl: string | null
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

export type MunicipalitySortBy = "meets_paris" | "name";
export type MunicipalitySortDirection = "best" | "worst";
