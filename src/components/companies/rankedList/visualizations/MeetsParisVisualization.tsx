import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import { ParisAlignmentChart } from "./shared/ParisAlignmentChart";

interface MeetsParisVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function MeetsParisVisualization({
  companies,
}: MeetsParisVisualizationProps) {
  const { t } = useTranslation();

  const values = useMemo(
    () => companies.map((company) => company.meetsParis),
    [companies],
  );

  const hasKnownValues = values.some(
    (value) => value === true || value === false,
  );

  if (!hasKnownValues) {
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
    <div className="w-full h-full bg-black-2 rounded-level-2 p-4 md:p-6 overflow-hidden">
      <ParisAlignmentChart values={values} />
    </div>
  );
}
