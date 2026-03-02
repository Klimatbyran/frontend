import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { useNationPageData } from "@/hooks/nation/useNationPageData";

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
  if (!nation) return <PageNoData />;
  return (
    <DetailWrapper>
      <DetailHeader
        name={nation.country}
        logoUrl={nation.logoUrl}
        helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
        stats={headerStats}
        translateNamespace="nation.detailPage"
      />
      <TerritoryEmissions
        emissionsData={emissionsData}
        sectorEmissions={sectorEmissions}
      />
      <SectorEmissionsChart
        sectorEmissions={sectorEmissions}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        currentYear={currentYear}
        getSectorInfo={getSectorInfo}
        filteredSectors={filteredSectors}
        onFilteredSectorsChange={setFilteredSectors}
        helpItems={["municipalityAndRegionEmissionSources"]}
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
