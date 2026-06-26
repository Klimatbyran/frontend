import React from "react";
import { RankedCompany } from "@/types/company";
import type { CompanySector } from "@/lib/constants/sectors";
import { useTranslation } from "react-i18next";
import { useSectorNames } from "@/hooks/companies/useCompanySectors";
import SectorEmissionsChart from "@/components/companies/sectors/charts/SectorEmissionsChart";
import EmissionsTrendAnalysis from "./trends/EmissionsTrendAnalysis";
import EmissionsSourcesAnalysis from "./scopes/EmissionsSourcesAnlaysis";
import {
  SectorsPageNav,
  SectorSection,
  type SectorSectionId,
} from "./SectorsPageNav";

interface SectorGraphsProps {
  companies: RankedCompany[];
  selectedSectors?: CompanySector[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  activeSection: SectorSectionId;
  onSectionChange: (section: SectorSectionId) => void;
}

const SectorGraphs: React.FC<SectorGraphsProps> = ({
  companies,
  selectedSectors = [],
  selectedYear,
  onYearChange,
  activeSection,
  onSectionChange,
}) => {
  const sectorCodes = selectedSectors.filter((sector) => sector !== "all");
  const sectorNames = useSectorNames();
  const { t } = useTranslation();

  const effectiveSectors =
    sectorCodes.length > 0
      ? sectorCodes
      : Object.keys(sectorNames).filter((key) => key !== "all");

  return (
    <div className="space-y-6">
      <SectorsPageNav
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      <SectorSection
        id="distribution"
        title={t("sectorsOverviewPage.sections.distribution.title")}
        subtitle={t("sectorsOverviewPage.sections.distribution.subtitle")}
      >
        <SectorEmissionsChart
          companies={companies}
          selectedSectors={effectiveSectors}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      </SectorSection>

      <SectorSection
        id="trends"
        title={t("sectorsOverviewPage.sections.trends.title")}
        subtitle={t("sectorsOverviewPage.sections.trends.subtitle")}
      >
        <EmissionsTrendAnalysis
          companies={companies}
          selectedSectors={selectedSectors}
        />
      </SectorSection>

      <SectorSection
        id="sources"
        title={t("sectorsOverviewPage.sections.sources.title")}
        subtitle={t("sectorsOverviewPage.sections.sources.subtitle")}
      >
        <EmissionsSourcesAnalysis
          companies={companies}
          selectedSectors={selectedSectors}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      </SectorSection>
    </div>
  );
};

export default SectorGraphs;
