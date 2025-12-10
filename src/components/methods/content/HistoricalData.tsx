import { useTranslation } from "react-i18next";
import { MethodSection } from "@/components/layout/MethodSection";


export const HistoricalDataContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <MethodSection title={t("methodsPage.company.historicalData.goals.title")}>
        <p>{t("methodsPage.company.historicalData.goals.paragraph1")}</p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.company.historicalData.historicEmissions.title")}
      >
        <p>
          {t("methodsPage.company.historicalData.historicEmissions.paragraph1")}
        </p>
      </MethodSection>
    </div>
  );
};
