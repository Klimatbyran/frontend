import { useParams } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useMunicipalityDetails } from "@/hooks/municipalities/useMunicipalityDetails";
import { transformEmissionsData } from "@/types/municipality";
import { MunicipalitySection } from "@/components/municipalities/MunicipalitySection";
import { MunicipalityStatCard } from "@/components/municipalities/MunicipalityStatCard";
import { MunicipalityLinkCard } from "@/components/municipalities/MunicipalityLinkCard";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/PageSEO";
import { useState } from "react";
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
import { YearSelector } from "@/components/layout/YearSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

export function MunicipalityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { municipality, loading, error } = useMunicipalityDetails(id || "");
  const { currentLanguage } = useLanguage();

  const { sectorEmissions, loading: _loadingSectors } =
    useMunicipalitySectorEmissions(id);
  const [filteredSectors, setFilteredSectors] = useState<Set<string>>(
    new Set(),
  );
  const [selectedYear, setSelectedYear] = useState<string>("2023");

  if (loading) return <Text>{t("municipalityDetailPage.loading")}</Text>;
  if (error) return <Text>{t("municipalityDetailPage.error")}</Text>;
  if (!municipality) return <Text>{t("municipalityDetailPage.noData")}</Text>;

  const meetsParis = !municipality.budgetRunsOut && municipality.budget;

  const requirementsInProcurement =
    municipality.procurementScore === "2"
      ? t("municipalityDetailPage.procurementScore.high")
      : municipality.procurementScore === "1"
        ? t("municipalityDetailPage.procurementScore.medium")
        : t("municipalityDetailPage.procurementScore.low");

  const emissionsData = transformEmissionsData(municipality);

  const lastYearEmissions = municipality.emissions.at(-1);
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.value, currentLanguage)
    : "N/A";

  // Get available years for the sector emissions
  const availableYears = sectorEmissions?.sectors
    ? Object.keys(sectorEmissions.sectors)
        .map(Number)
        .filter(
          (year) =>
            !isNaN(year) &&
            Object.keys(sectorEmissions.sectors[year] || {}).length > 0,
        )
        .sort((a, b) => b - a)
    : [];

  // Use the first available year as default if selectedYear is not in availableYears
  const currentYear = availableYears.includes(parseInt(selectedYear))
    ? parseInt(selectedYear)
    : availableYears[0] || 2023;

  // Prepare SEO data
  const canonicalUrl = `https://klimatkollen.se/municipalities/${id}`;
  const pageTitle = `${municipality.name} - ${t(
    "municipalityDetailPage.metaTitle",
  )} - Klimatkollen`;
  const pageDescription = t("municipalityDetailPage.metaDescription", {
    municipality: municipality.name,
    emissions: lastYearEmissionsTon,
    year: lastYear,
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: `${municipality.name} kommun`,
    description: pageDescription,
    url: canonicalUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: municipality.name,
      addressRegion: municipality.region,
      addressCountry: "SE",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Total Emissions",
        value: `${lastYearEmissionsTon} ${t("emissionsUnitCO2")}`,
        unitText: t("emissionsUnitCO2"),
        valueReference: {
          "@type": "QuantitativeValue",
          value: lastYearEmissions?.value || 0,
          unitText: t("emissionsUnitCO2"),
        },
      },
      {
        "@type": "PropertyValue",
        name: "Emissions Year",
        value: lastYear?.toString() || "N/A",
      },
      {
        "@type": "PropertyValue",
        name: "Carbon Budget Status",
        value: !municipality.budgetRunsOut
          ? t("municipalityDetailPage.budgetHolds")
          : new Date(municipality.budgetRunsOut) > new Date()
            ? t("municipalityDetailPage.budgetRunsOut")
            : t("municipalityDetailPage.budgetRanOut"),
      },
      {
        "@type": "PropertyValue",
        name: "Budget Expiry Date",
        value: municipality.budgetRunsOut
          ? new Date(municipality.budgetRunsOut).toISOString().split("T")[0]
          : "N/A",
      },
      {
        "@type": "PropertyValue",
        name: "Net Zero Target",
        value: municipality.hitNetZero
          ? new Date(municipality.hitNetZero).toISOString().split("T")[0]
          : t("municipalityDetailPage.never"),
      },
      {
        "@type": "PropertyValue",
        name: "Climate Plan Status",
        value: municipality.climatePlanYear
          ? t("municipalityDetailPage.adopted", {
              year: municipality.climatePlanYear,
            })
          : t("municipalityDetailPage.noClimatePlan"),
      },
      {
        "@type": "PropertyValue",
        name: "Procurement Requirements",
        value: requirementsInProcurement,
      },
      {
        "@type": "PropertyValue",
        name: "Bicycle Infrastructure",
        value: `${municipality.bicycleMetrePerCapita.toFixed(1)} ${t("municipalityDetailPage.bicycleMetrePerCapita")}`,
        unitText: "meters per capita",
      },
      {
        "@type": "PropertyValue",
        name: "Electric Vehicle Growth",
        value: `${municipality.electricCarChangePercent.toFixed(1)}%`,
        unitText: "percentage change",
      },
      {
        "@type": "PropertyValue",
        name: "Consumption Emissions",
        value: `${municipality.totalConsumptionEmission.toFixed(1)} ${t("emissionsUnitCO2")}`,
        unitText: t("emissionsUnitCO2"),
      },
      {
        "@type": "PropertyValue",
        name: "Emissions Reduction Target",
        value: `${municipality.neededEmissionChangePercent?.toFixed(1)}% reduction needed`,
        description: t("municipalityDetailPage.reductionToMeetParis", {
          municipality: municipality.name,
          reduction: municipality.neededEmissionChangePercent?.toFixed(1),
        }),
      },
      {
        "@type": "PropertyValue",
        name: "Sustainable Transport Infrastructure",
        value: "Available",
        description: t("municipalityDetailPage.sustainableTransport"),
      },
      {
        "@type": "PropertyValue",
        name: "Climate Plan Status",
        value: municipality.climatePlanYear
          ? `Adopted in ${municipality.climatePlanYear}`
          : "No climate plan adopted",
        description: municipality.climatePlanYear
          ? t("municipalityDetailPage.climatePlan")
          : t("municipalityDetailPage.noClimatePlan"),
      },
    ],
  };

  const evcp = municipality.electricVehiclePerChargePoints;

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />

      <div className="space-y-16 max-w-[1400px] mx-auto">
        <SectionWithHelp
          helpItems={[
            "municipalityTotalEmissions",
            "municipalityEmissionEstimatations",
            "municipalityWhyDataDelay",
            "municipalityCarbonBudgetExpiryDate",
            "municipalityHowCarbonBudgetWasCalculated",
            "municipalityWhatIsCarbonBudget",
            "municipalityPredicatedNetZeroDate",
            "municipalityWhenCarbonBudgetRunsOut",
            "municipalityDeeperChanges",
            "municipalityCanWeExtendCarbonBudget",
          ]}
        >
          <Text className="text-4xl md:text-8xl">{municipality.name}</Text>
          <Text className="text-grey">{municipality.region}</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 mt-8">
            <MunicipalityStatCard
              title={t("municipalityDetailPage.totalEmissions", {
                year: lastYear,
              })}
              value={lastYearEmissionsTon}
              unit={t("emissionsUnitCO2")}
              valueClassName="text-orange-2"
              info={true}
              infoText={t("municipalityDetailPage.totalEmissionsTooltip")}
            />
            <MunicipalityStatCard
              title={
                !municipality.budgetRunsOut
                  ? t("municipalityDetailPage.budgetKept")
                  : new Date(municipality.budgetRunsOut) > new Date()
                    ? t("municipalityDetailPage.budgetRunsOut")
                    : t("municipalityDetailPage.budgetRanOut")
              }
              value={
                !municipality.budgetRunsOut
                  ? t("municipalityDetailPage.budgetHolds")
                  : localizeUnit(
                      new Date(municipality.budgetRunsOut),
                      currentLanguage,
                    )
              }
              valueClassName={
                !municipality.budgetRunsOut ? "text-green-3" : "text-pink-3"
              }
            />
            <MunicipalityStatCard
              title={t("municipalityDetailPage.hitNetZero")}
              value={
                municipality.hitNetZero
                  ? localizeUnit(
                      new Date(municipality.hitNetZero),
                      currentLanguage,
                    ) || t("municipalityDetailPage.never")
                  : t("municipalityDetailPage.never")
              }
              valueClassName={cn(
                !municipality.hitNetZero ||
                  new Date(municipality.hitNetZero) > new Date("2050-01-01")
                  ? "text-pink-3"
                  : "text-green-3",
              )}
            />
          </div>
        </SectionWithHelp>

        <MunicipalityEmissions
          municipality={municipality}
          emissionsData={emissionsData}
          sectorEmissions={sectorEmissions}
        />

        {sectorEmissions?.sectors && availableYears.length > 0 && (
          <SectionWithHelp helpItems={["municipalityEmissionSources"]}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <Text className="text-2xl md:text-4xl">
                {t("municipalityDetailPage.sectorEmissions")}
              </Text>

              <YearSelector
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
                translateNamespace="municipalityDetailPage"
              />
            </div>

            <Text className="text-grey">
              {t("municipalityDetailPage.sectorEmissionsYear", {
                year: currentYear,
              })}
            </Text>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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

        <MunicipalitySection
          title={t("municipalityDetailPage.futureEmissions")}
          items={[
            {
              title: t("municipalityDetailPage.annualChangeSince2015"),
              value: `${formatPercentChange(
                municipality.historicalEmissionChangePercent,
                currentLanguage,
              )}`,
              valueClassName: cn(
                municipality.historicalEmissionChangePercent > 0
                  ? "text-pink-3"
                  : "text-orange-2",
              ),
            },
            {
              title: t("municipalityDetailPage.reductionToMeetParis"),
              value: municipality.neededEmissionChangePercent
                ? `${formatPercentChange(
                    -municipality.neededEmissionChangePercent,
                    currentLanguage,
                  )}`
                : t("municipalityDetailPage.cannotReduceToParis"),
              valueClassName: meetsParis ? "text-green-3" : "text-pink-3",
            },
            {
              title: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
              value: localizeUnit(
                municipality.totalConsumptionEmission,
                currentLanguage,
              ),
              valueClassName: "text-orange-2",
            },
          ]}
          helpItems={[
            "municipalityDeeperChanges",
            "municipalityReductionNeededForParisAgreement",
            "municipalityConsumptionEmissionPerPerson",
            "municipalityLocalVsConsumption",
          ]}
        />

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
              municipality.procurementScore === "2"
                ? "text-green-3"
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
