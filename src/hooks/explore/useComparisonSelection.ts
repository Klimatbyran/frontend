import { useCallback, useState } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import type { ListCardProps } from "@/components/explore/ListCard";

export {
  COMPARISON_MIN,
  COMPARISON_MAX,
} from "@/utils/explore/comparisonUtils";

export function useComparisonSelection(items: ListCardProps[] = []) {
  const comparison = useComparison();
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const entityVariant = comparison.variant ?? items[0]?.variant ?? null;

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => {
      if (prev) {
        setShowComparison(false);
        comparison.clearSelection();
      }
      return !prev;
    });
  }, [comparison]);

  const toggleSelection = useCallback(
    (linkTo: string) => {
      if (!entityVariant) {
        return;
      }
      comparison.toggleSelection(linkTo, entityVariant);
    },
    [comparison, entityVariant],
  );

  const viewComparison = useCallback(() => {
    if (comparison.canViewComparison) {
      setShowComparison(true);
    }
  }, [comparison.canViewComparison]);

  const backToList = useCallback(() => {
    setShowComparison(false);
    setIsCompareMode(false);
    comparison.clearSelection();
  }, [comparison]);

  return {
    isCompareMode,
    showComparison,
    selectedIds: comparison.selectedIds,
    selectedCount: comparison.selectedCount,
    canViewComparison: comparison.canViewComparison,
    toggleCompareMode,
    toggleSelection,
    isSelected: comparison.isSelected,
    isSelectionDisabled: comparison.isSelectionDisabled,
    viewComparison,
    backToList,
    clearSelection: comparison.clearSelection,
    entityVariant,
  };
}

export type ComparisonSelection = ReturnType<typeof useComparisonSelection>;
