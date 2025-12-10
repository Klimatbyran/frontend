import React from "react";
import { RankedCompany } from "@/types/company";
import type { CompanySector } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
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
    <div className="bg-black light:bg-white">
      <div className="bg-black-2 light:bg-grey/10 rounded-lg border border-transparent light:border-grey/20 p-6">
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
