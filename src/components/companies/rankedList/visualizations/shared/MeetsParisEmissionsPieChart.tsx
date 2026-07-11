import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { DetailPieSectorGrid } from "@/components/detail/DetailGrid";
import SectorPieChart, {
  type PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import { COLORS } from "@/lib/colors";
import { formatPercent } from "@/utils/formatting/localization";
import { formatWithScale } from "@/utils/data/unitScaling";
import { getParisEmissionsBreakdown } from "@/utils/insights/meetsParisChartData";
import type { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import MeetsParisPieTooltip from "./MeetsParisPieTooltip";

const STATUS_COLORS = {
  yes: COLORS.blue3,
  no: COLORS.pink3,
  unknown: COLORS.grey,
} as const;

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

    const statusLabels = {
      yes: t("companiesOverviewPage.visualizations.meetsParis.yes"),
      no: t("companiesOverviewPage.visualizations.meetsParis.no"),
      unknown: t("companiesOverviewPage.visualizations.meetsParis.unknown"),
    };

    const pieData: PieChartItem[] = segments.map((segment) => ({
      name: statusLabels[segment.status],
      value: segment.emissions / unitScale.divisor,
      color: STATUS_COLORS[segment.status],
      status: segment.status,
    }));

    return { pieData, unitScale, totalEmissions };
  }, [companies, t]);

  if (pieData.length === 0 || totalEmissions <= 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center">
        <p className="text-grey text-lg">
          {t("companies.list.insights.noData.metric", {
            metric: t("companies.list.kpis.meetsParis.label"),
          })}
        </p>
      </div>
    );
  }

  const totalScaled = totalEmissions / unitScale.divisor;

  return (
    <DetailPieSectorGrid>
      <SectorPieChart
        data={pieData}
        desktopScale
        tooltipContent={MeetsParisPieTooltip}
      />
      <div className="grid w-full grid-cols-1 gap-2">
        {pieData.map((entry) => {
          const percentage =
            entry.value / totalScaled < 0.001
              ? "<0.1%"
              : formatPercent(entry.value / totalScaled, currentLanguage);

          return (
            <div
              key={entry.name}
              className="flex items-center gap-2 rounded-md p-2"
            >
              <div
                className="h-3 w-3 shrink-0 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white">{entry.name}</div>
                <div className="flex justify-between text-xs text-grey">
                  <span className="text-orange-2">
                    {formatWithScale(
                      entry.value * unitScale.divisor,
                      unitScale,
                    )}
                  </span>
                  <span>{percentage}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DetailPieSectorGrid>
  );
}
