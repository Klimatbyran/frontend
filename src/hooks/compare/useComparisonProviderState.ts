import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useLocation } from "react-router-dom";
import {
  canAddComparisonVariant,
  canViewComparisonSelection,
  EMPTY_COMPARISON_SELECTION,
  isComparisonSelected,
  isComparisonSelectionDisabled,
  toggleComparisonSelection,
  type ComparisonSelectionState,
} from "@/utils/explore/comparisonSelection";
import {
  clearNavigatingToComparison,
  isCompareRoute,
  markComparisonViewed,
  resetComparisonPickerAfterLeavingCompare,
  shouldResetComparisonAfterLeavingRoute,
  type ComparisonEntityVariant,
} from "@/utils/explore/comparisonUtils";

const STORAGE_KEY = "klimatkollen-comparison";

export interface ComparisonContextValue {
  selectedIds: string[];
  variant: ComparisonEntityVariant | null;
  selectedCount: number;
  canViewComparison: boolean;
  toggleSelection: (
    linkTo: string,
    entityVariant: ComparisonEntityVariant,
  ) => void;
  isSelected: (linkTo: string) => boolean;
  isSelectionDisabled: (linkTo: string) => boolean;
  clearSelection: () => void;
  canAddVariant: (entityVariant: ComparisonEntityVariant) => boolean;
}

function loadStored(): ComparisonSelectionState {
  if (typeof window === "undefined") {
    return EMPTY_COMPARISON_SELECTION;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_COMPARISON_SELECTION;
    }
    const parsed = JSON.parse(raw) as ComparisonSelectionState;
    return {
      selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [],
      variant: parsed.variant ?? null,
    };
  } catch {
    return EMPTY_COMPARISON_SELECTION;
  }
}

function persistStored(state: ComparisonSelectionState) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function removeStored() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
}

function useComparisonRouteSync(
  clearSelection: () => void,
  pathname: string,
  storedRef: MutableRefObject<ComparisonSelectionState>,
  prevPathRef: MutableRefObject<string>,
) {
  useLayoutEffect(() => {
    const previousPath = prevPathRef.current;
    const currentPath = pathname;

    if (isCompareRoute(currentPath)) {
      clearNavigatingToComparison();
      markComparisonViewed();
      if (storedRef.current.selectedIds.length > 0) {
        clearSelection();
      }
      prevPathRef.current = currentPath;
      return;
    }

    if (shouldResetComparisonAfterLeavingRoute(currentPath, previousPath)) {
      resetComparisonPickerAfterLeavingCompare(clearSelection);
    }

    prevPathRef.current = currentPath;
  }, [clearSelection, pathname, prevPathRef, storedRef]);
}

export function useComparisonProviderState(): ComparisonContextValue {
  const location = useLocation();
  const [stored, setStored] = useState(loadStored);
  const storedRef = useRef(stored);
  storedRef.current = stored;
  const prevPathRef = useRef(location.pathname);

  const clearSelection = useCallback(() => {
    removeStored();
    setStored(EMPTY_COMPARISON_SELECTION);
  }, []);

  useComparisonRouteSync(
    clearSelection,
    location.pathname,
    storedRef,
    prevPathRef,
  );

  const canAddVariant = useCallback(
    (entityVariant: ComparisonEntityVariant) =>
      canAddComparisonVariant(storedRef.current, entityVariant),
    [],
  );

  const toggleSelection = useCallback(
    (linkTo: string, entityVariant: ComparisonEntityVariant) => {
      setStored((current) => {
        const nextState = toggleComparisonSelection(
          current,
          linkTo,
          entityVariant,
        );
        if (!nextState) {
          return current;
        }

        persistStored(nextState);
        return nextState;
      });
    },
    [],
  );

  const isSelected = useCallback(
    (linkTo: string) => isComparisonSelected(storedRef.current, linkTo),
    [],
  );

  const isSelectionDisabled = useCallback(
    (linkTo: string) =>
      isComparisonSelectionDisabled(storedRef.current, linkTo),
    [],
  );

  return useMemo(
    (): ComparisonContextValue => ({
      selectedIds: stored.selectedIds,
      variant: stored.variant,
      selectedCount: stored.selectedIds.length,
      canViewComparison: canViewComparisonSelection(stored),
      toggleSelection,
      isSelected,
      isSelectionDisabled,
      clearSelection,
      canAddVariant,
    }),
    [
      canAddVariant,
      clearSelection,
      isSelected,
      isSelectionDisabled,
      stored,
      toggleSelection,
    ],
  );
}
