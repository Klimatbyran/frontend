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

  const variant = items[0]?.variant ?? comparison.variant ?? "company";

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
      comparison.toggleSelection(linkTo, variant);
    },
    [comparison, variant],
  );

  const viewComparison = useCallback(() => {
    if (comparison.canViewComparison) {
      setShowComparison(true);
    }
  }, [comparison.canViewComparison]);

  const backToList = useCallback(() => {
    setShowComparison(false);
  }, []);

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
  };
}

export type ComparisonSelection = ReturnType<typeof useComparisonSelection>;
