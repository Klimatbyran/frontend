import { useParams } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { DetailStatCard } from "@/components/detailPages/DetailStatCard";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { useRegions } from "@/hooks/useRegions";

export function RegionalDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { regionsData, loading, error } = useRegions();
  const { currentLanguage } = useLanguage();

  if (loading) return <PageLoading />;
  if (error) return <PageError />;

  const region = regionsData.find(
    (r) => r.name.toLowerCase() === id?.toLowerCase(),
  );

  if (!region) return <PageNoData />;

  const years = Object.keys(region.emissions || {})
    .filter((key) => !isNaN(Number(key)))
    .map((year) => Number(year))
    .sort((a, b) => a - b);

  const latestYear = years[years.length - 1];
  const latestYearEmissions = region.emissions?.[latestYear?.toString()] || 0;
  const latestYearEmissionsTon = formatEmissionsAbsolute(
    latestYearEmissions / 1000,
    currentLanguage,
  );

  const canonicalUrl = `https://klimatkollen.se/regions/${id}`;
  const pageTitle = `${region.name} - ${t("regionalDetailPage.metaTitle")} - Klimatkollen`;
  const pageDescription = t("regionalDetailPage.metaDescription", {
    region: region.name,
    emissions: latestYearEmissionsTon,
    year: latestYear,
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${region.name} län`,
    description: pageDescription,
    address: {
      "@type": "PostalAddress",
      addressRegion: region.name,
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
          {region.name} - {t("regionalDetailPage.parisAgreement")}
        </h1>
        <p>
          {t("regionalDetailPage.seoText.intro", {
            region: region.name,
            emissions: latestYearEmissionsTon,
            year: latestYear,
          })}
        </p>
      </PageSEO>

      <div className="space-y-16 max-w-[1400px] mx-auto">
        <SectionWithHelp helpItems={[]}>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <Text className="text-4xl md:text-8xl">{region.name}</Text>
              <Text className="text-grey text-sm md:text-base lg:text-lg">
                {t("regionalDetailPage.region")}
              </Text>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 mt-8">
            <DetailStatCard
              title={t("regionalDetailPage.totalEmissions", {
                year: latestYear,
              })}
              value={latestYearEmissionsTon}
              unit={t("emissionsUnit")}
              valueClassName="text-orange-2"
              info={true}
              infoText={t("regionalDetailPage.totalEmissionsTooltip")}
            />
          </div>
        </SectionWithHelp>
      </div>
    </>
  );
}
