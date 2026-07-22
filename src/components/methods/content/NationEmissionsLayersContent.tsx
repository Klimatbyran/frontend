import { useTranslation } from "react-i18next";
import { MethodSection } from "@/components/layout/MethodSection";

/**
 * Placeholder for Sweden national emissions methodology (full picture / story layers).
 * Detailed copy will be filled in later.
 */
export const NationEmissionsLayersContent = () => {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert mx-auto space-y-8">
      <MethodSection
        title={t("methodsPage.nation.nationEmissionsLayers.sectionTitle")}
      >
        <p>{t("methodsPage.nation.nationEmissionsLayers.placeholder")}</p>
      </MethodSection>
    </div>
  );
};
