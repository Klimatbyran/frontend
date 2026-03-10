import { useTranslation } from "react-i18next";
import { BarChart3, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { LandingSection } from "./LandingSection";

interface CTAButton {
  to: string;
  icon: LucideIcon;
  translationKey: string;
  variant: "default" | "outline";
}

const CTA_BUTTONS: CTAButton[] = [
  {
    to: "/explore/companies",
    icon: BarChart3,
    translationKey: "landingPage.ctaSection.exploreData",
    variant: "outline",
  },
];

export function LandingPageCTA() {
  const { t } = useTranslation();

  return (
    <LandingSection innerClassName="flex flex-col items-center max-w-4xl mx-auto space-y-8">
      {/* Description */}
      <p className="text-lg md:text-lg text-grey max-w-3xl">
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
                className={`w-auto px-8 h-12 rounded-md text-white hover:bg-black-1 font-medium`}
              >
                <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
                {t(button.translationKey)}
              </Button>
            </LocalizedLink>
          );
        })}
      </div>
    </LandingSection>
  );
}
