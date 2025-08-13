import { useParams } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useMunicipalityDetails } from "@/hooks/useMunicipalityDetails";
import { transformEmissionsData } from "@/types/municipality";
import { MunicipalityEmissionsGraph } from "@/components/municipalities/MunicipalityEmissionsGraph";
import { MunicipalitySection } from "@/components/municipalities/MunicipalitySection";
import { MunicipalityStatCard } from "@/components/municipalities/MunicipalityStatCard";
import { MunicipalityLinkCard } from "@/components/municipalities/MunicipalityLinkCard";
import { useTranslation } from "react-i18next";
import { useConfig } from "vike-react/useConfig";
import { useState, useEffect } from "react";
import {
  formatEmissionsAbsolute,
  formatPercent,
  formatPercentChange,
  localizeUnit,
} from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";
import MunicipalitySectorPieChart from "@/components/municipalities/MunicipalitySectorPieChart";
import MunicipalitySectorLegend from "@/components/municipalities/MunicipalitySectorLegend";
import { useMunicipalitySectorEmissions } from "@/hooks/useMunicipalitySectorEmissions";

export function MunicipalityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { municipality, loading, error } = useMunicipalityDetails(id || "");
  const { currentLanguage } = useLanguage();
  const config = useConfig();

  const { sectorEmissions, loading: _loadingSectors } =
    useMunicipalitySectorEmissions(id);
  const [filteredSectors, setFilteredSectors] = useState<Set<string>>(
    new Set(),
  );

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

  const evcp = municipality.electricVehiclePerChargePoints;

  useEffect(() => {
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

    config({
      title: pageTitle,
      description: pageDescription,
      Head: () => (
        <>
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content="/images/social-picture.png" />
          <link rel="canonical" href={canonicalUrl} />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </>
      ),
    });
  }, [municipality, lastYearEmissionsTon, lastYear, t, id, config]);

  return (
    <>
      {/* Hidden SEO content for search engines */}
      <div className="sr-only">
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
        <h2>{t("municipalityDetailPage.seoText.consumptionHeading")}</h2>
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
      </div>

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
              unit={t("emissionsUnit")}
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

        <div className={cn("bg-black-2 rounded-level-1 py-8 md:py-16")}>
          <div className="px-8 md:px-16">
            <Text className="text-2xl md:text-4xl">
              {t("municipalityDetailPage.emissionsDevelopment")}
            </Text>
            <Text className="text-grey">
              {t("municipalityDetailPage.inTons")}
            </Text>
            {!municipality.neededEmissionChangePercent && (
              <p className="my-4">{t("municipalityDetailPage.noParisPath")}</p>
            )}
          </div>
          <div className="mt-8 mr-8">
            <MunicipalityEmissionsGraph
              projectedData={emissionsData}
              sectorEmissions={sectorEmissions || undefined}
            />
          </div>
        </div>

        {sectorEmissions?.sectors && sectorEmissions.sectors[2023] && (
          <div className={cn("bg-black-2 rounded-level-1 py-8 md:py-16")}>
            <div className="px-8 md:px-16">
              <Text className="text-2xl md:text-4xl">
                {t("municipalityDetailPage.sectorEmissions")}
              </Text>
              <Text className="text-grey">
                {t("municipalityDetailPage.sectorEmissionsYear", {
                  year: 2023,
                })}
              </Text>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <MunicipalitySectorPieChart
                  sectorEmissions={sectorEmissions}
                  year={2023}
                  filteredSectors={filteredSectors}
                  onFilteredSectorsChange={setFilteredSectors}
                />
                {Object.keys(sectorEmissions.sectors[2023]).length > 0 && (
                  <MunicipalitySectorLegend
                    data={Object.entries(sectorEmissions.sectors[2023]).map(
                      ([sector, value]) => ({
                        name: sector,
                        value,
                        color: "",
                      }),
                    )}
                    total={Object.values(sectorEmissions.sectors[2023]).reduce(
                      (sum, value) => sum + value,
                      0,
                    )}
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
