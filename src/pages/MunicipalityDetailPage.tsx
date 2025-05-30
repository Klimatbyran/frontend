import { useParams } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useMunicipalityDetails } from "@/hooks/useMunicipalityDetails";
import { transformEmissionsData } from "@/types/municipality";
import { MunicipalitySection } from "@/components/municipalities/MunicipalitySection";
import { MunicipalityStatCard } from "@/components/municipalities/MunicipalityStatCard";
import { MunicipalityLinkCard } from "@/components/municipalities/MunicipalityLinkCard";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useState } from "react";
import {
  formatEmissionsAbsolute,
  formatPercent,
  formatPercentChange,
  localizeUnit,
} from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import MunicipalitySectorPieChart from "@/components/municipalities/sectorChart/MunicipalitySectorPieChart";
import MunicipalitySectorLegend from "@/components/municipalities/sectorChart/MunicipalitySectorLegend";
import { useMunicipalitySectorEmissions } from "@/hooks/useMunicipalitySectorEmissions";
import { MunicipalityEmissions } from "@/components/municipalities/MunicipalityEmissions";
import { YearSelector } from "@/components/layout/YearSelector";

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
    address: {
      "@type": "PostalAddress",
      addressLocality: municipality.name,
      addressRegion: municipality.region,
      addressCountry: "SE",
    },
  };

  const evcp = municipality.electricVehiclePerChargePoints;

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      >
        <h1>
          {municipality.name} - {t("municipalityDetailPage.parisAgreement")}
        </h1>
        <p>
          {t("municipalityDetailPage.seoText.intro", {
            municipality: municipality.name,
            emissions: lastYearEmissionsTon,
            year: lastYear,
          })}
        </p>
        <h2>{t("municipalityDetailPage.seoText.emissionsHeading")}</h2>
        <p>
          {t("municipalityDetailPage.seoText.emissionsText", {
            municipality: municipality.name,
            reduction: municipality.neededEmissionChangePercent?.toFixed(1),
            budget: municipality.budget
              ? (municipality.budget / 1000).toFixed(1)
              : null,
          })}
        </p>
        <h2>{t("municipalityDetailPage.seoText.climateGoalsHeading")}</h2>
        <p>
          {t("municipalityDetailPage.seoText.climateGoalsText", {
            municipality: municipality.name,
            budgetRunsOut:
              municipality.budgetRunsOut ||
              t("municipalityDetailPage.budgetHolds"),
          })}
        </p>
        <h2>{t("municipalityDetailPage.seoText.consumptionHeading")}</h2>{" "}
        <p>
          {t("municipalityDetailPage.seoText.consumptionText", {
            municipality: municipality.name,
            consumption: municipality.totalConsumptionEmission.toFixed(1),
          })}
        </p>
        <h2>{t("municipalityDetailPage.seoText.transportHeading")}</h2>
        <p>
          {t("municipalityDetailPage.seoText.transportText", {
            municipality: municipality.name,
            bikeMeters: municipality.bicycleMetrePerCapita.toFixed(1),
            evGrowth: municipality.electricCarChangePercent.toFixed(1),
          })}
        </p>
      </PageSEO>

      <div className="space-y-16 max-w-[1400px] mx-auto">
        <div className="bg-black-2 rounded-level-1 p-8 md:p-16">
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
                  : municipality.budgetRunsOut.toString()
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
        </div>

        <MunicipalityEmissions
          municipality={municipality}
          emissionsData={emissionsData}
          sectorEmissions={sectorEmissions}
        />

        {sectorEmissions?.sectors && availableYears.length > 0 && (
          <div className={cn("bg-black-2 rounded-level-1 py-8 md:py-16")}>
            <div className="px-8 md:px-16">
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
                {Object.keys(sectorEmissions.sectors[currentYear] || {})
                  .length > 0 && (
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
            </div>
          </div>
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
        />
      </div>
    </>
  );
}
