import { useCallback, useState } from "react";

export const COMPARISON_MIN = 2;
export const COMPARISON_MAX = 4;

export function useComparisonSelection() {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => {
      if (prev) {
        setShowComparison(false);
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < COMPARISON_MAX) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const isSelectionDisabled = useCallback(
    (id: string) => selectedIds.size >= COMPARISON_MAX && !selectedIds.has(id),
    [selectedIds],
  );

  const viewComparison = useCallback(() => {
    if (selectedIds.size >= COMPARISON_MIN) {
      setShowComparison(true);
    }
  }, [selectedIds.size]);

  const backToList = useCallback(() => {
    setShowComparison(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    isCompareMode,
    showComparison,
    selectedIds,
    selectedCount: selectedIds.size,
    canViewComparison: selectedIds.size >= COMPARISON_MIN,
    toggleCompareMode,
    toggleSelection,
    isSelected,
    isSelectionDisabled,
    viewComparison,
    backToList,
    clearSelection,
  };
}

export type ComparisonSelection = ReturnType<typeof useComparisonSelection>;
