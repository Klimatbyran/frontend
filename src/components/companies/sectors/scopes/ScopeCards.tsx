import React from "react";
import { Factory, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { ScopeData } from "@/hooks/companies/useScopeData";
import ScopeCard from "./ScopeCard";

type ScopeKey =
  | "scope1"
  | "scope2"
  | "scope3_upstream"
  | "scope3_downstream";

interface ScopeCardsProps {
  scopeData: ScopeData;
  totalEmissions: number;
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear: string;
  compact?: boolean;
  onScopeSelect?: (scope: ScopeKey) => void;
}

const ScopeCards: React.FC<ScopeCardsProps> = ({
  scopeData,
  totalEmissions,
  companies,
  selectedSectors,
  selectedYear,
  compact = false,
  onScopeSelect,
}) => {
  const { t } = useTranslation();

  const cards = [
    {
      scope: "scope1" as const,
      title: t("companyDetailPage.sectorGraphs.scope1"),
      icon: Factory,
      value: scopeData.scope1.total,
      companies: scopeData.scope1.companies,
      color: "bg-orange-3",
      percent: scopeData.scope1.total / totalEmissions,
      description: t("companyDetailPage.sectorGraphs.scope1Description"),
    },
    {
      scope: "scope2" as const,
      title: t("companyDetailPage.sectorGraphs.scope2"),
      icon: Building2,
      value: scopeData.scope2.total,
      companies: scopeData.scope2.companies,
      color: "bg-pink-3",
      percent: scopeData.scope2.total / totalEmissions,
      description: t("companyDetailPage.sectorGraphs.scope2Description"),
    },
    {
      scope: "scope3_upstream" as const,
      title: t("companyDetailPage.sectorGraphs.scope3Upstream"),
      icon: ArrowUpRight,
      value: scopeData.scope3.upstream.total,
      companies: scopeData.scope3.upstream.companies,
      color: "bg-blue-3",
      percent: scopeData.scope3.upstream.total / totalEmissions,
      description: t("companyDetailPage.sectorGraphs.scope3UpstreamDescription"),
      showCategoryInfo: true,
    },
    {
      scope: "scope3_downstream" as const,
      title: t("companyDetailPage.sectorGraphs.scope3Downstream"),
      icon: ArrowDownRight,
      value: scopeData.scope3.downstream.total,
      companies: scopeData.scope3.downstream.companies,
      color: "bg-green-3",
      percent: scopeData.scope3.downstream.total / totalEmissions,
      description: t(
        "companyDetailPage.sectorGraphs.scope3DownstreamDescription",
      ),
      showCategoryInfo: true,
    },
  ];

  if (compact) {
    return (
      <details className="group">
        <summary className="cursor-pointer text-sm text-grey hover:text-white transition-colors list-none flex items-center gap-2">
          <span className="group-open:rotate-90 transition-transform">▸</span>
          {t("sectorsOverviewPage.scopeDetailsToggle")}
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {cards.map((card) => (
            <ScopeCard
              key={card.scope}
              {...card}
              compact
              setSelectedScope={(scope) => {
                if (scope && onScopeSelect) onScopeSelect(scope);
              }}
            />
          ))}
        </div>
      </details>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <ScopeCard
            key={card.scope}
            {...card}
            setSelectedScope={(scope) => {
              if (scope && onScopeSelect) onScopeSelect(scope);
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ScopeCards;
