import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { useScopeData } from "@/hooks/companies/useScopeData";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import EmissionsTotalDisplay from "../charts/EmissionsTotalDisplay";
import ScopeCards from "./ScopeCards";
import { ScopeBreakdownChart } from "./ScopeBreakdownChart";
import { ScopeValueChainChart } from "./ScopeValueChainChart";
import ScopeModal from "./ScopeModal";

interface EmissionsSourcesAnalysisProps {
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const EmissionsSourcesAnalysis: React.FC<EmissionsSourcesAnalysisProps> = ({
  companies,
  selectedSectors,
  selectedYear,
  onYearChange,
}) => {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  const [selectedScope, setSelectedScope] = useState<
    "scope1" | "scope2" | "scope3_upstream" | "scope3_downstream" | null
  >(null);

  const effectiveSectors =
    selectedSectors.length > 0
      ? selectedSectors
      : Object.keys(sectorNames).filter((key) => key !== "all");

  const { scopeData, totalEmissions, years } = useScopeData(
    companies,
    effectiveSectors,
    selectedYear,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
        <EmissionsTotalDisplay
          totalEmissions={totalEmissions}
          selectedYear={selectedYear}
          years={years}
          onYearChange={onYearChange}
          isSectorView={effectiveSectors.length > 0}
          hideTotal
        />
      </div>

      <ScopeBreakdownChart
        scopeData={scopeData}
        totalEmissions={totalEmissions}
        onScopeSelect={setSelectedScope}
      />

      <ScopeValueChainChart
        scopeData={scopeData}
        totalEmissions={totalEmissions}
      />

      <ScopeCards
        scopeData={scopeData}
        totalEmissions={totalEmissions}
        companies={companies}
        selectedSectors={effectiveSectors}
        selectedYear={selectedYear}
        compact
        onScopeSelect={setSelectedScope}
      />

      {selectedScope && (
        <ScopeModal
          scope={selectedScope}
          title={
            selectedScope === "scope1"
              ? t("companyDetailPage.sectorGraphs.scope1")
              : selectedScope === "scope2"
                ? t("companyDetailPage.sectorGraphs.scope2")
                : selectedScope === "scope3_upstream"
                  ? t("companyDetailPage.sectorGraphs.scope3Upstream")
                  : t("companyDetailPage.sectorGraphs.scope3Downstream")
          }
          onClose={() => setSelectedScope(null)}
          companies={companies}
          selectedSectors={effectiveSectors}
          selectedYear={selectedYear}
        />
      )}
    </div>
  );
};

export default EmissionsSourcesAnalysis;
