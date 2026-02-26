import { useCallback, useEffect, useRef, useState } from "react";
import { Building2Icon, ChevronDown, TreePineIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TopList, TopListItem } from "@/components/TopList";
import { ContentBlock } from "@/components/layout/ContentBlock";
import { Typewriter } from "@/components/ui/typewriter";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";
import { SCROLL_FADE_THRESHOLD } from "@/hooks/landing/useLandingPageData";
import useThrottle from "@/hooks/useThrottle";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { SCROLL_THROTTLE_DELAY } from "@/lib/constants/landingPage";

export function LandingPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const { getTopMunicipalities } = useMunicipalities();
  const { currentLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fadeChevron, setFadeChevron] = useState(false);

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

  const handleChevronClick = useCallback(() => {
    const element = containerRef.current;
    if (element) {
      window.scrollTo({ top: element.offsetTop, behavior: "smooth" });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (window.scrollY > SCROLL_FADE_THRESHOLD) {
      setFadeChevron(true);
    } else {
      setFadeChevron(false);
    }
  }, [SCROLL_FADE_THRESHOLD]);

  const throttledScroll = useThrottle(handleScroll, SCROLL_THROTTLE_DELAY);

  useEffect(() => {
    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [throttledScroll]);

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="flex flex-col h-screen items-center">
        <div className="flex-1 flex flex-col items-center text-center px-4 py-44 md:py-56">
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
        </div>
        <ChevronDown
          onClick={handleChevronClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleChevronClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={t("landingPage.scrollToContent", "Scroll to content")}
          className={`${fadeChevron ? "opacity-0 " : "opacity-50"} mb-32 cursor-pointer animate-bounce animati transition-opacity ease-in duration-750`}
        />
      </div>

      <div ref={containerRef} className="pb-20 md:pb-28">
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
