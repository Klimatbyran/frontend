import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { useNationPageData } from "@/hooks/nation/useNationPageData";
import { useLanguage } from "@/components/LanguageProvider";

function NationDetailContent({
  nation,
  sortedRegions,
  emissionsData,
  headerStats,
}: ReturnType<typeof useNationPageData>) {
  const { currentLanguage } = useLanguage();
  if (!nation) return <PageNoData />;

  return (
    <DetailWrapper>
      <DetailHeader
        name={nation.country[currentLanguage]}
        logoUrl={nation.logoUrl}
        helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
        stats={headerStats}
        translateNamespace="nation.detailPage"
      />
      <TerritoryEmissions
        emissionsData={emissionsData}
        sectorEmissions={null}
        stackedOverview
      />
      <EntityListBox
        items={sortedRegions}
        entityType="regions"
        translateNamespace="nation.detailPage"
      />
    </DetailWrapper>
  );
}

export function NationDetailPage() {
  const pageData = useNationPageData();
  const { nation, loading, error } = pageData;

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!nation) return <PageNoData />;

  return <NationDetailContent {...pageData} />;
}
