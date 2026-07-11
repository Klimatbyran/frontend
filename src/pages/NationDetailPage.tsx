import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { EntityListBox } from "@/components/detail/EntityListBox";
import { useNationPageData } from "@/hooks/nation/useNationPageData";
import { useLanguage } from "@/components/LanguageProvider";
import { EuropeanCountryDetailHeader } from "@/components/europe/EuropeanCountryDetailHeader";
import { CountryEmissionSourcesMap } from "@/components/europe/CountryEmissionSourcesMap";

function NationDetailContent({
  nation,
  sortedRegions,
  emissionsData,
  sectorEmissions,
  countryGeoData,
  emissionSources,
  emissionSourcesLoading,
  getSectorInfo,
  filteredSectors,
  setFilteredSectors,
  headerStats,
  availableYears,
  currentYear,
  lastYear,
}: ReturnType<typeof useNationPageData>) {
  const { currentLanguage } = useLanguage();
  if (!nation) return <PageNoData />;

  return (
    <DetailWrapper>
      <EuropeanCountryDetailHeader
        name={nation.country[currentLanguage]}
        iso2="SE"
        helpItems={["climateTraceCountryEmissions", "detailWhyDataDelay"]}
        stats={headerStats}
      />
      {lastYear && (
        <CountryEmissionSourcesMap
          countryGeoData={countryGeoData}
          sources={emissionSources}
          year={lastYear}
          loading={emissionSourcesLoading}
        />
      )}
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
