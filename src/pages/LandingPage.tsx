import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Typewriter } from "@/components/ui/typewriter";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { PageSEO } from "@/components/SEO/PageSEO";
import { SCROLL_FADE_THRESHOLD } from "@/hooks/landing/useLandingPageData";
import useThrottle from "@/hooks/useThrottle";
import { SCROLL_THROTTLE_DELAY } from "@/lib/constants/landingPage";
import { LandingPageCTA } from "@/components/landing/LandingPageCTA";
import { CompaniesSection } from "@/components/landing/CompaniesSection";
import { MunicipalitiesSection } from "@/components/landing/MunicipalitiesSection";
import { CountriesSection } from "@/components/landing/CountriesSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { MissionSection } from "../components/landing/MissionSection";
import { Text } from "@/components/ui/text";

export function LandingPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const { municipalities } = useMunicipalities();
  const companiesSectionRef = useRef<HTMLDivElement | null>(null);
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

  const handleChevronClick = useCallback(() => {
    const element = companiesSectionRef.current;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <div className="flex flex-col items-center h-screen">
        <div className="flex-1 flex flex-col items-center text-center px-4 pt-32 md:pt-48 md:pb-2">
          <div className="max-w-lg md:max-w-4xl mx-auto space-y-2">
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

          <LandingPageCTA
            companies={companies}
            municipalities={municipalities}
          />
        </div>
        <div
          className={`flex flex-col ${fadeChevron ? "opacity-0 " : "opacity-50"} absolute bottom-0 items-center transition-opacity ease-in duration-750`}
        >
          <Text
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
            className="cursor-pointer"
          >
            {t("header.explore")}
          </Text>
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
            className={`${fadeChevron ? "opacity-0 " : "opacity-50"} cursor-pointer animate-bounce transition-opacity ease-in duration-750 mt-2`}
          />
        </div>
        <img
          src="/images/web/hero-globe-image.jpg"
          alt="Illustration"
          className="w-full object-cover"
        />
      </div>
      <div ref={companiesSectionRef} id="companies-section" className="w-full">
        <CompaniesSection companies={companies} />
      </div>
      <MunicipalitiesSection municipalities={municipalities} />
      <CountriesSection />
      <MissionSection />
      <PartnersSection />
    </>
  );
}
