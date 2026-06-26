import { useParams } from "react-router-dom";
import { useRegionPageData } from "@/hooks/regions/useRegionPageData";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { ComparisonDetailChip } from "@/components/compare/ComparisonDetailChip";
import { buildComparisonLinkTo } from "@/utils/compare/comparisonUtils";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { TerritoryDetailCore } from "@/components/territories/TerritoryDetailCore";

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
          headerChip={
            <ComparisonDetailChip
              linkTo={buildComparisonLinkTo("region", region.name)}
              variant="region"
              name={region.name}
            />
          }
        />

        <TerritoryDetailCore
          entityType="region"
          entityId={region.name}
          entityName={region.name}
          emissionsData={emissionsData}
          sectorEmissions={sectorEmissions}
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          currentYear={currentYear}
          getSectorInfo={getSectorInfo}
          filteredSectors={filteredSectors}
          onFilteredSectorsChange={setFilteredSectors}
          entityValueOverrides={{
            historicalEmissionChangePercent:
              region.historicalEmissionChangePercent,
          }}
        >
          <EntityListBox
            items={regionMunicipalities}
            entityType="municipalities"
            translateNamespace="regions.detailPage"
          />
        </TerritoryDetailCore>
      </DetailWrapper>
    </>
  );
}
