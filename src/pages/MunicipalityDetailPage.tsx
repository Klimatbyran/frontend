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
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import { formatEmissionsAbsolute, localizeUnit } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";

export function MunicipalityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { municipality, loading, error } = useMunicipalityDetails(id || "");
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <Text>{t("municipalityDetailPage.loading")}</Text>;
  if (error) return <Text>{t("municipalityDetailPage.error")}</Text>;
  if (!municipality) return <Text>{t("municipalityDetailPage.noData")}</Text>;

  const requirementsInProcurement =
    municipality.procurementScore === "2"
      ? t("municipalityDetailPage.procurementScore.high")
      : municipality.procurementScore === "1"
        ? t("municipalityDetailPage.procurementScore.medium")
        : t("municipalityDetailPage.procurementScore.low");

  const emissionsData = transformEmissionsData(municipality);

  const lastYearEmissions = municipality.approximatedHistoricalEmission.at(-1);
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.value, currentLanguage)
    : "N/A";

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
            consumption: (municipality.totalConsumptionEmission / 1000).toFixed(
              1,
            ),
          })}
        </p>
        <h2>{t("municipalityDetailPage.seoText.transportHeading")}</h2>
        <p>
          {t("municipalityDetailPage.seoText.transportText", {
            municipality: municipality.name,
            bikeMeters: municipality.bicycleMetrePerCapita.toFixed(1),
            evGrowth: (municipality.electricCarChangePercent * 100).toFixed(1),
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
              unit={t("emissionsUnit")}
              valueClassName="text-orange-2"
            />
            <MunicipalityStatCard
              title={
                !municipality.budgetRunsOut
                  ? t("municipalityDetailPage.budgetRunsOut")
                  : t("municipalityDetailPage.budgetKept")
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
              <p className="my-4">
                Kommunens koldioxidbudget är slut och det finns därför ingen
                linje för Parisavtalet ovan.
              </p>
            )}
          </div>
          <div className="mt-8 mr-8">
            <MunicipalityEmissionsGraph projectedData={emissionsData} />
          </div>
        </div>

        <MunicipalitySection
          title={t("municipalityDetailPage.futureEmissions")}
          items={[
            {
              title: t("municipalityDetailPage.annualChangeSince2015"),
              value: `${localizeUnit(
                municipality.historicalEmissionChangePercent,
                currentLanguage,
              )}%`,
              valueClassName: "text-orange-2",
            },
            {
              title: t("municipalityDetailPage.reductionToMeetParis"),
              value: municipality.neededEmissionChangePercent
                ? `-${localizeUnit(
                    municipality.neededEmissionChangePercent,
                    currentLanguage,
                  )}%`
                : t("municipalityDetailPage.cannotReduceToParis"),
              valueClassName: municipality.neededEmissionChangePercent
                ? "text-green-3"
                : "text-pink-3",
            },
            {
              title: t("municipalityDetailPage.consumptionEmissionsPerCapita"),
              value: localizeUnit(
                municipality.totalConsumptionEmission / 1000,
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
              value: `${localizeUnit(
                municipality.electricCarChangePercent * 100,
                currentLanguage,
              )}%`,
              valueClassName: "text-orange-2",
            },
            {
              title: t("municipalityDetailPage.electricCarsPerChargePoint"),
              value: municipality.electricVehiclePerChargePoints
                ? localizeUnit(
                    municipality.electricVehiclePerChargePoints,
                    currentLanguage,
                  )
                : t("municipalityDetailPage.noChargePoints"),
              valueClassName: municipality.electricVehiclePerChargePoints
                ? "text-green-3"
                : "text-pink-3",
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
