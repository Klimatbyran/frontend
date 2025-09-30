import { useTranslation } from "react-i18next";
import { ContentSection } from "@/components/shared/ContentSection/ContentSection";

export const MunicipalityKPIsContent = () => {
  const { t } = useTranslation();

  // Get the list object with returnObjects: true
  const rawKpiList = t("methodsPage.municipality.municipalityKPIs.list", {
    returnObjects: true,
  }) as Record<string, string>;

  // Transform to list of objects with title and content
  const kpiList = Object.values(rawKpiList).map((item) => {
    const [title, ...contentParts] = item.split(" - ");
    const content = contentParts.join(" - ");
    return { title, content };
  });

  return (
    <div className="mx-auto space-y-8 prose prose-invert">
      <p>{t("methodsPage.municipality.municipalityKPIs.paragraph1")}</p>
      <p>{t("methodsPage.municipality.municipalityKPIs.paragraph2")}</p>
      <div className="space-y-6">
        {kpiList.map((item, index) => (
          <ContentSection key={index} title={item.title}>
            <p>{item.content}</p>
          </ContentSection>
        ))}
      </div>
    </div>
  );
};
