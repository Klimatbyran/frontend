import { Building2Icon, TreePineIcon } from "lucide-react";
import { RankedList, RankedListItem } from "@/components/RankedList";
import { ContentBlock } from "@/components/ContentBlock";
import { Typewriter } from "@/components/ui/typewriter";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/useMunicipalities";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/localizeUnit";
import GlobalSearch from "@/components/ui/globalsearch";

export function LandingPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const { getTopMunicipalities } = useMunicipalities();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare SEO data
  const canonicalUrl = "https://klimatkollen.se";
  const pageTitle = `Klimatkollen - ${t("landingPage.metaTitle")}`;
  const pageDescription = t("landingPage.metaDescription");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Klimatkollen",
    url: canonicalUrl,
    logo: "https://klimatkollen.se/images/social-picture.png",
    description: pageDescription,
  };

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

  const renderCompanyEmission = (item: RankedListItem) => (
    <div className="text-base sm:text-lg">
      <span className="md:text-right text-pink-3">
        {formatEmissionsAbsolute(item.value, currentLanguage)}
      </span>
      <span className="text-grey ml-2"> {t("emissionsUnit")}</span>
    </div>
  );

  const renderMunicipalityChangeRate = (item: RankedListItem) => (
    <span className="text-base sm:text-lg md:text-right text-green-3">
      {formatPercentChange(item.value, currentLanguage)}
    </span>
  );

  // Get municipality data for comparison
  // const municipalityComparisonData = getMunicipalitiesForMap(10).map(
  //   (municipality) => ({
  //     id: municipality.id,
  //     name: municipality.name,
  //     value: municipality.value,
  //     rank: "1",
  //     change: Math.random() > 0.5 ? 5.2 : -3.4, // Mock data - replace with real change values
  //   })
  // );

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
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

      {/* FIXME reintroduce at a later stage
      {selectedTab === "municipalities" && (
        <div className="py-16 md:py-24 bg-black-2">
          <div className="container mx-auto">
            <div className="max-w-lg md:max-w-[1200px] mx-auto">
              <MunicipalityComparison
                title="Hur går det med?"
                description="Vi utför mätningar av den samlade längden av cykelvägar per invånare, inklusive alla väghållare (statliga, kommunala och enskilda). Den senaste tillgängliga datan är från år 2022."
                nationalAverage={2.8}
                euTarget={3.8}
                unit="m"
                municipalities={municipalityComparisonData}
              />
            </div>
          </div>
        </div>
      )} */}

      <div className="py-8 pt-36 md:py-36">
        <div className="mx-2 sm:mx-8">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-8 md:mb-16">
            {t("landingPage.bestPerformers")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankedList
              title={t("landingPage.bestMunicipalities")}
              description={t("landingPage.municipalitiesDescription")}
              items={topMunicipalities}
              itemValueRenderer={renderMunicipalityChangeRate}
              icon={{ component: TreePineIcon, bgColor: "bg-[#FDE7CE]" }}
              rankColor="text-orange-2"
            />

            <RankedList
              title={t("landingPage.largestEmittor")}
              description={t("landingPage.companiesDescription")}
              items={largestCompanyEmitters}
              itemValueRenderer={renderCompanyEmission}
              icon={{ component: Building2Icon, bgColor: "bg-[#D4E7F7]" }}
              rankColor="text-blue-2"
            />
          </div>
        </div>
      </div>

      <div className="pb-8 md:pb-16">
        <div className="container mx-auto">
          <ContentBlock
            title={t("landingPage.aboutUsTitle")}
            content={t("landingPage.aboutUsContent")}
          />
        </div>
      </div>
    </>
  );
}
