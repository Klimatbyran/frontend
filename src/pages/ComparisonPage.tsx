import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { useComparisonItems } from "@/hooks/explore/useComparisonItems";
import { ComparisonView } from "@/components/explore/ComparisonView";
import { PageLoading } from "@/components/pageStates/Loading";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";
import {
  COMPARISON_MIN,
  getExplorePath,
} from "@/utils/explore/comparisonUtils";

export function ComparisonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { variant, selectedCount, clearSelection } = useComparison();
  const { items, loading } = useComparisonItems();

  const handleBack = () => {
    clearSelection();
    if (variant) {
      navigate(localizedPath(currentLanguage, getExplorePath(variant)));
      return;
    }
    navigate(localizedPath(currentLanguage, "/explore/municipalities"));
  };

  if (loading) {
    return <PageLoading />;
  }

  if (selectedCount < COMPARISON_MIN || items.length < COMPARISON_MIN) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-light">
          {t("explorePage.comparison.notEnoughSelected")}
        </h2>
        <p className="text-grey mt-2">
          {t("explorePage.comparison.notEnoughSelectedDescription", {
            min: COMPARISON_MIN,
          })}
        </p>
        <button
          type="button"
          className="mt-6 text-blue-2 hover:underline"
          onClick={() => {
            clearSelection();
            handleBack();
          }}
        >
          {t("explorePage.comparison.backToList")}
        </button>
      </div>
    );
  }

  return <ComparisonView items={items} onBack={handleBack} />;
}
