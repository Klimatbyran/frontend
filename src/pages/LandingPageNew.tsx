// TODO: This is currently a slightly modified copy of the live landing page, all landing page modifications can be made here
// without worry of impacting prod until we're ready
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2Icon, ChevronDown, TreePineIcon } from "lucide-react";
import { Seo } from "@/components/SEO/Seo";
import { TopList, TopListItem } from "@/components/TopList";
import { Typewriter } from "@/components/ui/typewriter";
import { ScrollAnimationSection } from "@/components/layout/ScrollAnimationSection";
import { useLanguage } from "@/components/LanguageProvider";
import { LandingSection } from "@/components/landing/LandingSection";
import { LandingPageCTA } from "@/components/landing/LandingPageCTA";
import { DidYouKnow } from "@/components/landing/DidYouKnow";
import SiteFeatures from "@/components/landing/SiteFeatures";
import { useLandingPageScrollStepsWithContent } from "@/components/landing/LandingPageScrollSteps";
import {
  useLandingPageData,
  SCROLL_FADE_THRESHOLD,
} from "@/hooks/landing/useLandingPageData";
import { useLandingPageSEO } from "@/hooks/landing/useLandingPageSEO";
import useThrottle from "@/hooks/useThrottle";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import {
  TYPEWRITER_SPEED,
  TYPEWRITER_WAIT_TIME,
  TYPEWRITER_DELETE_SPEED,
  TYPEWRITER_CURSOR_CHAR,
  SCROLL_THROTTLE_DELAY,
} from "@/lib/constants/landingPage";

export function LandingPageNew() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fadeChevron, setFadeChevron] = useState(false);

  // Get SEO data from hook
  const {
    pageTitle,
    pageDescription,
    typeWriterTexts,
  } = useLandingPageSEO();

  // Get landing page data from hook
  const { largestCompanyEmitters, topMunicipalities } = useLandingPageData();

  // Get scroll animation steps
  const scrollSteps = useLandingPageScrollStepsWithContent();

  // Render function for company emissions
  const renderCompanyEmission = useCallback(
    (item: TopListItem) => (
      <div className="text-base sm:text-lg">
        <span className="md:text-right text-pink-3">
          {formatEmissionsAbsolute(item.value, currentLanguage)}
        </span>
        <span className="text-grey ml-2"> {t("emissionsUnit")}</span>
      </div>
    ),
    [currentLanguage, t],
  );

  // Render function for municipality change rate
  const renderMunicipalityChangeRate = useCallback(
    (item: TopListItem) => (
      <span className="text-base sm:text-lg md:text-right text-green-3">
        {formatPercentChange(item.value, currentLanguage)}
      </span>
    ),
    [currentLanguage],
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
      <Seo
        meta={{
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
          // Note: structuredData not needed - Layout adds site-wide Organization/WebSite schema
        }}
      />
      <div className="flex flex-col h-screen items-center">
        <div className="flex-1 flex flex-col items-center text-center px-4 py-44 md:py-56">
          <div className="max-w-lg md:max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-7xl font-light tracking-tight">
              {t("landingPage.title")}
            </h1>

            <div className="h-[80px] md:h-[120px] flex items-center justify-center text-4xl md:text-7xl font-light">
              <Typewriter
                text={typeWriterTexts}
                speed={TYPEWRITER_SPEED}
                className="text-[#E2FF8D]"
                waitTime={TYPEWRITER_WAIT_TIME}
                deleteSpeed={TYPEWRITER_DELETE_SPEED}
                cursorChar={TYPEWRITER_CURSOR_CHAR}
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

      {/* Scroll Animation Section */}
      <section ref={containerRef}>
        <ScrollAnimationSection steps={scrollSteps} className="bg-black" />
      </section>

      <SiteFeatures />
      <LandingSection innerClassName="mx-2 sm:mx-8">
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
      </LandingSection>
      <DidYouKnow />
      <LandingPageCTA />
    </>
  );
}
