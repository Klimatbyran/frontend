import { useTranslation } from "react-i18next";

export const MunicipalityKPIsContent = () => {
  const { t } = useTranslation();

  // Get the list object with returnObjects: true
  const kpiList = t("methodsPage.municipality.municipalityKPIs.list", {
    returnObjects: true,
  }) as Record<string, string>;

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.municipality.municipalityKPIs.paragraph1")}</p>
      <p>{t("methodsPage.municipality.municipalityKPIs.paragraph2")}</p>
      <ul>
        {Object.values(kpiList).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
