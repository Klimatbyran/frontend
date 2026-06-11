import { useTranslation } from "react-i18next";
import { GitCompareArrows } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { ComparisonSelection } from "@/hooks/explore/useComparisonSelection";
import { ComparisonActionBar } from "./ComparisonActionBar";

interface ComparisonControlsProps {
  comparison: ComparisonSelection;
}

export function ComparisonToggle({ comparison }: ComparisonControlsProps) {
  const { t } = useTranslation();
  const { isCompareMode, setCompareMode } = comparison;

  return (
    <Toggle
      variant="outlineWhite"
      pressed={isCompareMode}
      onPressedChange={setCompareMode}
      aria-label={t("explorePage.comparison.toggleMode")}
      aria-pressed={isCompareMode}
      className={cn(
        "shrink-0",
        isCompareMode &&
          "border-blue-2 bg-blue-5 text-white hover:bg-blue-6 data-[state=on]:bg-blue-5 data-[state=on]:text-white",
      )}
    >
      <GitCompareArrows className="w-4 h-4 mr-2" />
      {t("explorePage.comparison.compare")}
    </Toggle>
  );
}

export function ComparisonActiveBar({ comparison }: ComparisonControlsProps) {
  const { selectedCount, canViewComparison, viewComparison, clearSelection } =
    comparison;

  return (
    <ComparisonActionBar
      selectedCount={selectedCount}
      canViewComparison={canViewComparison}
      onClearSelection={clearSelection}
      onViewComparison={viewComparison}
      showClear
      showViewComparison
      className="w-full"
    />
  );
}
