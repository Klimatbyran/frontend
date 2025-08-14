import type { paths } from "@/lib/api-types";

export type Municipality = {
  name: string;
  region: string;
  budget: number | null;
  totalApproximatedHistoricalEmission: number;
  trendEmission: number;
  historicalEmissionChangePercent: number;
  neededEmissionChangePercent: number | null;
  budgetRunsOut: string | null;
  climatePlanYear: number | null;
  climatePlanComment: string | null;
  climatePlanLink: string | null;
  electricVehiclePerChargePoints: number | null;
  bicycleMetrePerCapita: number;
  procurementScore: string;
  procurementLink: string | null;
  totalConsumptionEmission: number;
  hitNetZero: string | null;
  electricCarChangeYearly: ({ year: string; value: number } | null)[];
  electricCarChangePercent: number;
  wikidataId?: string;
  description?: string | null;
  sectorEmissions?: SectorEmissions;
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

// Helper function to get latest year's data
export function getLatestYearData<T>(
  data: Record<string, T> | undefined,
): T | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

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
  if (!data || typeof data !== "object") {
    return [];
  }

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
  emissions: (EmissionDataPoint | null)[];
  emissionBudget?: (EmissionDataPoint | null)[] | null;
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
};

export function transformEmissionsData(municipality: Municipality) {
  const years = new Set<string>();

  municipality.emissions.forEach((d) => d?.year && years.add(d.year));
  municipality.emissionBudget?.forEach((d) => d?.year && years.add(d.year));
  municipality.approximatedHistoricalEmission.forEach(
    (d) => d?.year && years.add(d.year),
  );
  municipality.trend.forEach((d) => d?.year && years.add(d.year));

  return Array.from(years)
    .sort()
    .map((year) => {
      const historical = municipality.emissions.find(
        (d) => d?.year === year,
      )?.value;
      const budget = municipality.emissionBudget?.find(
        (d) => d?.year === year,
      )?.value;
      const approximated = municipality.approximatedHistoricalEmission.find(
        (d) => d?.year === year,
      )?.value;
      const trend = municipality.trend.find((d) => d?.year === year)?.value;

      const gap = trend && budget ? trend - budget : undefined;

      return {
        year: parseInt(year, 10),
        total: historical,
        paris: budget,
        trend,
        gap,
        approximated: approximated,
      };
    })
    .filter((d) => d.year >= 1990 && d.year <= 2050);
}

export function getSortedMunicipalKPIValues(municipalities: Municipality[], kpi: KPIValue){
  return [...municipalities].sort((a, b) => {
    const aValue = a[kpi.key] ?? null;
    const bValue = b[kpi.key] ?? null;

    if(aValue === null && bValue === null){
      return 0;
    } else if(aValue === null){
      return 1;
    } else if(bValue === null){
      return -1;
    }

    return kpi.higherIsBetter ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
  });
}

export type DataPoint = {
  year: number;
  total: number | undefined;
  paris: number | undefined;
  trend: number | undefined;
  gap: number | undefined;
  approximated: number | undefined;
};

export interface KPIValue {
  label: string;
  key: keyof Municipality;
  unit: string;
  source: string;
  sourceUrls: string[];
  description: string;
  detailedDescription: string;
  nullValues?: string;
  higherIsBetter: boolean;
}

export type SectorEmissions = {
  [year: string]: {
    [sector: string]: number;
  };
};
