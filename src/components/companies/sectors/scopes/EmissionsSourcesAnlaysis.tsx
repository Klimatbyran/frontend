import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { extractYears } from "@/hooks/companies/useChartData";
import { useScopeData } from "@/hooks/companies/useScopeData";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import ScopeCards from "./ScopeCards";
import ValueChainOverview from "./ValueChainOverview";
import KeyInsights from "./KeyInsights";

interface EmissionsSourcesAnalysisProps {
  companies: RankedCompany[];
  selectedSectors: string[];
}

const EmissionsSourcesAnalysis: React.FC<EmissionsSourcesAnalysisProps> = ({
  companies,
  selectedSectors,
}) => {
  const { t } = useTranslation();
  const screenSize = useScreenSize();
  const sectorNames = useSectorNames();

  // If no sectors are selected, use all sectors except "all"
  const effectiveSectors =
    selectedSectors.length > 0
      ? selectedSectors
      : Object.keys(sectorNames).filter((key) => key !== "all");

  const latestYear = useMemo(() => {
    const years = extractYears(companies);
    return years.length > 0 ? years[years.length - 1] : "2024";
  }, [companies]);

  const { scopeData, totalEmissions } = useScopeData(
    companies,
    effectiveSectors,
    latestYear,
  );
  return (
    <div className="mt-12 space-y-6">
      <div
        className={`flex ${
          screenSize.isMobile ? "flex-col gap-1" : "items-center gap-2"
        }`}
      >
        <h2 className="text-xl font-light text-white">
          {t("companyDetailPage.sectorGraphs.emissionsSourcesAnalysis")}
        </h2>
        <span className="text-sm text-grey">
          {t("companyDetailPage.sectorGraphs.ghgProtocolScopes")}
        </span>
      </div>

      <ScopeCards
        scopeData={scopeData}
        totalEmissions={totalEmissions}
        companies={companies}
        selectedSectors={effectiveSectors}
        selectedYear={latestYear}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ValueChainOverview />
        <KeyInsights scopeData={scopeData} totalEmissions={totalEmissions} />
      </div>

      {/* Commented out for now as it's not complete */}
      {/* <Scope3Breakdown
        companies={companies}
        selectedSectors={selectedSectors}
        selectedYear={latestYear}
      /> */}
    </div>
  );
};

export default EmissionsSourcesAnalysis;
