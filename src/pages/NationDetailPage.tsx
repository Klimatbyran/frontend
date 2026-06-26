import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { useNationPageData } from "@/hooks/nation/useNationPageData";
import { useLanguage } from "@/components/LanguageProvider";
import { TerritoryDetailCore } from "@/components/territories/TerritoryDetailCore";

function NationDetailContent({
  nation,
  sortedRegions,
  emissionsData,
  sectorEmissions,
  getSectorInfo,
  filteredSectors,
  setFilteredSectors,
  selectedYear,
  setSelectedYear,
  headerStats,
  availableYears,
  currentYear,
}: ReturnType<typeof useNationPageData>) {
  const { currentLanguage } = useLanguage();
  if (!nation) return <PageNoData />;

  const nationName = nation.country[currentLanguage];

  return (
    <DetailWrapper>
      <DetailHeader
        name={nationName}
        logoUrl={nation.logoUrl}
        helpItems={["nationTotalEmissions", "detailWhyDataDelay"]}
        stats={headerStats}
      />

      <TerritoryDetailCore
        entityType="nation"
        entityId={nationName}
        entityName={nationName}
        emissionsData={emissionsData}
        sectorEmissions={sectorEmissions}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        currentYear={currentYear}
        getSectorInfo={getSectorInfo}
        filteredSectors={filteredSectors}
        onFilteredSectorsChange={setFilteredSectors}
      >
        <EntityListBox
          items={sortedRegions}
          entityType="regions"
          translateNamespace="nation.detailPage"
        />
      </TerritoryDetailCore>
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
