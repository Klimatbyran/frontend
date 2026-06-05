import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COMPARISON_MAX,
  COMPARISON_MIN,
  isSameComparisonLink,
  type ComparisonEntityVariant,
} from "@/utils/explore/comparisonUtils";

const STORAGE_KEY = "klimatkollen-comparison";

interface StoredComparison {
  selectedIds: string[];
  variant: ComparisonEntityVariant | null;
}

interface ComparisonContextValue {
  selectedIds: Set<string>;
  variant: ComparisonEntityVariant | null;
  selectedCount: number;
  canViewComparison: boolean;
  toggleSelection: (linkTo: string, entityVariant: ComparisonEntityVariant) => void;
  isSelected: (linkTo: string) => boolean;
  isSelectionDisabled: (linkTo: string) => boolean;
  clearSelection: () => void;
  canAddVariant: (entityVariant: ComparisonEntityVariant) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

function loadStored(): StoredComparison {
  if (typeof window === "undefined") {
    return { selectedIds: [], variant: null };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { selectedIds: [], variant: null };
    }
    const parsed = JSON.parse(raw) as StoredComparison;
    return {
      selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [],
      variant: parsed.variant ?? null,
    };
  } catch {
    return { selectedIds: [], variant: null };
  }
}

function persistStored(selectedIds: Set<string>, variant: ComparisonEntityVariant | null) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredComparison = {
    selectedIds: [...selectedIds],
    variant,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(loadStored);

  const selectedIds = useMemo(() => new Set(stored.selectedIds), [stored.selectedIds]);

  const updateStored = useCallback(
    (nextIds: Set<string>, nextVariant: ComparisonEntityVariant | null) => {
      const payload = {
        selectedIds: [...nextIds],
        variant: nextVariant,
      };
      setStored(payload);
      persistStored(nextIds, nextVariant);
    },
    [],
  );

  const clearSelection = useCallback(() => {
    updateStored(new Set(), null);
  }, [updateStored]);

  const canAddVariant = useCallback(
    (entityVariant: ComparisonEntityVariant) => {
      return stored.variant === null || stored.variant === entityVariant;
    },
    [stored.variant],
  );

  const toggleSelection = useCallback(
    (linkTo: string, entityVariant: ComparisonEntityVariant) => {
      const next = new Set(selectedIds);
      const existing = [...next].find((id) => isSameComparisonLink(id, linkTo));

      if (existing) {
        next.delete(existing);
        updateStored(next, next.size === 0 ? null : stored.variant);
        return;
      }

      if (!canAddVariant(entityVariant) || next.size >= COMPARISON_MAX) {
        return;
      }

      next.add(linkTo);
      updateStored(next, entityVariant);
    },
    [canAddVariant, selectedIds, stored.variant, updateStored],
  );

  const isSelected = useCallback(
    (linkTo: string) =>
      [...selectedIds].some((id) => isSameComparisonLink(id, linkTo)),
    [selectedIds],
  );

  const isSelectionDisabled = useCallback(
    (linkTo: string) =>
      selectedIds.size >= COMPARISON_MAX && !isSelected(linkTo),
    [isSelected, selectedIds.size],
  );

  const value = useMemo(
    (): ComparisonContextValue => ({
      selectedIds,
      variant: stored.variant,
      selectedCount: selectedIds.size,
      canViewComparison: selectedIds.size >= COMPARISON_MIN,
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
      selectedIds,
      stored.variant,
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
