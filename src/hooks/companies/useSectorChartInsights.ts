import { useMemo } from "react";
import { type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { useLanguage } from "@/components/LanguageProvider";
import { buildSectorOverviewInsights } from "./sectorOverviewInsights";
import { buildSectorSelectedInsights } from "./sectorSelectedInsights";

export type InsightBar = {
  label: string;
  valueLabel: string;
  share: number;
  color: string;
  company?: { id: string; wikidataId?: string | null };
};

export type InsightSegment = {
  label: string;
  count: number;
  color: string;
  displayValue?: string;
};

export type ChartInsight = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  stat?: string;
  statLabel?: string;
  bars?: InsightBar[];
  segments?: InsightSegment[];
};

type PieChartEntry = {
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

export const useSectorChartInsights = (
  companies: RankedCompany[],
  pieChartData: PieChartEntry[],
  selectedSector: string | null,
  reportingYear: string,
): ChartInsight[] => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const emissionsUnit = t("companyDetailPage.sectorGraphs.emissionsUnit");

  return useMemo(() => {
    if (pieChartData.length === 0) {
      return [];
    }

    const context = {
      t,
      companies,
      pieChartData,
      reportingYear,
      currentLanguage,
      emissionsUnit,
    };

    if (selectedSector) {
      return buildSectorSelectedInsights({ ...context, selectedSector });
    }

    return buildSectorOverviewInsights(context);
  }, [
    companies,
    pieChartData,
    selectedSector,
    reportingYear,
    currentLanguage,
    emissionsUnit,
    t,
  ]);
};
