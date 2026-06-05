import { useCallback, useEffect, useState } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import type { ListCardProps } from "@/components/explore/ListCard";

export {
  COMPARISON_MIN,
  COMPARISON_MAX,
} from "@/utils/explore/comparisonUtils";

/**
 * Explore-list UI state layered on top of shared ComparisonContext.
 *
 * - ComparisonContext: selected ids + entity variant (session-persisted)
 * - This hook: compare mode toggle + inline/table view visibility
 */
export function useComparisonSelection(items: ListCardProps[] = []) {
  const comparison = useComparison();
  const { variant, clearSelection } = comparison;
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const listVariant = items[0]?.variant ?? null;

  // Re-enable compare mode when returning with an existing same-type selection.
  useEffect(() => {
    if (
      comparison.selectedCount > 0 &&
      listVariant &&
      variant === listVariant &&
      !isCompareMode
    ) {
      setIsCompareMode(true);
    }
  }, [comparison.selectedCount, isCompareMode, listVariant, variant]);

  // Clear stale selection when switching explore entity type.
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

  // Clear selection if the comparison view unmounts while active.
  useEffect(() => {
    return () => {
      if (showComparison) {
        clearSelection();
      }
    };
  }, [clearSelection, showComparison]);

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
    entityVariant: listVariant,
  };
}

export type ComparisonSelection = ReturnType<typeof useComparisonSelection>;
