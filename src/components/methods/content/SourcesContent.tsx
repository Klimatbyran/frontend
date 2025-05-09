import { useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";

export const SourcesContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.municipality.sources.paragraph1")}</p>
      <p>{t("methodsPage.municipality.sources.paragraph2")}</p>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[
            "smhi",
            "skr",
            "wikidata",
            "trafikanalys",
            "nvdb",
            "sei",
            "powerCircles",
            "klimatplaner",
            "upphandlingsmyndigheten",
            "greenpeace",
          ].map((key) => (
            <LinkButton
              key={key}
              title={t(`methodsPage.municipality.sources.links.${key}.title`)}
              text={t(`methodsPage.municipality.sources.links.${key}.text`)}
              link={t(`methodsPage.municipality.sources.links.${key}.link`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
