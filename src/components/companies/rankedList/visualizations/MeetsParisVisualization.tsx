import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { getBestUnit } from "@/utils/data/unitScaling";
import { getCompanyParisEmissionsData } from "@/utils/insights/meetsParisChartData";
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

  const { unitScale } = useMemo(() => {
    const emissionsValues = entries.map((entry) => entry.emissions);
    const max = emissionsValues.length ? Math.max(...emissionsValues) : 0;
    const groupTotals = [
      entries
        .filter((entry) => entry.meetsParis)
        .reduce((sum, entry) => sum + entry.emissions, 0),
      entries
        .filter((entry) => !entry.meetsParis)
        .reduce((sum, entry) => sum + entry.emissions, 0),
    ];
    const maxGroupTotal = Math.max(...groupTotals, max);
    return {
      unitScale: getBestUnit(maxGroupTotal, "tonnes", {
        maxDivisor: 1_000_000,
      }),
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companies.list.insights.noData.metric", {
            metric: t("companies.list.kpis.meetsParis.label"),
          })}
        </p>
      </div>
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
