import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import SectorPieChart, {
  type PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import { InsightsEmptyState } from "@/components/ranked/InsightsPanelParts";
import { formatPercent } from "@/utils/formatting/localization";
import type { UnitScale } from "@/utils/data/unitScaling";
import { getParisEmissionsBreakdown } from "@/utils/insights/meetsParisChartData";
import {
  getParisStatusLabels,
  PARIS_STATUS_COLORS,
} from "@/utils/insights/meetsParisKpi";
import type { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { formatParisEmissionsAmount } from "./meetsParisEmissionsFormat";
import MeetsParisPieTooltip from "./MeetsParisPieTooltip";

type ParisPieChartItem = PieChartItem & {
  rawEmissions: number;
  unitScale: UnitScale;
  companyCount: number;
  totalCompanyCount: number;
};

interface MeetsParisEmissionsPieChartProps {
  companies: CompanyWithKPIs[];
  /** Omit unknown Paris status from slices (default true). */
  excludeUnknown?: boolean;
  /** Show amounts and percentages below the chart (default true). */
  showLegend?: boolean;
  maxOuterRadius?: number;
}

export function MeetsParisEmissionsPieChart({
  companies,
  excludeUnknown = true,
  showLegend = true,
  maxOuterRadius,
}: MeetsParisEmissionsPieChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const { pieData, unitScale, totalEmissions } = useMemo(() => {
    const { segments, unitScale, totalEmissions, totalCompanyCount } =
      getParisEmissionsBreakdown(companies, { excludeUnknown });
    const statusLabels = getParisStatusLabels(t);

    const pieData: ParisPieChartItem[] = segments.map((segment) => ({
      key: segment.status,
      name: statusLabels[segment.status],
      value: segment.emissions / unitScale.divisor,
      rawEmissions: segment.emissions,
      unitScale,
      companyCount: segment.companyCount,
      totalCompanyCount,
      color: PARIS_STATUS_COLORS[segment.status],
      status: segment.status,
    }));

    return { pieData, unitScale, totalEmissions };
  }, [companies, excludeUnknown, t]);

  if (pieData.length === 0 || totalEmissions <= 0) {
    return (
      <InsightsEmptyState
        message={t("companies.list.insights.noData.metric", {
          metric: t("companies.list.kpis.meetsParis.label"),
        })}
      />
    );
  }

  const totalScaled = totalEmissions / unitScale.divisor;

  return (
    <div
      className={
        showLegend
          ? "flex h-full min-h-0 flex-col gap-3"
          : "flex h-full min-h-[200px] w-full flex-col"
      }
    >
      <div
        className={
          showLegend
            ? "flex shrink-0 justify-center"
            : "flex h-full min-h-[200px] w-full items-center justify-center overflow-visible"
        }
      >
        <SectorPieChart
          data={pieData}
          maxOuterRadius={maxOuterRadius}
          chartMinHeight={showLegend ? 150 : undefined}
          fillContainer={!showLegend}
          tooltipContent={MeetsParisPieTooltip}
        />
      </div>

      {showLegend && (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1">
          {pieData.map((entry) => {
            const percentage =
              entry.value / totalScaled < 0.001
                ? "<0.1%"
                : formatPercent(entry.value / totalScaled, currentLanguage);
            const amount = formatParisEmissionsAmount(
              entry.rawEmissions,
              unitScale,
              t,
            );

            return (
              <div
                key={entry.name}
                className="flex items-center gap-3 rounded-md p-2"
              >
                <div
                  className="h-3 w-3 shrink-0 rounded"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white">{entry.name}</div>
                  <div className="flex justify-between gap-3 text-xs text-grey">
                    <span className="text-orange-2">{amount}</span>
                    <span>{percentage}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
