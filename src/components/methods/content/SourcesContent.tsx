import { useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";

const SOURCE_GROUPS = [
  {
    key: "coreEmissions",
    sources: ["climateTrace", "smhi"],
  },
  {
    key: "municipalityIndicators",
    sources: [
      "trafikanalys",
      "nvdb",
      "sei",
      "powerCircle",
      "klimatplaner",
      "upphandlingsmyndigheten",
      "greenpeace",
    ],
  },
  {
    key: "metadata",
    sources: ["skr", "wikidata"],
  },
] as const;

export const SourcesContent = () => {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.territorial.sources.paragraph1")}</p>
      <p>{t("methodsPage.territorial.sources.paragraph2")}</p>

      {SOURCE_GROUPS.map((group) => (
        <section key={group.key} className="space-y-4 not-prose">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {t(`methodsPage.territorial.sources.groups.${group.key}.title`)}
            </h2>
            <p className="mt-1 text-sm text-grey">
              {t(
                `methodsPage.territorial.sources.groups.${group.key}.description`,
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {group.sources.map((key) => (
              <LinkButton
                key={key}
                title={t(`methodsPage.territorial.sources.links.${key}.title`)}
                text={t(`methodsPage.territorial.sources.links.${key}.text`)}
                link={t(`methodsPage.territorial.sources.links.${key}.link`)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
