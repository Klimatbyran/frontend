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
  turnover?: number;
  originalValues?: Record<string, number | null>; // Keeps track of original null values
  // Index signature for dynamically added category keys (cat1, cat2, etc.)
  // Category keys are added at runtime based on available scope3 categories
  // Values are typically: number (category emissions) or undefined (future years)
  // Using `any` here is pragmatic since properties are accessed dynamically (d[key])
  // and TypeScript cannot provide meaningful type safety for dynamic property access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
