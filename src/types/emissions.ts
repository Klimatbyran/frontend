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

import type { CompanyDetails } from "@/types/company";

export interface EmissionsHistoryProps {
  company: CompanyDetails;
  onYearSelect?: (year: string) => void;
  className?: string;
}

export type DataView = "overview" | "scopes" | "categories";

export type SectorEmissionsByYear = {
  [year: string]: {
    [sector: string]: number;
  };
};

// The API returns { sectors: { [year]: { [sector]: number } } }
export type SectorEmissionsResponse = {
  sectors: SectorEmissionsByYear;
};

// Type alias for components that expect { sectors: SectorEmissionsByYear }
export type SectorEmissions = SectorEmissionsResponse;

// Territory emissions data point (used for municipalities and regions)
export type DataPoint = {
  year: number;
  total: number | undefined;
  trend: number | undefined;
  approximated: number | undefined;
  carbonLaw: number | undefined;
};
