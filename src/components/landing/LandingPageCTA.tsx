import { useTranslation } from "react-i18next";
import { BarChart3, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { Text } from "@/components/ui/text";
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
    <LandingSection innerClassName="flex flex-col items-center max-w-4xl mx-auto space-y-16">
      {/* Description */}
      <p className="text-lg md:text-lg text-grey max-w-3xl">
        {t("landingPage.ctaSection.description")}
      </p>

      {/* Buttons */}

      {/* <div className="flex w-full justify-center items-center gap-16">
        <div className="flex flex-col">
          <span className="font-bold">400+</span>
          <Text className="font-light text-grey">
            {t("landingPage.ctaSection.stats.companiesAvailable")}
          </Text>
        </div>
        <span className="h-8 w-[0.5px] bg-grey/50" />
        <div className="flex flex-col">
          <span className="font-bold">290+</span>
          <Text className="font-light text-grey">
            {t("landingPage.ctaSection.stats.municipalitiesAdded")}
          </Text>
        </div>
        <span className="h-8 w-[0.5px] bg-grey/50" />
        <div className="flex flex-col">
          <span className="font-bold">2000+</span>
          <Text className="font-light text-grey">
            {t("landingPage.ctaSection.stats.esgAndAnnualReports")}
          </Text>
        </div>
      </div> */}
      <div className="flex pt-6 flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
                className="group relative w-auto px-8 h-12 rounded-md overflow-hidden font-medium hover:opacity-100 active:opacity-100"
              >
                <span
                  className="absolute inset-0 origin-left scale-x-0 bg-blue-3 transition-transform duration-500 ease-out group-hover:scale-x-100"
                  aria-hidden="true"
                />
                <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
                  <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t(button.translationKey)}
                </span>
              </Button>
            </LocalizedLink>
          );
        })}
      </div>
    </LandingSection>
  );
}
