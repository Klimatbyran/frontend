import { Zap, BarChart3, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/ui/globalsearch";

export function LandingPageCTA() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col h-screen items-center justify-center bg-black text-center px-4 py-16">
      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-8">

        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white">
          {t("landingPage.ctaSection.title")}
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-grey max-w-3xl">
          {t("landingPage.ctaSection.description")}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <LocalizedLink to="/municipalities" className="flex-1 sm:flex-none">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto px-8 h-12 rounded-md bg-gradient-to-r from-blue-2 to-blue-3 text-black-3 hover:bg-black-1 font-medium"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              {t("landingPage.ctaSection.exploreClimateData")}
            </Button>
          </LocalizedLink>

          <LocalizedLink to="/companies" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 h-12 rounded-md bg-gradient-to-r from-green-2 to-green-3 text-black-3 hover:bg-black-1 font-medium"
            >
              <Building2 className="w-5 h-5 mr-2" />
              {t("landingPage.ctaSection.viewCompanyRankings")}
            </Button>
          </LocalizedLink>
        </div>

        {/* Or Divider */}
        <div className="flex items-center gap-4 w-full max-w-3xl">
          <div className="flex-1 h-px bg-grey opacity-30"></div>
          <span className="text-grey text-sm font-light">
            {t("landingPage.ctaSection.or")}
          </span>
          <div className="flex-1 h-px bg-grey opacity-30"></div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center">
          <GlobalSearch />
        </div>
      </div>
    </section>
  );
}

