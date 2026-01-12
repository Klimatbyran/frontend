import { useTranslation } from "react-i18next";
import {
  Building2,
  Landmark,
  TrendingUpDown,
  type LucideIcon,
} from "lucide-react";
import { Text } from "@/components/ui/text";
import { LandingSection } from "./LandingSection";

interface Feature {
  icon: LucideIcon;
  iconBgColor: string;
  iconSize: string;
  titleKey: string;
  descriptionKey: string;
}

const SiteFeatures = () => {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      icon: Landmark,
      iconBgColor: "bg-orange-3",
      iconSize: "h-[20px] w-[20px] md:h-[60px] md:w-[60px] md:p-4",
      titleKey: "landingPage.siteFeatures.features.municipalityRankings.title",
      descriptionKey:
        "landingPage.siteFeatures.features.municipalityRankings.description",
    },
    {
      icon: Building2,
      iconBgColor: "bg-blue-3",
      iconSize: "h-[20px] w-[20px] md:h-[60px] md:w-[60px] md:p-4",
      titleKey: "landingPage.siteFeatures.features.companyRankings.title",
      descriptionKey:
        "landingPage.siteFeatures.features.companyRankings.description",
    },
    {
      icon: TrendingUpDown,
      iconBgColor: "bg-green-3",
      iconSize: "h-[15px] w-[15px] md:h-[60px] md:w-[60px] md:p-4",
      titleKey: "landingPage.siteFeatures.features.progressTracking.title",
      descriptionKey:
        "landingPage.siteFeatures.features.progressTracking.description",
    },
  ];

  return (
    <LandingSection innerClassName="flex flex-col mt-32">
      <div className="mb-8 md:mb-16">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-2 md:mb-4">
          {t("landingPage.siteFeatures.title")}
        </h2>
        <Text className="col-span-full text-md text-grey text-center">
          {t("landingPage.siteFeatures.description")}
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 self-center mx-2 sm:mx-8 w-full">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex flex-col bg-black-2 rounded-level-2 h-48 md:min-h-64 p-4 items-center justify-center"
            >
              <span
                className={`${feature.iconBgColor} w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 md:mb-4`}
              >
                <Icon className={`absolute ${feature.iconSize}`} />
              </span>
              <div className="flex flex-col items-center">
                <h2 className="tracking-tight font-light text-2xl md:text-4xl text-center">
                  {t(feature.titleKey)}
                </h2>
                <Text className="col-span-full text-md text-grey text-center">
                  {t(feature.descriptionKey)}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </LandingSection>
  );
};

export default SiteFeatures;
