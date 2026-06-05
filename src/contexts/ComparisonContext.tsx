import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";
import {
  canAddComparisonVariant,
  canViewComparisonSelection,
  EMPTY_COMPARISON_SELECTION,
  isComparisonSelected,
  isComparisonSelectionDisabled,
  toggleComparisonSelection,
  type ComparisonSelectionState,
} from "@/utils/explore/comparisonSelection";

const STORAGE_KEY = "klimatkollen-comparison";

interface ComparisonContextValue {
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

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

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

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(loadStored);

  const updateStored = useCallback((nextState: ComparisonSelectionState) => {
    setStored(nextState);
    persistStored(nextState);
  }, []);

  const clearSelection = useCallback(() => {
    updateStored(EMPTY_COMPARISON_SELECTION);
  }, [updateStored]);

  const canAddVariant = useCallback(
    (entityVariant: ComparisonEntityVariant) =>
      canAddComparisonVariant(stored, entityVariant),
    [stored],
  );

  const toggleSelection = useCallback(
    (linkTo: string, entityVariant: ComparisonEntityVariant) => {
      const nextState = toggleComparisonSelection(
        stored,
        linkTo,
        entityVariant,
      );
      if (nextState) {
        updateStored(nextState);
      }
    },
    [stored, updateStored],
  );

  const isSelected = useCallback(
    (linkTo: string) => isComparisonSelected(stored, linkTo),
    [stored],
  );

  const isSelectionDisabled = useCallback(
    (linkTo: string) => isComparisonSelectionDisabled(stored, linkTo),
    [stored],
  );

  const value = useMemo(
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

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
