import { useTranslation } from "react-i18next";
import { MethodSection } from "@/components/layout/MethodSection";

export const PeerComparisonContent = () => {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <p>{t("methodsPage.general.peerComparison.paragraph1")}</p>
      <p>{t("methodsPage.general.peerComparison.paragraph2")}</p>

      <MethodSection
        title={t("methodsPage.general.peerComparison.whyMedian.title")}
      >
        <p>{t("methodsPage.general.peerComparison.whyMedian.paragraph1")}</p>
        <p>{t("methodsPage.general.peerComparison.whyMedian.paragraph2")}</p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.general.peerComparison.where.title")}
      >
        <p>{t("methodsPage.general.peerComparison.where.paragraph1")}</p>
        <p>{t("methodsPage.general.peerComparison.where.paragraph2")}</p>
      </MethodSection>

      <MethodSection title={t("methodsPage.general.peerComparison.who.title")}>
        <p>{t("methodsPage.general.peerComparison.who.paragraph1")}</p>
        <ul>
          <li>{t("methodsPage.general.peerComparison.who.municipalities")}</li>
          <li>{t("methodsPage.general.peerComparison.who.regions")}</li>
          <li>{t("methodsPage.general.peerComparison.who.companies")}</li>
        </ul>
        <p>{t("methodsPage.general.peerComparison.who.paragraph2")}</p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.general.peerComparison.yesNo.title")}
      >
        <p>{t("methodsPage.general.peerComparison.yesNo.paragraph1")}</p>
      </MethodSection>
    </div>
  );
};
