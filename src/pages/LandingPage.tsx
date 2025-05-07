import { useRef, useState } from "react";
import { ArrowRight, Building2Icon, TreePineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { BaseCompany } from "@/types/company";

export function LandingPage() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("companies");
  const { companies } = useCompanies();
  const { municipalities } = useMunicipalities();
  /*   const savedMunicipalities = useRef(null)
   */ const { getTopMunicipalities } = useMunicipalities();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {});

  useEffect(() => {
    setSearchResult(
      companies?.filter((company: BaseCompany): BaseCompany => {
        return company.name.toLowerCase().includes(searchQuery.toLowerCase());
      }),
    );
  }, [searchQuery]);

  console.log(municipalities);

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

  const companyTypewriterTexts = [
    t("landingPage.typewriter.company.reduceEmissions"),
    t("landingPage.typewriter.company.scope3Emissions"),
    t("landingPage.typewriter.company.meetParisAgreement"),
  ];

  const municipalityTypewriterTexts = [
    t("landingPage.typewriter.municipality.reduceEmissions"),
    t("landingPage.typewriter.municipality.meetParisAgreement"),
    t("landingPage.typewriter.municipality.climateActions"),
    t("landingPage.typewriter.municipality.climatePlans"),
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
    value: municipality.historicalEmissionChangePercent / 100,
    link: `/municipalities/${municipality.name}`,
  }));

  const renderCompanyEmission = (item: RankedListItem) => (
    <>
      <span className="text-base md:text-lg md:text-right text-pink-3">
        {formatEmissionsAbsolute(item.value, currentLanguage)}
      </span>
      <span className="text-grey ml-2"> {t("emissionsUnit")}</span>
    </>
  );

  const renderMunicipalityChangeRate = (item: RankedListItem) => (
    <span className="text-base md:text-lg md:text-right text-green-3">
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
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
          <div className="max-w-lg md:max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-7xl font-light tracking-tight">
              {t("landingPage.title", {
                tabName: t(`landingPage.tabName.${selectedTab}`),
              })}
            </h1>

            <div className="h-[80px] md:h-[120px] flex items-center justify-center text-4xl md:text-7xl font-light">
              <Typewriter
                text={
                  selectedTab === "companies"
                    ? companyTypewriterTexts
                    : municipalityTypewriterTexts
                }
                speed={70}
                className="text-[#E2FF8D]"
                waitTime={2000}
                deleteSpeed={40}
                cursorChar="_"
              />
            </div>
          </div>

          <div className="flex flex-col items-center mt-4 gap-4 ">
            <label for="landingInput" className="text-xl mt-10">
              Find a company or municipality
            </label>
            <div className="flex flex-col gap-2 w-[300px]">
              <div className="flex flex-row gap-2">
                <Input
                  id="landingInput"
                  type="text"
                  placeholder="e.g Alfa Laval"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black-1 h-[40px] rounded-md px-4 text-base text-lg focus:outline-white font-medium focus:ring-1 focus:ring-blue-2 relative w-full text-center "
                />
                <Button
                  className="rounded-full w-[36px] h-[36px] px-2 py-0 text-base md:text-md font-bold bg-white text-black hover:bg-white/90"
                  asChild
                >
                  <a href={`/companies/${searchResult?.wikidataId}`}>
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
              <div
                className={`${searchQuery === "" ? "hidden" : "flex-col"} max-h-[300px] min-w-[300px] max-w-[300px] mt-2 overflow-y-scroll relative bg-[#121212] rounded-xl`}
              >
                {searchResult &&
                  searchResult.map((company) => {
                    return (
                      <section className="flex flex-col  p-2 justify-center">
                        <a
                          href={`/companies/${company?.wikidataId}`}
                          className="text-left text-lg font-md mt-4 max-w-[300px]"
                        >
                          {company?.name}
                        </a>
                      </section>
                    );
                  })}
              </div>
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

        <div className="py-48 md:py-24">
          <div className="container mx-auto">
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
      </div>
    </>
  );
}
