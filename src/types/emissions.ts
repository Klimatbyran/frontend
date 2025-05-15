import type { ReportingPeriod } from "@/types/company";

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
