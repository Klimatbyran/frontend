import { useParams } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useMunicipalityDetails } from "@/hooks/municipalities/useMunicipalityDetails";
import { transformEmissionsData } from "@/types/municipality";
import { MunicipalitySection } from "@/components/municipalities/MunicipalitySection";
import { MunicipalityStatCard } from "@/components/municipalities/MunicipalityStatCard";
import { MunicipalityLinkCard } from "@/components/municipalities/MunicipalityLinkCard";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
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

  const requirementsInProcurement =
    municipality.procurementScore == 2
      ? t("municipalityDetailPage.procurementScore.high")
      : municipality.procurementScore == 1
        ? t("municipalityDetailPage.procurementScore.medium")
        : t("municipalityDetailPage.procurementScore.low");

  const emissionsData = transformEmissionsData(municipality);

  const lastYearEmissions = municipality.emissions.at(-1);
  const lastYear = lastYearEmissions?.year;
  const lastYearEmissionsTon = lastYearEmissions
    ? formatEmissionsAbsolute(lastYearEmissions.value, currentLanguage)
    : "N/A";

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
  const currentYear =
    availableYears.length > 0 && availableYears.includes(parseInt(selectedYear))
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

  interface PoliticalRuleLabelProps {
    src: string;
    alt: string;
    fallback: string;
  }

  // Will return either an image from src or a fallback string if image doesnt exist
  const PoliticalRuleLabel = ({ src, alt, fallback }: PoliticalRuleLabelProps) => {
  const [error, setError] = useState(false);

  const onError = () => {
    setError(true);
  };

  return error ? fallback : <img src={src} alt={alt} onError={onError} className="h-[20px] md:h-[25px] inline" />;
};

  // Gets all the poltical parties labels depending on availablity
  const getPoliticalRuleLabels = (politicalParty: string) => {
    const imgSrc = `/logos/politicalParties/${politicalParty}.png`;

    return (
        <PoliticalRuleLabel
        src={imgSrc}
        alt={politicalParty}
        fallback={politicalParty}
      />
    );
  }

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
        <h2>{t("municipalityDetailPage.seoText.climateGoalsHeading")}</h2>
        <p>
          {t("municipalityDetailPage.seoText.climateGoalsText", {
            municipality: municipality.name,
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
        <SectionWithHelp
          helpItems={[
            "municipalityTotalEmissions",
            "municipalityWhyDataDelay",
            "municipalityDeeperChanges",
            "municipalityConsumptionEmissionPerPerson",
            "municipalityLocalVsConsumption",
          ]}
        >
          <div className="flex justify-between ">
            <div className="flex flex-col">
              <Text className="text-4xl md:text-8xl">{municipality.name}</Text>
              <Text className="text-grey text-sm md:text-base lg:text-lg">
                {municipality.region}
              </Text>
            </div>
            {municipality.logoUrl && (
              <img
                src={municipality.logoUrl}
                alt="logo"
                className="h-[50px] md:h-[80px]"
              />
            )}
          </div>
          <div className="flex flex-row items-center gap-2 my-4">
            <Text
              variant="body"
              className="text-grey text-sm md:text-base lg:text-lg"
            >
              {t("municipalityDetailPage.politicalRule")}:
            </Text>
            <Text variant="body" className="text-sm md:text-base lg:text-lg">
              {municipality.politicalRule.map((p, index) => {
                return <span key={index}>{ index ? ", " : "" }{getPoliticalRuleLabels(p)}</span>;
              })}
            </Text>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 mt-8">
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
              title={t("municipalityDetailPage.annualChangeSince2015")}
              value={formatPercentChange(
                municipality.historicalEmissionChangePercent,
                currentLanguage,
              )}
              valueClassName={cn(
                municipality.historicalEmissionChangePercent > 0
                  ? "text-pink-3"
                  : "text-orange-2",
              )}
            />
            <MunicipalityStatCard
              title={t("municipalityDetailPage.consumptionEmissionsPerCapita")}
              value={localizeUnit(
                municipality.totalConsumptionEmission,
                currentLanguage,
              )}
              valueClassName="text-orange-2"
              unit={t("emissionsUnit")}
            />
          </div>
        </SectionWithHelp>

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
