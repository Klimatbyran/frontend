import {
  CompanyWithKPIs,
  CompanyKPIValue,
} from "@/hooks/companies/useCompanyKPIs";
import { MeetsParisVisualization } from "./visualizations/MeetsParisVisualization";
import { TrendSlopeVisualization } from "@/components/companies/rankedList/visualizations/TrendSlopeVisualization";

interface CompanyKPIVisualizationProps {
  companies: CompanyWithKPIs[];
  selectedKPI: CompanyKPIValue;
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

/**
 * Component that routes to the appropriate visualization based on the selected KPI
 * Each KPI can have its own custom visualization component
 */
export function CompanyKPIVisualization({
  companies,
  selectedKPI,
  onCompanyClick,
}: CompanyKPIVisualizationProps) {
  // Route to specific visualization based on KPI key
  switch (selectedKPI.key) {
    case "meetsParis":
      return (
        <MeetsParisVisualization
          companies={companies}
          onCompanyClick={onCompanyClick}
        />
      );
    case "trendSlope":
      return (
        <TrendSlopeVisualization
          companies={companies}
          onCompanyClick={onCompanyClick}
        />
      );
    case "emissionsChangeFromBaseYear":
      // TODO: Implement visualization for emissions change KPI
      return (
        <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
          <p className="text-grey text-lg">
            Visualization for emissions change coming soon
          </p>
        </div>
      );
    default:
      return (
        <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
          <p className="text-grey text-lg">
            No visualization available for this KPI
          </p>
        </div>
      );
  }
}
