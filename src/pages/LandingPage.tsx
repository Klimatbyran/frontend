import { Building2Icon, TreePineIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TopList, TopListItem } from "@/components/TopList";
import { ContentBlock } from "@/components/layout/ContentBlock";
import { Typewriter } from "@/components/ui/typewriter";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { Seo } from "@/components/SEO/Seo";
import { buildAbsoluteUrl } from "@/utils/seo";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import GlobalSearch from "@/components/ui/globalsearch";

export function LandingPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const { getTopMunicipalities } = useMunicipalities();
  const { currentLanguage } = useLanguage();

  // Prepare SEO data
  // Note: Site-wide Organization/WebSite schema is added by Layout component
  // No need to duplicate Organization schema here
  const canonicalUrl = buildAbsoluteUrl("/");
  const pageTitle = `Klimatkollen - ${t("landingPage.metaTitle")}`;
  const pageDescription = t("landingPage.metaDescription");

  const TypeWriterTexts = [
    t("landingPage.typewriter.reduceEmissions"),
    t("landingPage.typewriter.scope3Emissions"),
    t("landingPage.typewriter.meetParisAgreement"),
    t("landingPage.typewriter.climateActions"),
    t("landingPage.typewriter.climatePlans"),
  ];

  // Get top 5 companies by total emissions
  const largestCompanyEmitters = companies
    .sort(
      (a, b) =>
        (b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0) -
        (a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0),
    )
    .slice(0, 5)
    .map((company) => ({
      name: company.name,
      value:
        company.reportingPeriods.at(0)?.emissions?.calculatedTotalEmissions ||
        0,
      link: `/companies/${company.wikidataId}`,
    }));

  // Get top 5 municipalities by emissions reduction
  const topMunicipalities = getTopMunicipalities(5).map((municipality) => ({
    name: municipality.name,
    value: municipality.historicalEmissionChangePercent,
    link: `/municipalities/${municipality.name}`,
  }));

  const renderCompanyEmission = (item: TopListItem) => (
    <div className="text-base sm:text-lg">
      <span className="md:text-right text-pink-3">
        {formatEmissionsAbsolute(item.value, currentLanguage)}
      </span>
      <span className="text-grey ml-2"> {t("emissionsUnit")}</span>
    </div>
  );

  const renderMunicipalityChangeRate = (item: TopListItem) => (
    <span className="text-base sm:text-lg md:text-right text-green-3">
      {formatPercentChange(item.value, currentLanguage)}
    </span>
  );

  const seoMeta = {
    title: pageTitle,
    description: pageDescription,
    canonical: "/",
    og: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: pageTitle,
      description: pageDescription,
    },
  };

  return (
    <>
      <Seo meta={seoMeta} />
      <div className="flex flex-col">
        <div className="flex-1 flex flex-col items-center text-center px-4 py-14 md:py-24">
          <div className="max-w-lg md:max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-7xl font-light tracking-tight">
              {t("landingPage.title")}
            </h1>

            <div className="h-[80px] md:h-[120px] flex items-center justify-center text-4xl md:text-7xl font-light">
              <Typewriter
                text={TypeWriterTexts}
                speed={70}
                className="text-[#E2FF8D]"
                waitTime={2000}
                deleteSpeed={40}
                cursorChar="_"
              />
            </div>
          </div>

          <div className="flex flex-col items-center mt-16 gap-4 ">
            <GlobalSearch />
          </div>
        </div>
      </div>

      <div className="py-8 pt-36 md:py-36">
        <div className="mx-2 sm:mx-8">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-8 md:mb-16">
            {t("landingPage.bestPerformers")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopList
              title={t("landingPage.bestMunicipalities")}
              description={t("landingPage.municipalitiesDescription")}
              items={topMunicipalities}
              itemValueRenderer={renderMunicipalityChangeRate}
              icon={{ component: TreePineIcon, bgColor: "bg-[#FDE7CE]" }}
              rankColor="text-orange-2"
              headingLink={`${currentLanguage}/municipalities`}
            />

            <TopList
              title={t("landingPage.largestEmittor")}
              description={t("landingPage.companiesDescription")}
              items={largestCompanyEmitters}
              itemValueRenderer={renderCompanyEmission}
              icon={{ component: Building2Icon, bgColor: "bg-[#D4E7F7]" }}
              rankColor="text-blue-2"
              headingLink={`${currentLanguage}/companies`}
            />
          </div>
        </div>
      </div>

      <div className="pb-8 md:pb-16">
        <div className="mx-2 sm:mx-8">
          <ContentBlock
            title={t("landingPage.aboutUsTitle")}
            content={t("landingPage.aboutUsContent")}
          />
        </div>
      </div>
    </>
  );
}
