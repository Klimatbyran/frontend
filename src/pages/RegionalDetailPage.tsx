import { useParams } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useRegionalData } from "@/hooks/useRegionalData";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useState } from "react";
import { CardHeader } from "@/components/layout/CardHeader";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { YearSelector } from "@/components/layout/YearSelector";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import RegionalSectorPieChart from "@/components/regions/sectorChart/RegionalSectorPieChart";
import RegionalSectorLegend from "@/components/regions/sectorChart/RegionalSectorLegend";
import { useHiddenItems } from "@/components/charts";
import { RegionalSection } from "@/components/regions/RegionalSection";
import { RegionalEmissions } from "@/components/regions/RegionalEmissions";
import { DetailStatCard } from "@/components/detailPages/DetailStatCard";

export function RegionalDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const regionalDataHook = useRegionalData();
  const { currentLanguage } = useLanguage();

  // Get region name from URL param
  const regionName = id ? id.charAt(0).toUpperCase() + id.slice(1) : "";

  // Get years and emissions data
  const years = regionalDataHook.getYears(regionName);
  const emissionsData = regionalDataHook.getTotalEmissions(regionName);

  // State for sector chart filtering
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);

  // State for year selection
  const [selectedYear, setSelectedYear] = useState<string>(
    years.length > 0 ? years[years.length - 1].toString() : "2023",
  );

  // Get sector data for the selected year
  const sectorData = regionalDataHook.getSectorEmissions(
    regionName,
    parseInt(selectedYear),
  );

  if (!regionName || years.length === 0) {
    return (
      <Text>
        {t("regionalDetailPage.noData", "No data available for this region.")}
      </Text>
    );
  }

  // Get latest emission data
  const latestEmissionsData = emissionsData[emissionsData.length - 1];
  const latestYear = latestEmissionsData?.year;
  const latestEmissions = latestEmissionsData
    ? formatEmissionsAbsolute(latestEmissionsData.emissions, currentLanguage)
    : "N/A";

  // Calculate emissions change (if we have at least 2 years of data)
  const emissionChangePercent =
    emissionsData.length >= 2
      ? (emissionsData[emissionsData.length - 1].emissions /
          emissionsData[0].emissions -
          1) *
        100
      : 0;

  // Available years for the sector chart
  const availableYears = years.filter(
    (year) => regionalDataHook.getSectorEmissions(regionName, year)?.length > 0,
  );

  // Use the first available year as default if selectedYear is not in availableYears
  const currentYear =
    availableYears.length > 0 && availableYears.includes(parseInt(selectedYear))
      ? parseInt(selectedYear)
      : availableYears[0] || latestYear || 2023;

  // Prepare SEO data
  const canonicalUrl = `https://klimatkollen.se/regions/${id}`;
  const pageTitle = `${regionName} - ${t(
    "regionalDetailPage.metaTitle",
    "Regional Climate Data",
  )} - Klimatkollen`;
  const pageDescription = t(
    "regionalDetailPage.metaDescription",
    "Climate data for {{region}} with total emissions of {{emissions}} for {{year}}.",
    {
      region: regionName,
      emissions: latestEmissions,
      year: latestYear,
    },
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: regionName,
    description: pageDescription,
    address: {
      "@type": "PostalAddress",
      addressRegion: regionName,
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
          {regionName} - {t("regionalDetailPage.climate", "Climate")}
        </h1>
        <p>
          {t(
            "regionalDetailPage.seoText.intro",
            "{{region}} region with total emissions of {{emissions}} for {{year}}.",
            {
              region: regionName,
              emissions: latestEmissions,
              year: latestYear,
            },
          )}
        </p>
        <h2>{t("regionalDetailPage.seoText.emissionsHeading", "Emissions")}</h2>
        <h2>
          {t("regionalDetailPage.seoText.sectorsHeading", "Emission Sectors")}
        </h2>
      </PageSEO>

      <div className="space-y-16 max-w-[1400px] mx-auto">
        <SectionWithHelp
          helpItems={
            [
              // "regionalTotalEmissions",
              // "regionalDataDelay",
              // "regionalChangeOverTime",
            ]
          }
        >
          <Text className="text-4xl md:text-8xl">{regionName}</Text>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mt-8">
            <DetailStatCard
              title={t("regionalDetailPage.totalEmissions", {
                year: latestYear,
              })}
              value={latestEmissions}
              unit={t("emissionsUnit")}
              valueClassName="text-orange-2"
            />
          </div>
        </SectionWithHelp>

        {/* <RegionalEmissions
          emissionsData={emissionsData.map((data) => ({
            year: data.year,
            value: data.emissions,
          }))}
        /> */}

        {/* {sectorData && sectorData.length > 0 && availableYears.length > 0 && (
          <SectionWithHelp helpItems={["regionalEmissionSources"]}>
            <CardHeader
              title={t(
                "regionalDetailPage.sectorEmissions",
                "Sector Emissions",
              )}
              description={t(
                "regionalDetailPage.sectorEmissionsYear",
                "Emissions by sector for {{year}}",
                {
                  year: currentYear,
                },
              )}
              customDataViewSelector={
                <YearSelector
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                  availableYears={availableYears.map(String)}
                  translateNamespace="regionalDetailPage"
                />
              }
              className="p-4 md:p-6"
            /> */}

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <RegionalSectorPieChart
                sectorData={
                  regionalDataHook.getSectorEmissions(
                    regionName,
                    currentYear,
                  ) || []
                }
                filteredSectors={filteredSectors}
                onFilteredSectorsChange={setFilteredSectors}
              />
              <RegionalSectorLegend
                sectorData={
                  regionalDataHook.getSectorEmissions(
                    regionName,
                    currentYear,
                  ) || []
                }
                filteredSectors={filteredSectors}
                onFilteredSectorsChange={setFilteredSectors}
              />
            </div>
          </SectionWithHelp>
        )} */}

        {/* <RegionalSection
          title={t(
            "regionalDetailPage.regionalSubsectors",
            "Regional Subsectors",
          )}
          subsectorData={
            regionalDataHook.getAllSubsectorEmissions(
              regionName,
              currentYear,
            ) || []
          }
          helpItems={["regionalSubsectorDetails", "regionalSubsectorChanges"]}
        /> */}
      </div>
    </>
  );
}
