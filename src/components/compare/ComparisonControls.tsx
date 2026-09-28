import { useTranslation } from "react-i18next";
import { GitCompareArrows } from "lucide-react";
import { KPIChip } from "@/components/ranked/KPIChip";
import type { ComparisonSelection } from "@/hooks/compare/useComparisonSelection";
import { ComparisonActionBar } from "./ComparisonActionBar";

interface ComparisonControlsProps {
  comparison: ComparisonSelection;
}

export function ComparisonToggle({ comparison }: ComparisonControlsProps) {
  const { t } = useTranslation();
  const { isCompareMode, setCompareMode } = comparison;

  return (
    <KPIChip
      selected={isCompareMode}
      onClick={() => setCompareMode(!isCompareMode)}
      aria-label={t("explorePage.comparison.toggleMode")}
      aria-pressed={isCompareMode}
      icon={<GitCompareArrows className="w-4 h-4" />}
      className="shrink-0"
    >
      {t("explorePage.comparison.compare")}
    </KPIChip>
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
