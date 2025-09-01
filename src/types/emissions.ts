import type { ReportingPeriod } from "@/types/company";

export interface EmissionPeriod {
  startDate: string;
  endDate: string;
  emissions: {
    calculatedTotalEmissions: number;
    scope1?: { total: number; unit: string } | null;
    scope2?: {
      calculatedTotalEmissions: number;
    } | null;
    scope3?: {
      calculatedTotalEmissions: number;
      categories?: Array<{
        category: number;
        total: number;
        unit: string;
        isInterpolated?: boolean;
      }>;
    } | null;
  } | null;
  economy?: {
    turnover?: {
      value: number;
      unit: string;
    } | null;
  } | null;
}

export interface ChartData {
  year: number;
  total?: number;
  isAIGenerated?: boolean; // true if any scope/category is AI
  scope1?: { value: number; isAIGenerated?: boolean };
  scope2?: { value: number; isAIGenerated?: boolean };
  scope3?: { value: number; isAIGenerated?: boolean };
  scope3Categories?: Array<{
    category: number;
    value: number;
    isAIGenerated?: boolean;
  }>;
  originalValues?: Record<string, number | null>; // Keeps track of original null values
  [key: string]: any; // Allow any type for additional keys
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
  baseYear?: {
    id: string;
    year: number;
    metadata: {
      id: string;
      comment: string | null;
      source: string | null;
      updatedAt: string;
      user: { name: string };
      verifiedBy: { name: string } | null;
    };
  } | null;
}

export type DataView = "overview" | "scopes" | "categories";
