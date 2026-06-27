import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import {
  calculateParisPathBudget,
  calculateTrendTotalEmissions,
} from "@/utils/calculations/carbonBudget";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ParisBubbleChart } from "./ParisBubbleChart";

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function MeetsParisVisualization({
  companies,
  onCompanyClick,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();

  const { chartCompanies, noDataCount } = useMemo(() => {
    const withData: CompanyWithKPIs[] = [];
    const withoutData: CompanyWithKPIs[] = [];

    companies.forEach((company) => {
      const trendAnalysis = calculateTrendline(company);
      const hasData =
        calculateParisPathBudget(company, trendAnalysis) !== null &&
        calculateTrendTotalEmissions(company, trendAnalysis) !== null;

      if (hasData) {
        withData.push(company);
      } else {
        withoutData.push(company);
      }
    });

    return {
      chartCompanies: withData,
      noDataCount: withoutData.length,
    };
  }, [companies]);

  if (chartCompanies.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companiesOverviewPage.visualizations.noDataAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <ParisBubbleChart
        companies={chartCompanies}
        onCompanyClick={onCompanyClick}
      />

      {!isMobile && noDataCount > 0 && (
        <div className="text-sm text-grey">
          {t("companiesOverviewPage.visualizations.bubbleChart.missingData", {
            count: noDataCount,
          })}
        </div>
      )}
    </div>
  );
}
