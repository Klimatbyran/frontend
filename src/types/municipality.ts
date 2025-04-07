import type { paths } from "@/lib/api-types";

export type Municipality = {
  name: string;
  region: string;
  budget: number;
  totalApproximatedHistoricalEmission: number;
  trendEmission: number;
  historicalEmissionChangePercent: number;
  neededEmissionChangePercent: number;
  budgetRunsOut: Date | string;
  climatePlanYear: number | string;
  climatePlanComment: string;
  climatePlanLink: string;
  electricVehiclePerChargePoints: number;
  bicycleMetrePerCapita: number;
  procurementScore: string;
  procurementLink: string | null;
  totalConsumptionEmission: number;
  hitNetZero: Date | string;
  electricCarChangeYearly: { year: string; value: number }[];
  electricCarChangePercent: number;
  wikidataId?: string;
  description?: string | null;
} & EmissionsData;

// Detailed municipality type from API
export type MunicipalityDetails = NonNullable<
  paths["/municipalities/{id}"]["get"]["responses"][200]["content"]["application/json"]
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

// Helper function to get latest year's data
export function getLatestYearData<T>(
  data: Record<string, T> | undefined,
): T | undefined {
  if (!data || typeof data !== "object") return undefined;

  const years = Object.keys(data)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);

  return years.length > 0 ? data[years[0].toString()] : undefined;
}

// Helper function to get all years from data
export function getAvailableYears(
  data: Record<string, unknown> | undefined,
): number[] {
  if (!data || typeof data !== "object") return [];

  return Object.keys(data)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);
}

export type EmissionDataPoint = {
  year: string;
  value: number;
};

export type EmissionsData = {
  emissions: EmissionDataPoint[];
  emissionBudget: EmissionDataPoint[];
  approximatedHistoricalEmission: EmissionDataPoint[];
  trend: EmissionDataPoint[];
};

export function transformEmissionsData(municipality: Municipality) {
  const years = new Set<string>();

  municipality.emissions.forEach((d) => years.add(d.year));
  municipality.emissionBudget.forEach((d) => years.add(d.year));
  municipality.approximatedHistoricalEmission.forEach((d) => years.add(d.year));
  municipality.trend.forEach((d) => years.add(d.year));

  return Array.from(years)
    .sort()
    .map((year) => {
      const historical = municipality.emissions.find(
        (d) => d.year === year,
      )?.value;
      const budget = municipality.emissionBudget.find(
        (d) => d.year === year,
      )?.value;
      const approximated = municipality.approximatedHistoricalEmission.find(
        (d) => d.year === year,
      )?.value;
      const trend = municipality.trend.find((d) => d.year === year)?.value;

      const gap = trend && budget ? trend - budget : undefined;

      return {
        year: parseInt(year, 10),
        total: historical || approximated,
        paris: budget,
        trend,
        gap,
      };
    })
    .filter((d) => d.year >= 1990 && d.year <= 2050);
}

export type DataPoint = {
  year: number;
  total: number | undefined;
  paris: number | undefined;
  trend: number | undefined;
  gap: number | undefined;
};
