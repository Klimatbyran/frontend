import { Trans, useTranslation } from "react-i18next";

export const MunicipalityAndRegionDataOverviewContent = () => {
  const { t } = useTranslation();
  const paragraphWithLink = (text: string, link: string) => {
    return (
      <p>
        <Trans
          i18nKey={text}
          components={[
            <a
              title={text}
              className="underline hover:text-white transition-colors"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            />,
          ]}
        />
      </p>
    );
  };

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.municipalityAndRegion.dataOverview.paragraph1")}</p>
      {paragraphWithLink(
        "methodsPage.municipalityAndRegion.dataOverview.paragraph2",
        "https://klimatkollen.se/reports/2025-06-19_ApplyingCarbonLawFrom2025.pdf",
      )}
      {paragraphWithLink(
        "methodsPage.municipalityAndRegion.dataOverview.paragraph3",
        "https://docs.google.com/document/d/1MihysUkfunbV0LjwSUCiGSqWQSo5U03K0RMbRsVBL7U/edit?pli=1&tab=t.0#heading=h.oqnz3ereclbn",
      )}
      <p>{t("methodsPage.municipalityAndRegion.dataOverview.paragraph4")}</p>
    </div>
  );
};
