import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import { useNationPageData } from "@/hooks/nation/useNationPageData";
import { useLanguage } from "@/components/LanguageProvider";
import { EuropeanCountryDetailHeader } from "@/components/europe/EuropeanCountryDetailHeader";
import { CountryEmissionSourcesMap } from "@/components/europe/CountryEmissionSourcesMap";
import {
  createEntityClickHandler,
  getNationDetailPath,
  getNationUrlSlug,
  isNationUrlSlug,
  localizedPath,
} from "@/utils/routing";
import { resolveRegionFromMapName } from "@/utils/regionUtils";
import type { FeatureCollection } from "geojson";
import regionGeoJson from "@/data/regionGeo.json";

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
  const navigate = useNavigate();
  if (!nation) return <PageNoData />;

  const navigateToRegion = createEntityClickHandler(navigate, "region");
  const handleRegionSelect = (regionMapName: string) => {
    const region = resolveRegionFromMapName(
      regionMapName,
      sortedRegions.map((name) => ({ name })),
    );
    navigateToRegion(region?.name ?? regionMapName);
  };

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
          regionsGeoData={regionGeoJson as FeatureCollection}
          sources={emissionSources}
          year={lastYear}
          loading={emissionSourcesLoading}
          onRegionSelect={handleRegionSelect}
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
    </DetailWrapper>
  );
}

export function NationDetailRoute() {
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const slug = location.pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.toLowerCase();
  const expectedSlug = getNationUrlSlug(currentLanguage);

  if (
    slug === "nation" ||
    (slug && isNationUrlSlug(slug) && slug !== expectedSlug)
  ) {
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

  return <NationDetailPage />;
}

export function NationDetailPage() {
  const pageData = useNationPageData();
  const { nation, loading, error } = pageData;

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!nation) return <PageNoData />;

  return <NationDetailContent {...pageData} />;
}
