import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useMunicipalityDetails } from "@/hooks/municipalities/useMunicipalityDetails";
import { useMunicipalityKpiCards } from "@/hooks/municipalities/useMunicipalityKpiCards";
import { transformEmissionsData } from "@/types/municipality";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { useHiddenItems } from "@/components/charts";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { useSectorYearSelection } from "@/hooks/territories/useSectorYearSelection";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { KpiComparisonSection } from "@/components/detail/KpiComparisonSection";
import { ComparisonDetailChip } from "@/components/compare/ComparisonDetailChip";
import { buildComparisonLinkTo } from "@/utils/compare/comparisonUtils";
import { TerritorySupplementalData } from "@/components/detail/TerritorySupplementalData";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useSectors } from "@/hooks/territories/useSectors";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import type { DataGuideItemId } from "@/data-guide/items";
import { Seo } from "@/components/SEO/Seo";
import { generateMunicipalitySeoMeta } from "@/utils/seo/entitySeo";
import { getSeoForRoute } from "@/seo/routes";
import { getEntityDetailPath } from "@/utils/routing";

function useMunicipalityPageData(id: string | undefined) {
  const { t } = useTranslation();
  const { municipality, loading, error } = useMunicipalityDetails(id || "");
  const { currentLanguage } = useLanguage();

  const { sectorEmissions, loading: _loadingSectors } = useSectorEmissions(
    "municipalities",
    id,
  );

  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);
  const lastYearEmissions = municipality?.emissions.at(-1);
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.value, currentLanguage)
    : t("noData");

  const emissionsData = municipality
    ? transformEmissionsData(municipality)
    : [];

  const { availableYears, currentYear } = useSectorYearSelection(
    sectorEmissions,
    lastYear,
  );

  return {
    t,
    municipality,
    loading,
    error,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    lastYear,
    lastYearEmissionsTon,
    emissionsData,
    availableYears,
    currentYear,
  };
}

const KPI_HELP_ITEMS: DataGuideItemId[] = [
  "onTrackForParis",
  "municipalityTotalEmissions",
  "detailWhyDataDelay",
  "municipalityDeeperChanges",
  "municipalityConsumptionEmissionPerPerson",
  "municipalityLocalVsConsumption",
  "municipalityClimatePlans",
  "municipalityProcurement",
  "municipalityElectricCarShare",
  "municipalityChargingPoints",
  "municipalityBicyclePaths",
];

export function MunicipalityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    t,
    municipality,
    loading,
    error,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    lastYear,
    lastYearEmissionsTon,
    emissionsData,
    availableYears,
    currentYear,
  } = useMunicipalityPageData(id);
  const kpiCards = useMunicipalityKpiCards(municipality);

  const seoMeta = useMemo(() => {
    if (!municipality) {
      return getSeoForRoute(location.pathname, { id: id || "" });
    }

    return generateMunicipalitySeoMeta(municipality, location.pathname, {
      lastYear,
      lastYearEmissionsTon,
    });
  }, [municipality, location.pathname, lastYear, lastYearEmissionsTon, id]);

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!municipality) return <PageNoData />;

  return (
    <>
      <Seo meta={seoMeta} />

      <DetailWrapper>
        <DetailHeader
          name={municipality.name}
          logoUrl={municipality.logoUrl}
          helpItems={KPI_HELP_ITEMS}
          stats={[]}
          headerChip={
            <ComparisonDetailChip
              linkTo={buildComparisonLinkTo("municipality", municipality.name)}
              variant="municipality"
              name={municipality.name}
            />
          }
          supplementalData={
            <TerritorySupplementalData
              region={municipality.region}
              regionLinkTo={
                municipality.region
                  ? getEntityDetailPath("region", municipality.region)
                  : undefined
              }
              politicalRule={municipality.politicalRule}
              politicalKSO={municipality.politicalKSO}
            />
          }
        >
          <KpiComparisonSection
            title={t("detailPage.kpiPlacement.municipalityTitle")}
            cards={kpiCards}
          />
        </DetailHeader>

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
    </>
  );
}
