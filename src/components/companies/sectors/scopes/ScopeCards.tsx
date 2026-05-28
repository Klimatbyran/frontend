import React, { useState } from "react";
import { Factory, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { ScopeData } from "@/hooks/companies/useScopeData";
import ScopeCard from "./ScopeCard";
import ScopeModal from "./ScopeModal";

interface ScopeCardsProps {
  scopeData: ScopeData;
  totalEmissions: number;
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear: string;
}

const ScopeCards: React.FC<ScopeCardsProps> = ({
  scopeData,
  totalEmissions,
  companies,
  selectedSectors,
  selectedYear,
}) => {
  const [selectedScope, setSelectedScope] = useState<
    "scope1" | "scope2" | "scope3_upstream" | "scope3_downstream" | null
  >(null);
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScopeCard
          title={t("companyDetailPage.sectorGraphs.scope1")}
          icon={Factory}
          value={scopeData.scope1.total}
          companies={scopeData.scope1.companies}
          color="bg-orange-3"
          percent={scopeData.scope1.total / totalEmissions}
          description={t("companyDetailPage.sectorGraphs.scope1Description")}
          setSelectedScope={setSelectedScope}
          scope="scope1"
        />
        <ScopeCard
          title={t("companyDetailPage.sectorGraphs.scope2")}
          icon={Building2}
          value={scopeData.scope2.total}
          companies={scopeData.scope2.companies}
          color="bg-pink-3"
          percent={scopeData.scope2.total / totalEmissions}
          description={t("companyDetailPage.sectorGraphs.scope2Description")}
          setSelectedScope={setSelectedScope}
          scope="scope2"
        />
        <ScopeCard
          title={t("companyDetailPage.sectorGraphs.scope3Upstream")}
          icon={ArrowUpRight}
          value={scopeData.scope3.upstream.total}
          companies={scopeData.scope3.upstream.companies}
          color="bg-blue-3"
          percent={scopeData.scope3.upstream.total / totalEmissions}
          description={t(
            "companyDetailPage.sectorGraphs.scope3UpstreamDescription",
          )}
          setSelectedScope={setSelectedScope}
          showCategoryInfo
          scope="scope3_upstream"
        />
        <ScopeCard
          title={t("companyDetailPage.sectorGraphs.scope3Downstream")}
          icon={ArrowDownRight}
          value={scopeData.scope3.downstream.total}
          companies={scopeData.scope3.downstream.companies}
          color="bg-green-3"
          percent={scopeData.scope3.downstream.total / totalEmissions}
          description={t(
            "companyDetailPage.sectorGraphs.scope3DownstreamDescription",
          )}
          setSelectedScope={setSelectedScope}
          scope="scope3_downstream"
          showCategoryInfo
        />
      </div>

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
          selectedSectors={selectedSectors}
          selectedYear={selectedYear}
        />
      )}
    </>
  );
};

export default ScopeCards;
