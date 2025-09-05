import { Trans, useTranslation } from "react-i18next";

export const MunicipalityDataOverviewContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.municipality.municipalityDataOverview.paragraph1")}</p>
      <p>
        <Trans
          i18nKey="methodsPage.municipality.municipalityDataOverview.paragraph2"
          components={[
            <a
              className="underline hover:text-white transition-colors"
              href="https://klimatkollen.se/reports/2025-06-19_ApplyingCarbonLawFrom2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
            />,
          ]}
        />
      </p>
      <p>{t("methodsPage.municipality.municipalityDataOverview.paragraph3")}</p>
      <p>{t("methodsPage.municipality.municipalityDataOverview.paragraph4")}</p>
    </div>
  );
};
