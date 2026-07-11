import { Navigate, useParams } from "react-router-dom";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { EuropeanCountryDetailHeader } from "@/components/europe/EuropeanCountryDetailHeader";
import { CountryEmissionSourcesMap } from "@/components/europe/CountryEmissionSourcesMap";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { useEuropeanCountryPageData } from "@/hooks/europe/useEuropeanCountryPageData";
import { useLanguage } from "@/components/LanguageProvider";
import {
  localizedPath,
  SWEDEN_ISO3,
  getNationDetailPath,
} from "@/utils/routing";

export function EuropeanCountryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useLanguage();
  const pageData = useEuropeanCountryPageData(id);
  const {
    country,
    loading,
    error,
    emissionsData,
    headerStats,
    sectorEmissions,
    countryGeoData,
    emissionSources,
    emissionSourcesLoading,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    availableYears,
    currentYear,
    lastYear,
  } = pageData;

  if (id?.toUpperCase() === SWEDEN_ISO3) {
    return (
      <Navigate
        to={localizedPath(
          currentLanguage,
          getNationDetailPath(currentLanguage),
        )}
        replace
      />
    );
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!country) return <PageNoData />;

  return (
    <DetailWrapper>
      <EuropeanCountryDetailHeader
        name={country.name}
        iso2={country.iso2}
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
        getSectorInfo={getSectorInfo}
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
    </DetailWrapper>
  );
}
