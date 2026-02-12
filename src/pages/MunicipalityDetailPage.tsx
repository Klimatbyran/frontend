import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import type { TFunction } from "i18next";
import {
  useMunicipalityDetails,
  useMunicipalityDetailHeaderStats,
} from "@/hooks/municipalities/useMunicipalityDetails";
import { Municipality, transformEmissionsData } from "@/types/municipality";
import {
  formatEmissionsAbsolute,
  formatPercent,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { TerritoryEmissions } from "@/components/territories/TerritoryEmissions";
import { useHiddenItems } from "@/components/charts";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import {
  getAvailableYearsFromSectors,
  getCurrentYearFromAvailable,
} from "@/utils/detail/sectorYearUtils";
import { getProcurementRequirementsText } from "@/utils/municipality/procurement";
import { LinkCard } from "@/components/detail/DetailLinkCard";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailSection } from "@/components/detail/DetailSection";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useSectors } from "@/hooks/territories/useSectors";
import { DetailLinkCardGrid } from "@/components/detail/DetailGrid";
import { SectorEmissionsChart } from "@/components/charts/sectorChart/SectorEmissions";
import type { SupportedLanguage } from "@/lib/languageDetection";
import type { DataGuideItemId } from "@/data-guide/items";
import { Seo } from "@/components/SEO/Seo";
import { generateMunicipalitySeoMeta } from "@/utils/seo/entitySeo";
import { getSeoForRoute } from "@/seo/routes";

function MunicipalityLinkCards({
  municipality,
  requirementsInProcurement,
  t,
}: {
  municipality: Municipality;
  requirementsInProcurement: string;
  t: TFunction;
}) {
  return (
    <DetailLinkCardGrid>
      <LinkCard
        title={t("municipalityDetailPage.climatePlan")}
        description={
          municipality.climatePlanYear
            ? t("municipalityDetailPage.adopted", {
                year: municipality.climatePlanYear,
              })
            : t("municipalityDetailPage.noClimatePlan")
        }
        link={
          municipality.climatePlanLink
            ? municipality.climatePlanLink
            : undefined
        }
        descriptionClassName={
          municipality.climatePlanYear ? "text-green-3" : "text-pink-3"
        }
      />
      <LinkCard
        title={t("municipalityDetailPage.procurementRequirements")}
        description={requirementsInProcurement}
        link={municipality.procurementLink || undefined}
        descriptionClassName={
          municipality.procurementScore === 2
            ? "text-green-3"
            : municipality.procurementScore === 1
              ? "text-orange-2"
              : "text-pink-3"
        }
      />
    </DetailLinkCardGrid>
  );
}

function getSustainableTransportItems(
  municipality: Municipality,
  currentLanguage: SupportedLanguage,
  t: TFunction,
) {
  const evcp = municipality.electricVehiclePerChargePoints;
  return [
    {
      title: t("municipalityDetailPage.electricCarChange"),
      value: `${formatPercent(
        municipality.electricCarChangePercent,
        currentLanguage,
        true,
      )}`,
      valueClassName: "text-orange-2",
    },
    {
      title: t("municipalityDetailPage.electricCarsPerChargePoint"),
      value: evcp
        ? localizeUnit(evcp, currentLanguage)
        : t("municipalityDetailPage.noChargePoints"),
      valueClassName: evcp && evcp > 10 ? "text-pink-3" : "text-green-3",
    },
    {
      title: t("municipalityDetailPage.bicycleMetrePerCapita"),
      value: localizeUnit(municipality.bicycleMetrePerCapita, currentLanguage),
      valueClassName: "text-orange-2",
    },
  ];
}

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
  const [selectedYear, setSelectedYear] = useState<string>("2023");

  const lastYearEmissions = municipality?.emissions.at(-1);
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.value, currentLanguage)
    : t("noData");

  const headerStats = useMunicipalityDetailHeaderStats(
    municipality,
    lastYear,
    lastYearEmissionsTon,
  );

  const requirementsInProcurement = municipality
    ? getProcurementRequirementsText(municipality.procurementScore, t)
    : "";

  const emissionsData = municipality
    ? transformEmissionsData(municipality)
    : [];

  const availableYears = getAvailableYearsFromSectors(sectorEmissions);
  const currentYear = getCurrentYearFromAvailable(
    selectedYear,
    availableYears,
    lastYear,
  );

  return {
    t,
    municipality,
    loading,
    error,
    currentLanguage,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    lastYear,
    lastYearEmissionsTon,
    headerStats,
    requirementsInProcurement,
    emissionsData,
    availableYears,
    currentYear,
  };
}

const HEADER_HELP_ITEMS: DataGuideItemId[] = [
  "municipalityTotalEmissions",
  "detailWhyDataDelay",
  "municipalityDeeperChanges",
  "municipalityConsumptionEmissionPerPerson",
  "municipalityLocalVsConsumption",
];

const SUSTAINABLE_TRANSPORT_HELP_ITEMS: DataGuideItemId[] = [
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
    currentLanguage,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    lastYear,
    lastYearEmissionsTon,
    headerStats,
    requirementsInProcurement,
    emissionsData,
    availableYears,
    currentYear,
  } = useMunicipalityPageData(id);

  // Generate data-driven SEO meta (memoized to prevent re-renders)
  const seoMeta = useMemo(() => {
    if (!municipality) {
      // Fallback to route-level SEO when data not available
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
      {/* Only render SEO when data is available, otherwise Layout will use route-level SEO */}
      {municipality && <Seo meta={seoMeta} />}

      <DetailWrapper>
        <DetailHeader
          name={municipality.name}
          subtitle={municipality.region}
          logoUrl={municipality.logoUrl}
          politicalRule={municipality.politicalRule}
          politicalKSO={municipality.politicalKSO}
          politicalXSOLabelKey="politicalKSO"
          helpItems={HEADER_HELP_ITEMS}
          stats={headerStats}
          translateNamespace="municipalityDetailPage"
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
          helpItems={["municipalityEmissionSources"]}
        />

        <MunicipalityLinkCards
          municipality={municipality}
          requirementsInProcurement={requirementsInProcurement}
          t={t}
        />

        <DetailSection
          title={t("municipalityDetailPage.sustainableTransport")}
          items={getSustainableTransportItems(municipality, currentLanguage, t)}
          helpItems={SUSTAINABLE_TRANSPORT_HELP_ITEMS}
        />
      </DetailWrapper>
    </>
  );
}
