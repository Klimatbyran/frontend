import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegionPageData } from "@/hooks/regions/useRegionPageData";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { KpiComparisonSection } from "@/components/detail/KpiComparisonSection";
import { ComparisonDetailChip } from "@/components/compare/ComparisonDetailChip";
import { buildComparisonLinkTo } from "@/utils/compare/comparisonUtils";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useRegionKpiCards } from "@/hooks/regions/useRegionKpiCards";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";

export function RegionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const {
    region,
    loading,
    error,
    regionMunicipalities,
    emissionsData,
    lastYear,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    availableYears,
    currentYear,
  } = useRegionPageData(id || "");
  const kpiCards = useRegionKpiCards(region, lastYear);

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!region) return <PageNoData />;

  return (
    <>
      <DetailWrapper>
        <DetailHeader
          name={region.name}
          logoUrl={region.logoUrl}
          helpItems={[]}
          stats={[]}
          headerChip={
            <ComparisonDetailChip
              linkTo={buildComparisonLinkTo("region", region.name)}
              variant="region"
              name={region.name}
            />
          }
        />

        <KpiComparisonSection
          title={t("detailPage.kpiPlacement.regionTitle")}
          helpItems={[
            "onTrackForParis",
            "regionTotalEmissions",
            "detailWhyDataDelay",
          ]}
          cards={kpiCards}
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
