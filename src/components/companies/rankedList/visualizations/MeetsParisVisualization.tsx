import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateCarbonBudgetPercent } from "@/utils/calculations/carbonBudget";
import {
  createFixedRangeGradient,
} from "@/utils/ui/colorGradients";
import { BeeswarmChart } from "./shared/BeeswarmChart";
import type { ColorFunction } from "@/types/visualizations";

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

interface CompanyBudgetData {
  company: CompanyWithKPIs;
  budgetPercent: number;
  meetsParis: boolean | null;
}

export function MeetsParisVisualization({
  companies,
  onCompanyClick,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();

  // Calculate budget percentages for all companies, excluding unknowns (null)
  const companyBudgetData: CompanyBudgetData[] = useMemo(() => {
    return companies
      .map((company) => {
        const trendAnalysis = calculateTrendline(company);
        const budgetPercent = calculateCarbonBudgetPercent(
          company,
          trendAnalysis,
        );
        if (budgetPercent === null) return null;
        return {
          company,
          budgetPercent,
          meetsParis: company.meetsParis ?? null,
        };
      })
      .filter((d): d is CompanyBudgetData => d !== null);
  }, [companies]);

  // Calculate min/max for beeswarm chart
  const budgetValues = useMemo(
    () => companyBudgetData.map((d) => d.budgetPercent),
    [companyBudgetData],
  );

  const min = useMemo(
    () => (budgetValues.length ? Math.min(...budgetValues) : 0),
    [budgetValues],
  );
  const max = useMemo(
    () => (budgetValues.length ? Math.max(...budgetValues) : 0),
    [budgetValues],
  );

  // Color function: range-based
  const colorForPercent: ColorFunction = useMemo(() => {
    return (value: number) => createFixedRangeGradient(-100, 100, value);
  }, []);

  // Companies without budget data
  const noBudgetCompanies = useMemo(() => {
    return companies.filter((c) => {
      const trendAnalysis = calculateTrendline(c);
      const budgetPercent = calculateCarbonBudgetPercent(c, trendAnalysis);
      return budgetPercent === null;
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
        Percent over or under each company's carbon budget. We estimate future
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
          getValue={(d) => d.budgetPercent}
          getCompanyName={(d) => d.company.name}
          getCompanyId={(d) => d.company.wikidataId}
          colorForValue={colorForPercent}
          min={min}
          max={max}
          unit="%"
          onCompanyClick={(d) => onCompanyClick?.(d.company)}
          xReferenceLines={[
            {
              value: 0,
              label: "Budget threshold (0%)",
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
