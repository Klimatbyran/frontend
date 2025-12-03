import { useTranslation } from "react-i18next";

import { Text } from "@/components/ui/text";
import { useScreenSize } from "@/hooks/useScreenSize";
import { FlipCard } from "./FlipCard";
import { LandingSection } from "./LandingSection";
import { useDidYouKnowStats } from "@/hooks/landing/useDidYouKnowStats";

export function DidYouKnow() {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const stats = useDidYouKnowStats();

  if (stats.length === 0) {
    return null;
  }

  return (
    <LandingSection innerClassName="flex flex-col mt-16 md:mt-24 mb-16 md:mb-24">
      <div className="mb-8 md:mb-12">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-2 md:mb-4">
          {t("landingPage.didYouKnow.title")}
        </h2>
        <Text className="text-md text-grey text-center">
          {t("landingPage.didYouKnow.subtitle", {
            action: isMobile
              ? t("landingPage.didYouKnow.actionMobile")
              : t("landingPage.didYouKnow.actionDesktop"),
          })}
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mx-2 sm:mx-8">
        {stats.map((stat, index) => (
          <FlipCard
            key={index}
            icon={stat.icon}
            teaser={stat.teaser}
            headline={stat.headline}
            description={stat.description}
            iconBgColor={stat.iconBgColor}
            borderColor={stat.borderColor}
            backBgColor={stat.backBgColor}
          />
        ))}
      </div>
    </LandingSection>
  );
}
