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

  // Convert min/max to the selected unit for display
  const min = useMemo(
    () => minRaw / unitScale.divisor,
    [minRaw, unitScale.divisor],
  );
  const max = useMemo(
    () => maxRaw / unitScale.divisor,
    [maxRaw, unitScale.divisor],
  );

  // Color function: range-based (uses raw values for color calculation)
  // Use symmetric range around 0, with reasonable bounds based on data
  const colorForTonnes: ColorFunction = useMemo(() => {
    // Use a symmetric range centered at 0 (in raw tonnes)
    const absMax = Math.max(Math.abs(minRaw), Math.abs(maxRaw));
    return (value: number) => createFixedRangeGradient(-absMax, absMax, value);
  }, [minRaw, maxRaw]);

  // Format tooltip value with appropriate unit
  // Note: value is already converted to the selected unit scale
  const formatTooltipValue = useMemo(() => {
    return (value: number, _unit: string) => {
      const sign = value < 0 ? "-" : "+";
      return `${sign}${Math.abs(value).toFixed(1)}${unitScale.unit}`;
    };
  }, [unitScale]);

  // Companies without budget data
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
      <p className="text-grey text-sm">
        Tonnes over or under each company's carbon budget. We estimate future
        emissions with an LAD trendline and compare cumulative 2025–2050
        emissions to a Carbon Law path (11.7% yearly reduction).{" "}
        <a
          href="/methodology?view=companyDataOverview"
          className="underline hover:text-white"
        >
          Learn more
        </a>
      </p>

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
          getValue={(d) => d.budgetTonnes / unitScale.divisor}
          getCompanyName={(d) => d.company.name}
          getCompanyId={(d) => d.company.wikidataId}
          colorForValue={(value) => colorForTonnes(value * unitScale.divisor)}
          min={min}
          max={max}
          unit={unitScale.unit}
          formatTooltipValue={formatTooltipValue}
          onCompanyClick={(d) => onCompanyClick?.(d.company)}
          xReferenceLines={[
            {
              value: 0,
              label: `Budget threshold (0${unitScale.unit})`,
              color: "rgba(255, 255, 255, 0.5)",
            },
          ]}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-grey">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-3 rounded" />
          <span>
            {t(
              "companies.list.visualizations.meetsParis.underBudget",
              "Under Budget",
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-3 rounded" />
          <span>
            {t(
              "companies.list.visualizations.meetsParis.overBudget",
              "Over Budget",
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
