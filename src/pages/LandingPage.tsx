import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Typewriter } from "@/components/ui/typewriter";
import { PageSEO } from "@/components/SEO/PageSEO";
import { PageLoading } from "@/components/pageStates/Loading";
import { useLandingPageReady } from "@/hooks/landing/useLandingPageReady";
import useThrottle from "@/hooks/useThrottle";
import {
  SCROLL_FADE_THRESHOLD,
  SCROLL_THROTTLE_DELAY,
} from "@/lib/constants/landingPage";
import { LandingPageCTA } from "@/components/landing/LandingPageCTA";
import {
  VALET_BANNER_LANDING_HERO_PAD_CLASS,
  VALET_BANNER_SCROLL_MARGIN_CLASS,
} from "@/components/landing/Valet2026HeroBanner";
import { CompaniesSection } from "@/components/landing/CompaniesSection";
import { MunicipalitiesSection } from "@/components/landing/MunicipalitiesSection";
import { CountriesSection } from "@/components/landing/CountriesSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { MissionSection } from "../components/landing/MissionSection";
import { Text } from "@/components/ui/text";

export function LandingPage() {
  const { t } = useTranslation();
  const municipalitiesSectionRef = useRef<HTMLDivElement | null>(null);
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
    const element = municipalitiesSectionRef.current;
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
  const { loading: landingDataLoading } = useLandingPageReady();

  useEffect(() => {
    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [throttledScroll]);

  if (landingDataLoading) {
    return (
      <>
        <PageSEO
          title={pageTitle}
          description={pageDescription}
          canonicalUrl={canonicalUrl}
          structuredData={structuredData}
        />
        <div className="px-4 pt-24">
          <PageLoading />
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <div className="flex flex-col items-center h-screen">
        <div
          className={`flex-1 flex flex-col items-center text-center px-4 ${VALET_BANNER_LANDING_HERO_PAD_CLASS} md:pb-2`}
        >
          <div className="max-w-lg md:max-w-4xl mx-auto space-y-2 story-short:space-y-1">
            <h1 className="text-4xl story-short:text-[1.75rem] story-short:leading-tight md:text-7xl font-light tracking-tight">
              {t("landingPage.title")}
            </h1>

            <div className="h-[80px] story-short:h-[4.25rem] flex items-center justify-center text-4xl story-short:text-[1.75rem] md:h-[120px] md:text-7xl font-light">
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

          <LandingPageCTA />
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
      <div
        ref={municipalitiesSectionRef}
        id="municipalities-section"
        className={`w-full ${VALET_BANNER_SCROLL_MARGIN_CLASS}`}
      >
        <MunicipalitiesSection />
      </div>
      <CountriesSection />
      <CompaniesSection />
      <MissionSection />
      <PartnersSection />
    </>
  );
}
