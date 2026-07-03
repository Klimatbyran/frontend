import { TrendingDown } from "lucide-react";
import type { TFunction } from "i18next";
import type { RankedCompany } from "@/types/company";
import { getCompanyColors, sectorColors } from "@/lib/constants/companyColors";
import type { SectorCode } from "@/lib/constants/sectors";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateEmissionsChangeFromBaseYear } from "@/utils/calculations/emissionsCalculations";
import {
  formatEmissionsAbsoluteCompact,
  formatPercent,
  formatPercentChange,
  type SupportedLanguage,
} from "@/utils/formatting/localization";
import type { ChartInsight, InsightBar } from "./useSectorChartInsights";

export type PieChartEntry = {
  name: string;
  value: number;
  total: number;
  sectorCode?: string;
  wikidataId?: string;
  companyId?: string;
  scope1?: number;
  scope2?: number;
  scope3?: number;
};

export type SectorInsightsContext = {
  t: TFunction;
  companies: RankedCompany[];
  pieChartData: PieChartEntry[];
  reportingYear: string;
  currentLanguage: SupportedLanguage;
  emissionsUnit: string;
};

type CompanyTrend = {
  name: string;
  changePercent: number;
  company: { id: string; wikidataId?: string | null };
};

const REDUCING_BAR_COLORS = [
  "var(--green-5)",
  "var(--green-4)",
  "var(--green-3)",
  "var(--green-2)",
  "var(--green-1)",
] as const;

const INCREASING_BAR_COLORS = [
  "var(--pink-5)",
  "var(--pink-4)",
  "var(--pink-3)",
  "var(--pink-2)",
  "var(--pink-1)",
] as const;

export const countReportingCompanies = (
  companies: RankedCompany[],
  reportingYear: string,
  sectorCode?: string,
): RankedCompany[] => {
  return companies.filter((company) => {
    if (
      sectorCode &&
      company.industry?.industryGics?.sectorCode !== sectorCode
    ) {
      return false;
    }

    const period = company.reportingPeriods.find((p) =>
      p.endDate.startsWith(reportingYear),
    );
    return (period?.emissions?.calculatedTotalEmissions ?? 0) > 0;
  });
};

export const getMeetsParisStatus = (
  company: RankedCompany,
): "yes" | "no" | "unknown" => {
  const trendAnalysis = calculateTrendline(company);
  if (!trendAnalysis) {
    return "unknown";
  }

  return calculateMeetsParis(company, trendAnalysis) ? "yes" : "no";
};

export const getSectorColor = (sectorCode?: string): string => {
  if (!sectorCode) {
    return "var(--grey)";
  }

  return sectorColors[sectorCode as SectorCode]?.base ?? "var(--grey)";
};

export const formatEmissionsLabel = (
  value: number,
  share: number,
  currentLanguage: SupportedLanguage,
): string => {
  return `${formatPercent(share, currentLanguage)} · ${formatEmissionsAbsoluteCompact(value, currentLanguage)}`;
};

export const getComparableCompanyTrends = (
  reportingCompanies: RankedCompany[],
): CompanyTrend[] => {
  return reportingCompanies.flatMap((company) => {
    const changePercent = calculateEmissionsChangeFromBaseYear(company, {
      useLastPeriod: true,
    });

    if (changePercent === null || Math.abs(changePercent) > 60) {
      return [];
    }

    return [
      {
        name: company.name,
        changePercent,
        company: { id: company.id, wikidataId: company.wikidataId },
      },
    ];
  });
};

export const buildTrendChangeBars = (
  trends: CompanyTrend[],
  direction: "reducing" | "increasing",
  currentLanguage: SupportedLanguage,
): InsightBar[] => {
  const filtered = trends.filter((trend) =>
    direction === "reducing"
      ? trend.changePercent < 0
      : trend.changePercent > 0,
  );

  const sorted = [...filtered].sort((a, b) =>
    direction === "reducing"
      ? a.changePercent - b.changePercent
      : b.changePercent - a.changePercent,
  );

  const topTrends = sorted.slice(0, 5);
  const maxAbsChange = topTrends.reduce(
    (max, trend) => Math.max(max, Math.abs(trend.changePercent)),
    0,
  );

  if (maxAbsChange === 0) {
    return [];
  }

  const palette =
    direction === "reducing" ? REDUCING_BAR_COLORS : INCREASING_BAR_COLORS;

  return topTrends.map((trend, index) => ({
    label: trend.name,
    valueLabel: formatPercentChange(trend.changePercent, currentLanguage),
    share: Math.abs(trend.changePercent) / maxAbsChange,
    color: palette[index % palette.length],
    company: trend.company,
  }));
};

export const buildTopCompanyBars = (
  pieChartData: PieChartEntry[],
  currentLanguage: SupportedLanguage,
  limit = 5,
): InsightBar[] => {
  return pieChartData.slice(0, limit).map((entry, index) => ({
    label: entry.name,
    valueLabel: formatEmissionsLabel(
      entry.value,
      entry.value / entry.total,
      currentLanguage,
    ),
    share: entry.value / entry.total,
    color: getCompanyColors(index).base,
    company: entry.companyId
      ? { id: entry.companyId, wikidataId: entry.wikidataId }
      : undefined,
  }));
};

type TrendInsightConfig = {
  titleKey: string;
  statLabelKey: string;
  topDescriptionKey: string;
  fallbackDescriptionKey: string;
  comparableCount: number;
  count: number;
  bars: InsightBar[];
  icon: typeof TrendingDown;
  iconColor: string;
  bgColor: string;
};

export const buildTrendInsight = (
  t: TFunction,
  config: TrendInsightConfig,
  currentLanguage: SupportedLanguage,
): ChartInsight => {
  const {
    titleKey,
    statLabelKey,
    topDescriptionKey,
    fallbackDescriptionKey,
    comparableCount,
    count,
    bars,
    icon,
    iconColor,
    bgColor,
  } = config;

  let description = t("sectorsOverviewPage.insights.noComparableTrendData");
  if (comparableCount > 0) {
    description =
      bars.length > 0
        ? t(topDescriptionKey)
        : t(fallbackDescriptionKey, { count, total: comparableCount });
  }

  return {
    title: t(titleKey),
    stat:
      comparableCount > 0
        ? formatPercent(count / comparableCount, currentLanguage)
        : "–",
    statLabel: t(statLabelKey),
    description,
    bars: bars.length > 0 ? bars : undefined,
    icon,
    iconColor,
    bgColor,
  };
};
