import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/hooks/companies/useCompanies";
import { useScopeData } from "@/hooks/companies/useScopeData";
import { useScreenSize } from "@/hooks/useScreenSize";
import ScopeCards from "./ScopeCards";
import ValueChainOverview from "./ValueChainOverview";
import KeyInsights from "./KeyInsights";
import EmissionsTotalDisplay from "../charts/EmissionsTotalDisplay";
import { useSectorNames } from "@/hooks/companies/useCompanyFilters";

interface EmissionsSourcesAnalysisProps {
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear?: string;
}

const EmissionsSourcesAnalysis: React.FC<EmissionsSourcesAnalysisProps> = ({
  companies,
  selectedSectors,
  selectedYear: initialYear = "2023",
}) => {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const sectorNames = useSectorNames();

  const [selectedYear, setSelectedYear] = useState<string>("2023");

  // If no sectors are selected, use all sectors except "all"
  const effectiveSectors =
    selectedSectors.length > 0
      ? selectedSectors
      : Object.keys(sectorNames).filter((key) => key !== "all");

  const { scopeData, totalEmissions, years } = useScopeData(
    companies,
    effectiveSectors,
    selectedYear,
  )

  // Generate years array from 2020 to current year
  return (
    <div className="mt-12 space-y-6">
      <div
        className={`${
          screenSize.isMobile
            ? "flex flex-col gap-1"
            : "flex items-center justify-between"
        }`}
      >
        <div
          className={`${
            screenSize.isMobile ? "flex flex-col gap-1" : "flex items-center gap-2"
          }`}
        >
          <h2 className="text-xl font-light text-white">
            {t("companiesPage.sectorGraphs.emissionsSourcesAnalysis")}
          </h2>
          <span className="text-sm text-grey">
            {t("companiesPage.sectorGraphs.ghgProtocolScopes")}
          </span>
        </div>
        <EmissionsTotalDisplay
          totalEmissions={totalEmissions}
          selectedYear={selectedYear}
          years={years}
          onYearChange={setSelectedYear}
          isSectorView={effectiveSectors.length > 0}
        />
      </div>

      <ScopeCards
        scopeData={scopeData}
        totalEmissions={totalEmissions}
        companies={companies}
        selectedSectors={effectiveSectors}
        selectedYear={selectedYear}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ValueChainOverview />
        <KeyInsights scopeData={scopeData} totalEmissions={totalEmissions} />
      </div>

      {/* Commented out for now as it's not complete */}
      {/* <Scope3Breakdown
        companies={companies}
        selectedSectors={selectedSectors}
        selectedYear={selectedYear}
      /> */}
    </div>
  );
};

export default EmissionsSourcesAnalysis;
