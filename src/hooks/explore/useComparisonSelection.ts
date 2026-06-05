import { useCallback, useEffect, useState } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import type { ListCardProps } from "@/components/explore/ListCard";

export {
  COMPARISON_MIN,
  COMPARISON_MAX,
} from "@/utils/explore/comparisonUtils";

export function useComparisonSelection(items: ListCardProps[] = []) {
  const comparison = useComparison();
  const { variant, clearSelection } = comparison;
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const listVariant = items[0]?.variant ?? null;
  const entityVariant = listVariant;

  useEffect(() => {
    if (listVariant && variant && variant !== listVariant) {
      setShowComparison(false);
      setIsCompareMode(false);
      clearSelection();
    }
  }, [clearSelection, listVariant, variant]);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => {
      if (prev) {
        setShowComparison(false);
        comparison.clearSelection();
      } else if (listVariant && variant && variant !== listVariant) {
        comparison.clearSelection();
      }
      return !prev;
    });
  }, [comparison, listVariant, variant]);

  const toggleSelection = useCallback(
    (linkTo: string) => {
      if (!listVariant) {
        return;
      }
      comparison.toggleSelection(linkTo, listVariant);
    },
    [comparison, listVariant],
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
