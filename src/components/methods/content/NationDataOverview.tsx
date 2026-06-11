import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";
import { LinkButton } from "@/components/layout/LinkButton";

export const NationDataOverviewContent = () => {
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
      <p>{t("methodsPage.nation.nationDataOverview.paragraph1")}</p>
      <div className="flex justify-center">
        <div className="w-full space-y-6">
          <LinkButton
            title={t("methodsPage.nation.nationDataOverview.link.title")}
            text={t("methodsPage.nation.nationDataOverview.link.text")}
            link={`${i18next.resolvedLanguage}/nation`}
          />
        </div>
      </div>
      <p>{t("methodsPage.nation.nationDataOverview.paragraph2")}</p>
      {paragraphWithLink(
        "methodsPage.nation.nationDataOverview.paragraph3",
        "https://klimatkollen.se/reports/2025-06-19_ApplyingCarbonLawFrom2025.pdf",
      )}
      {paragraphWithLink(
        "methodsPage.nation.nationDataOverview.paragraph4",
        "https://docs.google.com/document/d/1MihysUkfunbV0LjwSUCiGSqWQSo5U03K0RMbRsVBL7U/edit?pli=1&tab=t.0#heading=h.oqnz3ereclbn",
      )}
      <p>{t("methodsPage.nation.nationDataOverview.paragraph5")}</p>
    </div>
  );
};
