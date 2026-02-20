import { useTranslation } from "react-i18next";
import { BarChart3, Building2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { LandingSection } from "./LandingSection";

interface CTAButton {
  to: string;
  icon: LucideIcon;
  translationKey: string;
  variant: "default" | "outline";
  gradientClasses: string;
}

const CTA_BUTTONS: CTAButton[] = [
  {
    to: "/municipalities",
    icon: BarChart3,
    translationKey: "landingPage.ctaSection.exploreClimateData",
    variant: "default",
    gradientClasses: "bg-gradient-to-r from-orange-2 to-orange-3",
  },
  {
    to: "/companies",
    icon: Building2,
    translationKey: "landingPage.ctaSection.viewCompanyRankings",
    variant: "outline",
    gradientClasses: "bg-gradient-to-r from-blue-2 to-blue-3",
  },
];

export function LandingPageCTA() {
  const { t } = useTranslation();

  return (
    <LandingSection innerClassName="flex flex-col items-center max-w-4xl mx-auto space-y-8">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white">
        {t("landingPage.ctaSection.title")}
      </h2>

      {/* Description */}
      <p className="text-lg md:text-xl text-grey max-w-3xl">
        {t("landingPage.ctaSection.description")}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {CTA_BUTTONS.map((button) => {
          const Icon = button.icon;
          return (
            <LocalizedLink
              key={button.to}
              to={button.to}
              className="flex-1 sm:flex-none"
            >
              <Button
                variant={button.variant}
                size="lg"
                className={`w-full sm:w-auto px-8 h-12 rounded-md ${button.gradientClasses} text-black-3 hover:bg-black-1 font-medium`}
              >
                <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
                {t(button.translationKey)}
              </Button>
            </LocalizedLink>
          );
        })}
      </div>

      {/* Or Divider */}
      <div
        className="flex items-center gap-4 w-full max-w-3xl"
        role="separator"
      >
        <div className="flex-1 h-px bg-grey opacity-30" aria-hidden="true" />
        <span className="text-grey text-sm font-light">
          {t("landingPage.ctaSection.or")}
        </span>
        <div className="flex-1 h-px bg-grey opacity-30" aria-hidden="true" />
      </div>
    </LandingSection>
  );
}
