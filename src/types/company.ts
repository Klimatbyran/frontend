import type { paths } from "@/lib/api-types";
import { DivideIcon as LucideIcon } from 'lucide-react';

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
}

// Base company type from API
export type CompanyDetails = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>;

// Common emissions type used across components
export interface Emissions {
  calculatedTotalEmissions: number;
  biogenicEmissions?: { total: number; unit: string } | null;
  scope1?: {
    total: number;
    unit: string;
    metadata: {
      verifiedBy: { name: string } | null;
    };
  } | null;
  scope2?: {
    mb?: number | null;
    lb?: number | null;
    unknown?: number | null;
    unit: string;
    calculatedTotalEmissions: number;
    metadata: {
      verifiedBy: { name: string } | null;
    };
  } | null;
  scope3?: {
    calculatedTotalEmissions: number;
    metadata: {
      verifiedBy: { name: string } | null;
    };
    statedTotalEmissions: {
      total: number;
      unit: string;
      metadata: {
        verifiedBy: { name: string } | null;
      };
    } | null;
    categories?: Array<{
      category: number;
      total: number;
      unit: string;
    }>;
  } | null;
  scope1And2?: {
    total: number;
    unit: string;
  } | null;
  statedTotalEmissions?: {
    total: number;
    unit: string;
    metadata: {
      verifiedBy: { name: string } | null;
    };
  } | null;
}

// Common reporting period type
export interface ReportingPeriod {
  id: string;
  startDate: string;
  endDate: string;
  reportURL: string | null;
  emissions: Emissions | null;
  economy: {
    turnover: {
      value: number | null;
      currency: string | null;
      metadata: {
        verifiedBy: { name: string } | null;
      };
    } | null;
    employees: {
      value: number | null;
      unit: string | null;
      metadata: {
        verifiedBy: { name: string } | null;
      };
    } | null;
  } | null;
}

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
