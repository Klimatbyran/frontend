import React from "react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/hooks/companies/useCompanies";
import { useScopeData } from "@/hooks/companies/useScopeData";
import { useScreenSize } from "@/hooks/useScreenSize";
import ScopeCards from "./ScopeCards";
import ValueChainOverview from "./ValueChainOverview";
import KeyInsights from "./KeyInsights";

interface EmissionsSourcesAnalysisProps {
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear?: string;
}

const EmissionsSourcesAnalysis: React.FC<EmissionsSourcesAnalysisProps> = ({
  companies,
  selectedSectors,
  selectedYear = "2023",
}) => {
  const { scopeData, totalEmissions } = useScopeData(
    companies,
    selectedSectors,
    selectedYear,
  );
  const isMobile = useScreenSize();
  const { t } = useTranslation();

  return (
    <div className="mt-12 space-y-6">
      <div
        className={`${
          isMobile ? "flex flex-col gap-1" : "flex items-center justify-between"
        }`}
      >
        <div
          className={`${
            isMobile ? "flex flex-col gap-1" : "flex items-center gap-2"
          }`}
        >
          <h2 className="text-xl font-light text-white">
            {t("companiesPage.sectorGraphs.emissionsSourcesAnalysis")}
          </h2>
          <span className="text-sm text-grey">
            {t("companiesPage.sectorGraphs.ghgProtocolScopes")}
          </span>
        </div>
        <div className={`${isMobile ? "mt-2" : ""} text-right`}>
          <div className="text-sm text-grey">
            {t("companiesPage.sectorGraphs.totalEmissions")}
          </div>
          <div className="text-2xl font-light text-white">
            {totalEmissions.toLocaleString()} tCO₂e
          </div>
        </div>
      </div>

      <ScopeCards
        scopeData={scopeData}
        totalEmissions={totalEmissions}
        companies={companies}
        selectedSectors={selectedSectors}
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
