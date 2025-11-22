import { useParams } from "react-router-dom";
import { useMunicipalityDetails } from "@/hooks/municipalities/useMunicipalityDetails";
import { useMunicipalityDetailHeaderStats } from "@/hooks/municipalities/useMunicipalityDetails";
import { transformEmissionsData } from "@/types/municipality";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CardHeader } from "@/components/layout/CardHeader";
import {
  formatEmissionsAbsolute,
  formatPercent,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import SectorPieChart from "@/components/detail/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/detail/sectorChart/SectorPieLegend";
import { useMunicipalitySectorEmissions } from "@/hooks/municipalities/useMunicipalitySectorEmissions";
import { MunicipalityEmissions } from "@/components/municipalities/MunicipalityEmissions";
import { useHiddenItems } from "@/components/charts";
import { YearSelector } from "@/components/layout/YearSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import {
  getAvailableYearsFromSectors,
  getCurrentYearFromAvailable,
} from "@/utils/detail/sectorYearUtils";
import { getProcurementRequirementsText } from "@/utils/municipality/procurement";
import { MunicipalityDetailSEO } from "@/components/municipalities/detail/MunicipalityDetailSEO";
import { LinkCard } from "@/components/detail/LinkCard";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailSection } from "@/components/detail/DetailSection";
import { DetailWrapper } from "@/components/detail/DetailWrapper";
import { useMunicipalitySectors } from "@/hooks/municipalities/useMunicipalitySectors";

export function MunicipalityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { municipality, loading, error } = useMunicipalityDetails(id || "");
  const { currentLanguage } = useLanguage();

  const { sectorEmissions, loading: _loadingSectors } =
    useMunicipalitySectorEmissions(id);

  const { getSectorInfo } = useMunicipalitySectors();
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

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!municipality) return <PageNoData />;

  const requirementsInProcurement = getProcurementRequirementsText(
    municipality.procurementScore,
    t,
  );

  const emissionsData = transformEmissionsData(municipality);

  const availableYears = getAvailableYearsFromSectors(sectorEmissions);

  const currentYear = getCurrentYearFromAvailable(
    selectedYear,
    availableYears,
    2023,
  );

  const evcp = municipality.electricVehiclePerChargePoints;

  return (
    <>
      <MunicipalityDetailSEO
        id={id || ""}
        municipality={municipality}
        lastYearEmissionsTon={lastYearEmissionsTon}
        lastYear={lastYear}
      />
      <DetailWrapper>
        <DetailHeader
          name={municipality.name}
          subtitle={municipality.region}
          logoUrl={municipality.logoUrl}
          politicalRule={municipality.politicalRule}
          helpItems={[
            "municipalityTotalEmissions",
            "municipalityWhyDataDelay",
            "municipalityDeeperChanges",
            "municipalityConsumptionEmissionPerPerson",
            "municipalityLocalVsConsumption",
          ]}
          stats={headerStats}
          translateNamespace="municipalityDetailPage"
        />

        <MunicipalityEmissions
          emissionsData={emissionsData}
          sectorEmissions={sectorEmissions}
        />

        {sectorEmissions?.sectors && availableYears.length > 0 && (
          <SectionWithHelp helpItems={["municipalityEmissionSources"]}>
            <CardHeader
              title={t("municipalityDetailPage.sectorEmissions")}
              description={t("municipalityDetailPage.sectorEmissionsYear", {
                year: currentYear,
              })}
              customDataViewSelector={
                <YearSelector
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                  availableYears={availableYears}
                  translateNamespace="municipalityDetailPage"
                />
              }
              className="gap-8 md:gap-16"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
              <SectorPieChart
                sectorEmissions={sectorEmissions}
                year={currentYear}
                getSectorInfo={getSectorInfo}
                filteredSectors={filteredSectors}
                onFilteredSectorsChange={setFilteredSectors}
              />
              {Object.keys(sectorEmissions.sectors[currentYear] || {}).length >
                0 && (
                <SectorPieLegend
                  data={Object.entries(
                    (sectorEmissions.sectors[currentYear] || {}) as Record<
                      string,
                      number
                    >,
                  ).map(([sector, value]) => ({
                    name: sector,
                    value,
                    color: "",
                  }))}
                  total={Object.values(
                    (sectorEmissions.sectors[currentYear] || {}) as Record<
                      string,
                      number
                    >,
                  ).reduce((sum, value) => sum + value, 0)}
                  getSectorInfo={getSectorInfo}
                  filteredSectors={filteredSectors}
                  onFilteredSectorsChange={setFilteredSectors}
                />
              )}
            </div>
          </SectionWithHelp>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>

        <DetailSection
          title={t("municipalityDetailPage.sustainableTransport")}
          items={[
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
              valueClassName:
                evcp && evcp > 10 ? "text-pink-3" : "text-green-3",
            },
            {
              title: t("municipalityDetailPage.bicycleMetrePerCapita"),
              value: localizeUnit(
                municipality.bicycleMetrePerCapita,
                currentLanguage,
              ),
              valueClassName: "text-orange-2",
            },
          ]}
          helpItems={[
            "municipalityClimatePlans",
            "municipalityProcurement",
            "municipalityElectricCarShare",
            "municipalityChargingPoints",
            "municipalityBicyclePaths",
          ]}
        />
      </DetailWrapper>
    </>
  );
}
