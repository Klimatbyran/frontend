import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyWithKPIs } from "@/types/company";
import { EmissionsDistributionChart } from "./shared/EmissionsDistributionChart";

interface EmissionsChangeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function EmissionsChangeVisualization({
  companies,
}: EmissionsChangeVisualizationProps) {
  const { t } = useTranslation();

  const { values, unknownCount } = useMemo(() => {
    const withData: number[] = [];
    let missing = 0;

    companies.forEach((company) => {
      const value = company.emissionsChangeFromBaseYear;
      if (value === null || value === undefined || Number.isNaN(value)) {
        missing += 1;
        return;
      }
      withData.push(value);
    });

    return { values: withData, unknownCount: missing };
  }, [companies]);

  if (values.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companiesOverviewPage.visualizations.noDataAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black-2 rounded-level-2 p-4 md:p-6 overflow-hidden">
      <EmissionsDistributionChart
        values={values}
        unknownCount={unknownCount}
      />
    </div>
  );
}
