import { useParams } from "react-router-dom";
import { useRegionPageData } from "@/hooks/regions/useRegionPageData";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { ComparisonDetailChip } from "@/components/compare/ComparisonDetailChip";
import { buildComparisonLinkTo } from "@/utils/compare/comparisonUtils";
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
          headerChip={
            <ComparisonDetailChip
              linkTo={buildComparisonLinkTo("region", region.name)}
              variant="region"
              name={region.name}
            />
          }
        />

        <TerritoryEmissions
          emissionsData={emissionsData}
          sectorEmissions={sectorEmissions}
        />

        <SectorEmissionsChart
          sectorEmissions={sectorEmissions}
          availableYears={availableYears}
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
