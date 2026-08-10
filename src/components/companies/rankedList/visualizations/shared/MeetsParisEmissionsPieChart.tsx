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
};

interface MeetsParisEmissionsPieChartProps {
  companies: CompanyWithKPIs[];
}

export function MeetsParisEmissionsPieChart({
  companies,
}: MeetsParisEmissionsPieChartProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const { pieData, unitScale, totalEmissions } = useMemo(() => {
    const { segments, unitScale, totalEmissions } =
      getParisEmissionsBreakdown(companies);
    const statusLabels = getParisStatusLabels(t);

    const pieData: ParisPieChartItem[] = segments.map((segment) => ({
      name: statusLabels[segment.status],
      value: segment.emissions / unitScale.divisor,
      rawEmissions: segment.emissions,
      unitScale,
      color: PARIS_STATUS_COLORS[segment.status],
      status: segment.status,
    }));

    return { pieData, unitScale, totalEmissions };
  }, [companies, t]);

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
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 justify-center">
        <SectorPieChart
          data={pieData}
          maxOuterRadius={88}
          chartMinHeight={150}
          tooltipContent={MeetsParisPieTooltip}
        />
      </div>

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
    </div>
  );
}
