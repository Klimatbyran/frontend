import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import {
  getCompanyParisEmissionsData,
  getParisBarChartUnitScale,
} from "@/utils/insights/meetsParisChartData";
import { InsightsEmptyState } from "@/components/ranked/InsightsPanelParts";
import { MeetsParisBarChart } from "./shared/MeetsParisBarChart";

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function MeetsParisVisualization({
  companies,
  onCompanyClick,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();

  const entries = useMemo(
    () => getCompanyParisEmissionsData(companies),
    [companies],
  );

  const unitScale = useMemo(
    () => getParisBarChartUnitScale(entries),
    [entries],
  );

  if (entries.length === 0) {
    return (
      <InsightsEmptyState
        message={t("companies.list.insights.noData.metric", {
          metric: t("companies.list.kpis.meetsParis.label"),
        })}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="relative flex-1 overflow-hidden rounded-level-2 bg-black-2 p-3">
        <MeetsParisBarChart
          entries={entries}
          unitScale={unitScale}
          onCompanyClick={(entry) => onCompanyClick?.(entry.company)}
        />
      </div>
    </div>
  );
}
