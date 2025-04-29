import React from "react";
import { RankedCompany } from "@/hooks/companies/useCompanies";
import {
  CompanySector,
  useSectorNames,
} from "@/hooks/companies/useCompanyFilters";
import SectorEmissionsChart from "@/components/companies/sectors/charts/SectorEmissionsChart";
import EmissionsSourcesAnalysis from "./scopes/EmissionsSourcesAnlaysis";
import EmissionsTrendAnalysis from "./trends/EmissionsTrendAnalysis";

interface SectorGraphsProps {
  companies: RankedCompany[];
  selectedSectors?: CompanySector[];
}

const SectorGraphs: React.FC<SectorGraphsProps> = ({
  companies,
  selectedSectors = [],
}) => {
  // Convert selectedSectors to string[] for SectorEmissionsChart
  const sectorCodes = selectedSectors.filter((sector) => sector !== "all");
  const sectorNames = useSectorNames();

  return (
    <div className="bg-black">
      <div className="bg-black-2 rounded-lg border p-6">
        <SectorEmissionsChart
          companies={companies}
          selectedSectors={
            sectorCodes.length > 0
              ? sectorCodes
              : Object.keys(sectorNames).filter((key) => key !== "all")
          }
        />
      </div>

      <EmissionsTrendAnalysis
        companies={companies}
        selectedSectors={selectedSectors}
      />

      <EmissionsSourcesAnalysis
        companies={companies}
        selectedSectors={selectedSectors}
      />
    </div>
  );
};

export default SectorGraphs;
