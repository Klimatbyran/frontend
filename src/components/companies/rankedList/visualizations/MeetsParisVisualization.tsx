import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateCarbonBudgetTonnes } from "@/utils/calculations/carbonBudget";
import { createFixedRangeGradient } from "@/utils/ui/colorGradients";
import { BeeswarmChart } from "./shared/BeeswarmChart";
import type { ColorFunction } from "@/types/visualizations";

// Determine the best unit for displaying values
type UnitScale = {
  unit: string;
  divisor: number;
  label: string;
};

const getBestUnit = (maxAbsValue: number): UnitScale => {
  const absValue = Math.abs(maxAbsValue);

  if (absValue >= 1_000_000_000) {
    return { unit: " Gt", divisor: 1_000_000_000, label: "Gt" };
  } else if (absValue >= 1_000_000) {
    return { unit: " Mt", divisor: 1_000_000, label: "Mt" };
  } else if (absValue >= 1_000) {
    return { unit: " kt", divisor: 1_000, label: "kt" };
  }
  return { unit: " t", divisor: 1, label: "t" };
};

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface CompanyBudgetData {
  company: CompanyWithKPIs;
  budgetTonnes: number;
  meetsParis: boolean | null;
}

export function MeetsParisVisualization({
  companies,
  onCompanyClick,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();

  // Calculate budget tonnes for all companies, excluding unknowns (null)
  const companyBudgetData: CompanyBudgetData[] = useMemo(() => {
    return companies
      .map((company) => {
        const trendAnalysis = calculateTrendline(company);
        const budgetTonnes = calculateCarbonBudgetTonnes(
          company,
          trendAnalysis,
        );
        if (budgetTonnes === null) return null;
        return {
          company,
          budgetTonnes,
          meetsParis: company.meetsParis ?? null,
        };
      })
      .filter((d): d is CompanyBudgetData => d !== null);
  }, [companies]);

  // Calculate min/max for beeswarm chart (in raw tonnes)
  const budgetValues = useMemo(
    () => companyBudgetData.map((d) => d.budgetTonnes),
    [companyBudgetData],
  );

  const minRaw = useMemo(
    () => (budgetValues.length ? Math.min(...budgetValues) : 0),
    [budgetValues],
  );
  const maxRaw = useMemo(
    () => (budgetValues.length ? Math.max(...budgetValues) : 0),
    [budgetValues],
  );

  // Determine best unit based on absolute max value
  const unitScale = useMemo(() => {
    const absMax = Math.max(Math.abs(minRaw), Math.abs(maxRaw));
    return getBestUnit(absMax);
  }, [minRaw, maxRaw]);

  // Calculate dynamic cap threshold based on data distribution
  // Use 85th percentile of positive values, or median * 2, whichever is more reasonable
  // More aggressive capping to push down extreme outliers
  const capThresholdRaw = useMemo(() => {
    if (budgetValues.length === 0) return 8 * unitScale.divisor;

    // Get only positive values (over budget)
    const positiveValues = budgetValues
      .filter((v) => v > 0)
      .sort((a, b) => a - b);

    if (positiveValues.length === 0) {
      // No positive values, use a default based on unit
      return 8 * unitScale.divisor;
    }

    // Calculate 85th percentile (more aggressive than 95th)
    const percentile85Index = Math.floor(positiveValues.length * 0.85);
    const percentile85 =
      positiveValues[percentile85Index] ||
      positiveValues[positiveValues.length - 1];

    // Calculate median
    const medianIndex = Math.floor(positiveValues.length / 2);
    const median = positiveValues[medianIndex] || 0;

    // Use the larger of: 85th percentile, or median * 2 (more aggressive multiplier)
    // This ensures we cap extreme outliers more aggressively
    const dynamicCap = Math.max(percentile85, median * 2);

    // Lower minimum cap of 3 in the selected unit (more aggressive)
    const minCap = 3 * unitScale.divisor;

    // Round up to a nice number in the selected unit for cleaner display
    const capInUnit = dynamicCap / unitScale.divisor;
    const roundedCap = Math.ceil(capInUnit / 1) * 1; // Round to nearest whole number

    return Math.max(roundedCap * unitScale.divisor, minCap);
  }, [budgetValues, unitScale.divisor]);

  // Check if we need to apply capping (only if max exceeds threshold)
  const needsCapping = useMemo(() => {
    return maxRaw > capThresholdRaw;
  }, [maxRaw, capThresholdRaw]);

  // Convert min/max to the selected unit for display (capped for chart positioning)
  const min = useMemo(
    () => minRaw / unitScale.divisor,
    [minRaw, unitScale.divisor],
  );
  const max = useMemo(() => {
    // Cap the max at the threshold for display if needed
    const maxConverted = maxRaw / unitScale.divisor;
    const capConverted = capThresholdRaw / unitScale.divisor;
    return needsCapping ? capConverted : maxConverted;
  }, [maxRaw, unitScale.divisor, capThresholdRaw, needsCapping]);

  // Raw min/max for legend (uncapped, showing actual data range)
  const legendMin = useMemo(
    () => minRaw / unitScale.divisor,
    [minRaw, unitScale.divisor],
  );
  const legendMax = useMemo(
    () => maxRaw / unitScale.divisor,
    [maxRaw, unitScale.divisor],
  );

  // Color function: range-based (uses raw values for color calculation)
  const colorForTonnes: ColorFunction = useMemo(() => {
    const absMax = Math.max(Math.abs(minRaw), Math.abs(maxRaw));
    return (value: number) => createFixedRangeGradient(-absMax, absMax, value);
  }, [minRaw, maxRaw]);

  const formatTooltipValue = useMemo(() => {
    return (value: number, _unit: string) => {
      const sign = value < 0 ? "-" : "+";
      return `${sign}${Math.abs(value).toFixed(1)}${unitScale.unit}`;
    };
  }, [unitScale]);

  const noBudgetCompanies = useMemo(() => {
    return companies.filter((c) => {
      const trendAnalysis = calculateTrendline(c);
      const budgetTonnes = calculateCarbonBudgetTonnes(c, trendAnalysis);
      return budgetTonnes === null;
    });
  }, [companies]);

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
      <div className="flex items-center justify-between">
        <div className="text-sm text-grey">
          {t("companies.list.kpis.meetsParis.label")}
          {" · "}
          {t("companies.list.kpis.meetsParis.nullValues", "Unknown")}:{" "}
          {noBudgetCompanies.length}
        </div>
      </div>

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-auto">
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
          getCompanyId={(d) => d.company.wikidataId}
          colorForValue={(value) => colorForTonnes(value * unitScale.divisor)}
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
                "companiesRankedPage.visualizations.meetsParis.budgetThreshold",
                {
                  unit: unitScale.unit,
                },
              ),
              color: "rgba(255, 255, 255, 0.5)",
            },
          ]}
          legendMin={legendMin}
          legendMax={legendMax}
          leftLabel={t(
            "companiesRankedPage.visualizations.meetsParis.legend.belowBudget",
          )}
          rightLabel={t(
            "companiesRankedPage.visualizations.meetsParis.legend.aboveBudget",
          )}
        />
      </div>

      <p className="text-grey text-sm">
        {t("companiesRankedPage.visualizations.meetsParis.description")}{" "}
        <a
          href="/methodology?view=companyDataOverview"
          className="underline hover:text-white"
        >
          {t("companiesRankedPage.visualizations.meetsParis.learnMore")}
        </a>
      </p>
    </div>
  );
}
