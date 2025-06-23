import { useTranslation } from "react-i18next";
import { LinkButton } from "@/components/layout/LinkButton";

export const CarbonLawContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-4">
      <p>{t("methodsPage.general.carbonLaw.paragraph1")}</p>
      <p>{t("methodsPage.general.carbonLaw.paragraph2")}</p>
      <p>{t("methodsPage.general.carbonLaw.paragraph3")}</p>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <LinkButton
            title={t("methodsPage.general.carbonLaw.link.title")}
            text={t("methodsPage.general.carbonLaw.link.text")}
            link="/reports/2025-06-19_ApplyingCarbonLawFrom2025.pdf"
          />
        </div>
      </div>
    </div>
  );
};
