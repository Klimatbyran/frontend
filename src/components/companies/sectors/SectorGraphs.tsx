import React from "react";
import { RankedCompany } from "@/types/company";
import type { CompanySector } from "@/lib/constants/sectors";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import SectorEmissionsChart from "@/components/companies/sectors/charts/SectorEmissionsChart";

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
    <div className="bg-black space-y-4">
      <SectorEmissionsChart
        companies={companies}
        selectedSectors={
          sectorCodes.length > 0
            ? sectorCodes
            : Object.keys(sectorNames).filter((key) => key !== "all")
        }
      />
    </div>
  );
};

export default SectorGraphs;
