import type { ReportingPeriod } from "@/types/company";

export interface ChartData {
  year: number;
  total?: number;
  scope1?: number;
  scope2?: number;
  scope3?: number;
  originalValues?: Record<string, number | null>; // Keeps track of original null values
  [key: string]: number | Record<string, number | null> | undefined; // Ensure all additional keys are valid
}

export interface EmissionsFeatures {
  interpolateScope3: boolean;
  guessBaseYear: boolean;
  compositeTrend: boolean;
  outlierDetection: boolean;
}

export interface EmissionsHistoryProps {
  reportingPeriods: ReportingPeriod[];
  onYearSelect?: (year: string) => void;
  className?: string;
  features?: EmissionsFeatures;
  baseYear?: { id: string; year: number; metadata: { id: string; comment: string | null; source: string | null; updatedAt: string; user: { name: string; }; verifiedBy: { name: string; } | null; }; } | null
}

export type DataView = "overview" | "scopes" | "categories";
