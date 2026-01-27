import { DivideIcon as LucideIcon } from "lucide-react";
import type { paths } from "@/lib/api-types";
import type { KPIValue } from "./rankings";

// Base company type from API
export type CompanyDetails = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>;

// Type for reporting periods from the list endpoint (/companies/)
export type ReportingPeriodFromList = NonNullable<
  paths["/companies/"]["get"]["responses"][200]["content"]["application/json"][number]
>["reportingPeriods"][number];

// Type for reporting periods from the detail endpoint (/companies/{wikidataId})
export type ReportingPeriodFromDetail = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>["reportingPeriods"][number];

// Simplified aliases for common usage
export type ReportingPeriod = ReportingPeriodFromDetail; // For detail pages

export type Emissions = NonNullable<ReportingPeriod["emissions"]>;

/**
 * Type constraint for objects that can be checked for AI generation.
 * Objects must have optional metadata with verifiedBy and user properties.
 * Used for verification of emissions data (scope1, scope2, scope3 categories, etc.)
 */
export type AIGeneratable = {
  metadata?: {
    verifiedBy?: { name: string } | null;
    user?: { name?: string } | null;
  };
};

// Scope 3 category type extracted from API
export type Scope3Category = NonNullable<
  NonNullable<CompanyDetails["reportingPeriods"][0]["emissions"]>["scope3"]
>["categories"][0];

// Company type from the list endpoint (/companies/)
export type CompanyListItem = NonNullable<
  paths["/companies/"]["get"]["responses"][200]["content"]["application/json"][number]
>;

// Extended company type with metrics and optional rankings
export interface RankedCompany
  extends Omit<CompanyListItem, "reportingPeriods"> {
  reportingPeriods: ReportingPeriodFromList[];
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

// Props interface for company edit components
export interface CompanyEditComponentProps {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

// Extended Company type with KPI values
export interface CompanyWithKPIs extends RankedCompany {
  meetsParis?: boolean | null;
  emissionsChangeFromBaseYear?: number | null;
  [key: string]: unknown;
}

// KPI value type for companies (aliased to generic KPIValue for type safety)
export type CompanyKPIValue = KPIValue<CompanyWithKPIs>;
