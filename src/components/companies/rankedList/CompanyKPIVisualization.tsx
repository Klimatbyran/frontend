import { useTranslation } from "react-i18next";
import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import { EmissionsChangeVisualization } from "@/components/companies/rankedList/visualizations/EmissionsChangeVisualization";
import { MeetsParisVisualization } from "./visualizations/MeetsParisVisualization";

interface CompanyKPIVisualizationProps {
  companies: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function CompanyKPIVisualization({
  companies,
  selectedKPI,
  onCompanyClick,
}: CompanyKPIVisualizationProps) {
  const { t } = useTranslation();

  // Route to specific visualization based on KPI key
  switch (selectedKPI.key) {
    case "meetsParis":
      return (
        <MeetsParisVisualization
          companies={companies}
          onCompanyClick={onCompanyClick}
        />
      );
    case "emissionsChangeFromBaseYear":
      return (
        <EmissionsChangeVisualization
          companies={companies}
          onCompanyClick={onCompanyClick}
        />
      );
    default:
      return (
        <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
          <p className="text-grey text-lg">
            {t("companiesOverviewPage.visualizations.noVisualizationAvailable")}
          </p>
        </div>
      );
  }
}
