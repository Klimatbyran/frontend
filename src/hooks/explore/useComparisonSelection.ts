import { useCallback, useEffect, useState } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useNavigateToComparison } from "@/hooks/explore/useNavigateToComparison";
import type { ListCardProps } from "@/components/explore/ListCard";

export {
  COMPARISON_MIN,
  COMPARISON_MAX,
} from "@/utils/explore/comparisonUtils";

/**
 * Explore-list UI state layered on top of shared ComparisonContext.
 *
 * - ComparisonContext: selected ids + entity variant (session-persisted)
 * - This hook: compare mode toggle; comparison view lives on /explore/compare
 */
export function useComparisonSelection(items: ListCardProps[] = []) {
  const comparison = useComparison();
  const navigateToComparison = useNavigateToComparison();
  const { variant, clearSelection } = comparison;
  const [isCompareMode, setIsCompareMode] = useState(false);

  const listVariant = items[0]?.variant ?? null;

  // Clear stale selection when switching explore entity type.
  useEffect(() => {
    if (listVariant && variant && variant !== listVariant) {
      setIsCompareMode(false);
      clearSelection();
    }
  }, [clearSelection, listVariant, variant]);

  const setCompareMode = useCallback(
    (pressed: boolean) => {
      if (pressed) {
        if (listVariant && variant && variant !== listVariant) {
          comparison.clearSelection();
        }
        setIsCompareMode(true);
        return;
      }

      comparison.clearSelection();
      setIsCompareMode(false);
    },
    [comparison, listVariant, variant],
  );

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
      navigateToComparison();
    }
  }, [comparison.canViewComparison, navigateToComparison]);

  return {
    isCompareMode,
    selectedIds: comparison.selectedIds,
    selectedCount: comparison.selectedCount,
    canViewComparison: comparison.canViewComparison,
    setCompareMode,
    toggleSelection,
    isSelected: comparison.isSelected,
    isSelectionDisabled: comparison.isSelectionDisabled,
    viewComparison,
    clearSelection: comparison.clearSelection,
    entityVariant: listVariant,
  };
}

export type ComparisonSelection = ReturnType<typeof useComparisonSelection>;
