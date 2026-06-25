import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import type { NationDetails } from "@/hooks/nation/useNationDetails";

interface NationStoryHeroProps {
  nation: NationDetails;
  countryName: string;
}

export function NationStoryHero({ nation, countryName }: NationStoryHeroProps) {
  const { t } = useTranslation();

  return (
    <header className="relative w-full max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-12 md:pb-16">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        {nation.logoUrl ? (
          <img
            src={nation.logoUrl}
            alt=""
            className="h-20 w-20 md:h-24 md:w-24 object-contain shrink-0"
          />
        ) : null}
        <div className="space-y-6">
          <Text variant="h1" className="text-4xl md:text-6xl font-light">
            {countryName}
          </Text>
          <div className="space-y-4 text-grey text-lg leading-relaxed max-w-3xl">
            <p>{t("nation.story.intro.paragraph1")}</p>
            <p>{t("nation.story.intro.paragraph2")}</p>
            <p>{t("nation.story.intro.paragraph3")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
