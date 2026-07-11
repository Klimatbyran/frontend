import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyWithKPIs } from "@/types/company";
import { buildEmissionsChangeHistogram } from "@/utils/visualizations/emissionsChangeHistogram";
import { EmissionsChangeBarChart } from "./shared/EmissionsChangeBarChart";

interface EmissionsChangeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function EmissionsChangeVisualization({
  companies,
  onCompanyClick,
}: EmissionsChangeVisualizationProps) {
  const { t } = useTranslation();

  const histogram = useMemo(
    () => buildEmissionsChangeHistogram(companies),
    [companies],
  );

  if (!histogram) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg text-center px-4">
          {t(
            "companiesOverviewPage.visualizations.emissionsChange.noComparableData",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-hidden">
        <EmissionsChangeBarChart
          companies={companies}
          onCompanyClick={onCompanyClick}
        />
      </div>
    </div>
  );
}
