import { useTranslation } from "react-i18next";
import { ContentSection } from "@/components/shared/ContentSection/ContentSection";

export const DataCollectionProcessContent = () => {
  const { t } = useTranslation();
  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <ContentSection
        title={t(
          "methodsPage.company.companyDataCollection.dataPresented.title",
        )}
      >
        <p>{t("methodsPage.company.companyDataCollection.paragraph1")}</p>
        <p>{t("methodsPage.company.companyDataCollection.paragraph2")}</p>
        <p>{t("methodsPage.company.companyDataCollection.paragraph3")}</p>
        <p>{t("methodsPage.company.companyDataCollection.paragraph4")}</p>
        <p>{t("methodsPage.company.companyDataCollection.paragraph5")}</p>
      </ContentSection>

      <ContentSection
        title={t("methodsPage.company.companyDataCollection.fiscalYear.title")}
      >
        <p>
          {t("methodsPage.company.companyDataCollection.fiscalYear.paragraph1")}
        </p>
      </ContentSection>
    </div>
  );
};
