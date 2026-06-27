import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
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
  return (
    <MeetsParisVisualization
      companies={companies}
      selectedKPI={selectedKPI}
      onCompanyClick={onCompanyClick}
    />
  );
}
