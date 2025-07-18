import type { paths } from "@/lib/api-types";
import { DivideIcon as LucideIcon } from "lucide-react";

// Base company type from API with simplified industry structure
export interface BaseCompany {
  wikidataId: string;
  name: string;
  descriptions?: {
    id: string;
    language: "SV" | "EN";
    text: string;
  }[];
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

// Canonical type matches backend
export type ReportingPeriod = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>["reportingPeriods"][number];

// Derived type for frontend, with optional id fields
export type ReportingPeriodWithOptionalIds = Omit<
  ReportingPeriod,
  "economy"
> & {
  economy: {
    id?: string;
    turnover: {
      id?: string;
      value: number | null;
      currency: string | null;
      metadata: any;
    } | null;
    employees: {
      id?: string;
      value: number | null;
      unit: string | null;
      metadata: any;
    } | null;
  } | null;
};

export type Emissions = NonNullable<ReportingPeriod["emissions"]>;

// Extended company type with metrics and optional rankings
export interface RankedCompany extends Omit<BaseCompany, "reportingPeriods"> {
  reportingPeriods: ReportingPeriodWithOptionalIds[];
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
