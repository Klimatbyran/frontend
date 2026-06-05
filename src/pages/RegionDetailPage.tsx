import { useParams } from "react-router-dom";
import { useRegionPageData } from "@/hooks/regions/useRegionPageData";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";

export function RegionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    region,
    loading,
    error,
    regionMunicipalities,
    emissionsData,
    headerStats,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    availableYears,
    currentYear,
  } = useRegionPageData(id || "");

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!region) return <PageNoData />;

  return (
    <>
      <DetailWrapper>
        <DetailHeader
          name={region.name}
          logoUrl={region.logoUrl}
          helpItems={["regionTotalEmissions", "detailWhyDataDelay"]}
          stats={headerStats}
          translateNamespace="regions.detailPage"
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
          items={regionMunicipalities}
          entityType="municipalities"
          translateNamespace="regions.detailPage"
        />
      </DetailWrapper>
    </>
  );
}
