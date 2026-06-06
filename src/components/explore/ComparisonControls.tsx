import { useTranslation } from "react-i18next";
import { GitCompareArrows } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { ComparisonSelection } from "@/hooks/explore/useComparisonSelection";
import {
  ComparisonClearButton,
  ComparisonSelectedCount,
  ComparisonViewButton,
} from "./ComparisonActions";

interface ComparisonControlsProps {
  comparison: ComparisonSelection;
}

export function ComparisonControls({ comparison }: ComparisonControlsProps) {
  const { t } = useTranslation();
  const {
    isCompareMode,
    selectedCount,
    canViewComparison,
    setCompareMode,
    viewComparison,
    clearSelection,
  } = comparison;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle
        variant="outlineWhite"
        pressed={isCompareMode}
        onPressedChange={setCompareMode}
        aria-label={t("explorePage.comparison.toggleMode")}
        aria-pressed={isCompareMode}
        className={cn(
          isCompareMode &&
            "border-blue-2 bg-blue-5 text-white hover:bg-blue-6 data-[state=on]:bg-blue-5 data-[state=on]:text-white",
        )}
      >
        <GitCompareArrows className="w-4 h-4 mr-2" />
        {isCompareMode
          ? t("explorePage.comparison.compareModeActive")
          : t("explorePage.comparison.compare")}
      </Toggle>

      {isCompareMode && (
        <>
          <ComparisonSelectedCount count={selectedCount} />
          {selectedCount > 0 && (
            <ComparisonClearButton onClick={clearSelection} />
          )}
          <ComparisonViewButton
            onClick={viewComparison}
            disabled={!canViewComparison}
          />
        </>
      )}
    </div>
  );
}
