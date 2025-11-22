import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMunicipalityDetails } from "@/hooks/municipalities/useMunicipalityDetails";
import { transformEmissionsData } from "@/types/municipality";
import { MunicipalitySection } from "@/components/municipalities/MunicipalitySection";
import { MunicipalityLinkCard } from "@/components/municipalities/MunicipalityLinkCard";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CardHeader } from "@/components/layout/CardHeader";
import {
  formatEmissionsAbsolute,
  formatPercent,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import MunicipalitySectorPieChart from "@/components/municipalities/sectorChart/MunicipalitySectorPieChart";
import MunicipalitySectorLegend from "@/components/municipalities/sectorChart/MunicipalitySectorLegend";
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
import { EntityDetailHeader } from "@/components/detail/EntityDetailHeader";
import { MunicipalityDetailSEO } from "@/components/municipalities/detail/MunicipalityDetailSEO";

export function MunicipalityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { municipality, loading, error } = useMunicipalityDetails(id || "");
  const { currentLanguage } = useLanguage();

  const { sectorEmissions, loading: _loadingSectors } =
    useMunicipalitySectorEmissions(id);

  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);

  const [selectedYear, setSelectedYear] = useState<string>("2023");

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!municipality) return <PageNoData />;

  const requirementsInProcurement = getProcurementRequirementsText(
    municipality.procurementScore,
    t,
  );

  const emissionsData = transformEmissionsData(municipality);

  const lastYearEmissions = municipality.emissions.at(-1);
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.value, currentLanguage)
    : t("noData");

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
      <div className="space-y-16 max-w-[1400px] mx-auto">
        <EntityDetailHeader
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
          stats={[
            {
              label: t("municipalityDetailPage.totalEmissions", {
                year: lastYear,
              }),
              value: lastYearEmissionsTon,
              unit: t("emissionsUnit"),
              valueClassName: "text-orange-2",
              info: true,
              infoText: t("municipalityDetailPage.totalEmissionsTooltip"),
            },
            {
              label: t("municipalityDetailPage.annualChangeSince2015"),
              value: formatPercentChange(
                municipality.historicalEmissionChangePercent,
                currentLanguage,
              ),
              valueClassName: cn(
                municipality.historicalEmissionChangePercent > 0
                  ? "text-pink-3"
                  : "text-orange-2",
              ),
            },
            {
              label: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
              value: localizeUnit(
                municipality.totalConsumptionEmission,
                currentLanguage,
              ),
              valueClassName: "text-orange-2",
              unit: t("emissionsUnit"),
            },
          ]}
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
              <MunicipalitySectorPieChart
                sectorEmissions={sectorEmissions}
                year={currentYear}
                filteredSectors={filteredSectors}
                onFilteredSectorsChange={setFilteredSectors}
              />
              {Object.keys(sectorEmissions.sectors[currentYear] || {}).length >
                0 && (
                <MunicipalitySectorLegend
                  data={Object.entries(
                    sectorEmissions.sectors[currentYear] || {},
                  ).map(([sector, value]) => ({
                    name: sector,
                    value,
                    color: "",
                  }))}
                  total={Object.values(
                    sectorEmissions.sectors[currentYear] || {},
                  ).reduce((sum, value) => sum + value, 0)}
                  filteredSectors={filteredSectors}
                  onFilteredSectorsChange={setFilteredSectors}
                />
              )}
            </div>
          </SectionWithHelp>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MunicipalityLinkCard
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
          <MunicipalityLinkCard
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

        <MunicipalitySection
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
      </div>
    </>
  );
}
