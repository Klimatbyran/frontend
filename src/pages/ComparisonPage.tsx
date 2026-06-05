import { useTranslation } from "react-i18next";
import { useComparison } from "@/contexts/ComparisonContext";
import { useComparisonItems } from "@/hooks/explore/useComparisonItems";
import { useComparisonBackNavigation } from "@/hooks/explore/useComparisonBackNavigation";
import { ComparisonView } from "@/components/explore/ComparisonView";
import { PageLoading } from "@/components/pageStates/Loading";
import { COMPARISON_MIN } from "@/utils/explore/comparisonUtils";

export function ComparisonPage() {
  const { t } = useTranslation();
  const { selectedCount } = useComparison();
  const { items, loading } = useComparisonItems();
  const { handleBack, backLabelKey } = useComparisonBackNavigation();

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
          onClick={handleBack}
        >
          {t(backLabelKey)}
        </button>
      </div>
    );
  }

  return (
    <ComparisonView
      items={items}
      onBack={handleBack}
      backLabelKey={backLabelKey}
    />
  );
}
