import { useTranslation } from "react-i18next";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { ComparisonSelection } from "@/hooks/explore/useComparisonSelection";
import {
  COMPARISON_MAX,
  COMPARISON_MIN,
} from "@/utils/explore/comparisonUtils";

interface ComparisonControlsProps {
  comparison: ComparisonSelection;
}

export function ComparisonControls({ comparison }: ComparisonControlsProps) {
  const { t } = useTranslation();
  const {
    isCompareMode,
    showComparison,
    selectedCount,
    canViewComparison,
    toggleCompareMode,
    viewComparison,
    clearSelection,
  } = comparison;

  if (showComparison) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle
        variant="outlineWhite"
        pressed={isCompareMode}
        onClick={toggleCompareMode}
        aria-label={t("explorePage.comparison.toggleMode")}
      >
        <GitCompareArrows className="w-4 h-4 mr-2" />
        {t("explorePage.comparison.compare")}
      </Toggle>

      {isCompareMode && (
        <>
          <span className="text-grey text-sm">
            {t("explorePage.comparison.selected", {
              count: selectedCount,
              min: COMPARISON_MIN,
              max: COMPARISON_MAX,
            })}
          </span>
          {selectedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              {t("explorePage.comparison.clearSelection")}
            </Button>
          )}
          <Button
            size="sm"
            disabled={!canViewComparison}
            onClick={viewComparison}
          >
            {t("explorePage.comparison.viewComparison")}
          </Button>
        </>
      )}
    </div>
  );
}
