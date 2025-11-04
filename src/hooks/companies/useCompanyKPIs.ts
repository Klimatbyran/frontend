import { useTranslation } from "react-i18next";
import {
  RankedCompany,
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChangeFromBaseYear } from "@/utils/calculations/emissionsCalculations";

// Re-export types for convenience
export type { CompanyWithKPIs, CompanyKPIValue } from "@/types/company";

// Type guard to check if a key exists on CompanyWithKPIs
export function hasKPIValue(
  company: CompanyWithKPIs,
  key: CompanyKPIValue["key"],
): company is CompanyWithKPIs &
  Record<CompanyKPIValue["key"], number | boolean | null> {
  return key in company;
}

export const useCompanyKPIs = (): CompanyKPIValue[] => {
  const { t } = useTranslation();

  const KPIs: CompanyKPIValue[] = [
    {
      label: t("companies.list.kpis.meetsParis.label"),
      key: "meetsParis",
      unit: "",
      source: "companies.list.kpis.meetsParis.source",
      sourceUrls: [],
      description: t("companies.list.kpis.meetsParis.description"),
      detailedDescription: t(
        "companies.list.kpis.meetsParis.detailedDescription",
      ),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("companies.list.kpis.meetsParis.booleanLabels.true"),
        false: t("companies.list.kpis.meetsParis.booleanLabels.false"),
      },
      nullValues: t("companies.list.kpis.meetsParis.nullValues"),
    },
    {
      label: t(
        "companies.list.kpis.emissionsChangeFromBaseYear.label",
        "Overall Emissions Change",
      ),
      key: "emissionsChangeFromBaseYear",
      unit: "%",
      source: "companies.list.kpis.emissionsChangeFromBaseYear.source",
      sourceUrls: [],
      description: t(
        "companies.list.kpis.emissionsChangeFromBaseYear.description",
      ),
      detailedDescription: t(
        "companies.list.kpis.emissionsChangeFromBaseYear.detailedDescription",
      ),
      higherIsBetter: false,
    },
    {
      label: t(
        "companies.list.kpis.trendSlope.label",
        "Emissions Trend (slope)",
      ),
      key: "trendSlope",
      unit: "%/yr",
      source: "companies.list.kpis.trendSlope.source",
      sourceUrls: [],
      description: t(
        "companies.list.kpis.trendSlope.description",
        "Estimated yearly change from LAD trendline (negative is better)",
      ),
      detailedDescription: t(
        "companies.list.kpis.trendSlope.detailedDescription",
        "Slope of the Least Absolute Deviations trendline fitted to reported emissions.",
      ),
      higherIsBetter: false,
      nullValues: t(
        "companies.list.kpis.trendSlope.nullValues",
        "Not enough data",
      ),
    },
  ];

  return KPIs;
};

// Helper function to enrich company with KPI values
export const enrichCompanyWithKPIs = (
  company: RankedCompany,
): CompanyWithKPIs => {
  const trendAnalysis = calculateTrendline(company);
  const meetsParis = trendAnalysis
    ? calculateMeetsParis(company, trendAnalysis)
    : null;

  const emissionsChangeFromBaseYear =
    calculateEmissionsChangeFromBaseYear(company);

  // Use API-derived yearly percentage change rather than raw slope (tCO2e/yr)
  const trendSlope: number | null = trendAnalysis
    ? typeof trendAnalysis.yearlyPercentageChange === "number"
      ? trendAnalysis.yearlyPercentageChange
      : null
    : null;

  return {
    ...company,
    meetsParis,
    emissionsChangeFromBaseYear,
    trendSlope,
  };
};
