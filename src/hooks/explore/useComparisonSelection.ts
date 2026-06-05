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

  // Exit compare mode when selection is cleared (e.g. after leaving compare page).
  useEffect(() => {
    if (comparison.selectedCount === 0 && isCompareMode) {
      setIsCompareMode(false);
    }
  }, [comparison.selectedCount, isCompareMode]);

  // Clear stale selection when switching explore entity type.
  useEffect(() => {
    if (listVariant && variant && variant !== listVariant) {
      setIsCompareMode(false);
      clearSelection();
    }
  }, [clearSelection, listVariant, variant]);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => {
      if (prev) {
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
      navigateToComparison();
    }
  }, [comparison.canViewComparison, navigateToComparison]);

  return {
    isCompareMode,
    selectedIds: comparison.selectedIds,
    selectedCount: comparison.selectedCount,
    canViewComparison: comparison.canViewComparison,
    toggleCompareMode,
    toggleSelection,
    isSelected: comparison.isSelected,
    isSelectionDisabled: comparison.isSelectionDisabled,
    viewComparison,
    clearSelection: comparison.clearSelection,
    entityVariant: listVariant,
  };
}

export type ComparisonSelection = ReturnType<typeof useComparisonSelection>;
