import type { paths } from "@/lib/api-types";
import { DivideIcon as LucideIcon } from "lucide-react";

// Base company type from API with simplified industry structure
export interface BaseCompany {
  wikidataId: string;
  name: string;
  description: string | null;
  industry: {
    industryGics: {
      sectorCode: string;
      groupCode: string;
      industryCode: string;
      subIndustryCode: string;
    };
    metadata: {
      verifiedBy: { name: string } | null;
    };
  } | null;
  reportingPeriods: ReportingPeriod[];
  baseYear?: { id: string; year: number; metadata: any } | null;
}

// Base company type from API
export type CompanyDetails = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>;

// Use backend types for edit flow
export type ReportingPeriod = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>["reportingPeriods"][number];

export type Emissions = NonNullable<ReportingPeriod["emissions"]>;

// Extended company type with metrics and optional rankings
export interface RankedCompany extends BaseCompany {
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
