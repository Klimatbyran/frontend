import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { getBestUnit } from "@/utils/data/unitScaling";
import { calculateCapThreshold } from "@/utils/data/capping";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import { BeeswarmChart } from "./shared/BeeswarmChart";
import {
  createBudgetColorFunction,
  getCompanyBudgetData,
} from "@/utils/insights/kpiColorUtils";

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function MeetsParisVisualization({
  companies,
  onCompanyClick,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();

  // Calculate budget data and basic statistics
  const { companyBudgetData, minRaw, maxRaw, budgetValues } = useMemo(
    () => getCompanyBudgetData(companies),
    [companies],
  );

  // Calculate unit scaling, capping, and display values
  const {
    unitScale,
    capThresholdRaw,
    needsCapping,
    min,
    max,
    legendMin,
    legendMax,
    colorForTonnes,
    formatTooltipValue,
  } = useMemo(() => {
    const absMax = Math.max(Math.abs(minRaw), Math.abs(maxRaw));
    const unitScale = getBestUnit(absMax);
    const capThresholdRaw = calculateCapThreshold(
      budgetValues,
      3,
      unitScale.divisor,
    );
    const needsCapping = maxRaw > capThresholdRaw;

    const min = minRaw / unitScale.divisor;
    const maxConverted = maxRaw / unitScale.divisor;
    const capConverted = capThresholdRaw / unitScale.divisor;
    const max = needsCapping ? capConverted : maxConverted;
    const legendMin = minRaw / unitScale.divisor;
    const legendMax = maxRaw / unitScale.divisor;

    const colorForTonnes = createBudgetColorFunction(minRaw, maxRaw);

    const formatTooltipValue = (value: number, _unit: string) => {
      const sign = value < 0 ? "-" : "+";
      return `${sign}${Math.abs(value).toFixed(1)}${unitScale.unit}`;
    };

    return {
      unitScale,
      capThresholdRaw,
      needsCapping,
      min,
      max,
      legendMin,
      legendMax,
      colorForTonnes,
      formatTooltipValue,
    };
  }, [minRaw, maxRaw, budgetValues]);

  if (companyBudgetData.length === 0) {
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
    <div className="w-full h-full flex flex-col gap-3">
      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-hidden">
        <BeeswarmChart
          data={companyBudgetData}
          getValue={(d) => {
            const converted = d.budgetTonnes / unitScale.divisor;
            // Cap positive values above threshold (only cap over-budget values)
            if (
              needsCapping &&
              converted > capThresholdRaw / unitScale.divisor
            ) {
              return capThresholdRaw / unitScale.divisor;
            }
            return converted;
          }}
          getRawValue={(d) => d.budgetTonnes / unitScale.divisor}
          getCompanyName={(d) => d.company.name}
          getCompanyId={(d) => getCompanyUrlSegment(d.company)}
          colorForValue={(value) => colorForTonnes(value * unitScale.divisor)}
          getMeetsParis={(d) => d.meetsParis}
          getBudgetValue={(d) => d.budgetTonnes / unitScale.divisor}
          min={min}
          max={max}
          unit={unitScale.unit}
          formatTooltipValue={formatTooltipValue}
          capThreshold={
            needsCapping ? capThresholdRaw / unitScale.divisor : undefined
          }
          onCompanyClick={(d) => onCompanyClick?.(d.company)}
          xReferenceLines={[
            {
              value: 0,
              label: t(
                "companiesOverviewPage.visualizations.meetsParis.budgetThreshold",
                {
                  unit: unitScale.unit,
                },
              ),
              color: "var(--grey)",
            },
          ]}
          legendMin={legendMin}
          legendMax={legendMax}
        />
      </div>
    </div>
  );
}
