import type { paths } from "@/lib/api-types";
import { DivideIcon as LucideIcon } from "lucide-react";

// Base company type from API
export type CompanyDetails = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>;

// Canonical type matches backend
export type ReportingPeriod = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>["reportingPeriods"][number];

// Type for transformed reporting periods in useCompanies hook
export interface TransformedReportingPeriod
  extends Omit<ReportingPeriod, "id" | "emissions"> {
  id: string; // Overridden to use startDate instead of original ID
  emissions: Emissions | null; // Cleaned emissions data
  // Economy field remains the same as ReportingPeriod (with required IDs)
}

export type Emissions = NonNullable<ReportingPeriod["emissions"]>;

// Extended company type with metrics and optional rankings
export interface RankedCompany extends Omit<BaseCompany, "reportingPeriods"> {
  reportingPeriods: TransformedReportingPeriod[];
  metrics: {
    emissionsReduction: number;
    displayReduction: string;
  };
  rankings?: {
    overall: string;
    sector: string;
    category: string;
  };
}

// Scope 3 historical data type
export interface Scope3HistoricalData {
  year: number;
  total: number;
  unit: string;
  categories: Array<{
    category: number;
    total: number;
    unit: string;
  }>;
}

export interface TrendData {
  decreasing: Array<{
    company: RankedCompany;
    changePercent: number;
    baseYear: string;
    currentYear: string;
  }>;
  increasing: Array<{
    company: RankedCompany;
    changePercent: number;
    baseYear: string;
    currentYear: string;
  }>;
  noComparable: RankedCompany[];
}

export interface TrendCardInfo {
  title: string;
  icon: typeof LucideIcon;
  color: string;
  textColor: string;
}

// GICS option type for dropdown and details, based on API response
export type GicsOption = {
  code: string;
  label?: string;
  en?: { subIndustryName?: string };
  subIndustryName?: string;
  sector?: string;
  group?: string;
  industry?: string;
  description?: string;
};
