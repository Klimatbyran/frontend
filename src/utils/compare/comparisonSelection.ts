import {
  COMPARISON_MAX,
  COMPARISON_MIN,
  isSameComparisonLink,
  type ComparisonEntityVariant,
} from "@/utils/explore/comparisonUtils";

export interface ComparisonSelectionState {
  selectedIds: string[];
  variant: ComparisonEntityVariant | null;
}

export const EMPTY_COMPARISON_SELECTION: ComparisonSelectionState = {
  selectedIds: [],
  variant: null,
};

export function canAddComparisonVariant(
  state: ComparisonSelectionState,
  entityVariant: ComparisonEntityVariant,
): boolean {
  return state.variant === null || state.variant === entityVariant;
}

export function isComparisonSelected(
  state: ComparisonSelectionState,
  linkTo: string,
): boolean {
  return state.selectedIds.some((id) => isSameComparisonLink(id, linkTo));
}

export function isComparisonSelectionDisabled(
  state: ComparisonSelectionState,
  linkTo: string,
): boolean {
  return (
    state.selectedIds.length >= COMPARISON_MAX &&
    !isComparisonSelected(state, linkTo)
  );
}

export function canViewComparisonSelection(
  state: ComparisonSelectionState,
): boolean {
  return state.selectedIds.length >= COMPARISON_MIN;
}

export function toggleComparisonSelection(
  state: ComparisonSelectionState,
  linkTo: string,
  entityVariant: ComparisonEntityVariant,
): ComparisonSelectionState | null {
  const existing = state.selectedIds.find((id) =>
    isSameComparisonLink(id, linkTo),
  );

  if (existing) {
    const nextIds = state.selectedIds.filter((id) => id !== existing);
    return {
      selectedIds: nextIds,
      variant: nextIds.length === 0 ? null : state.variant,
    };
  }

  if (
    !canAddComparisonVariant(state, entityVariant) ||
    state.selectedIds.length >= COMPARISON_MAX
  ) {
    return null;
  }

  return {
    selectedIds: [...state.selectedIds, linkTo],
    variant: entityVariant,
  };
}

export type TryToggleComparisonResult =
  | { ok: true; state: ComparisonSelectionState }
  | { ok: false; reason: "variant_mismatch" | "max_reached" };

export function getTryToggleComparisonFailure(
  state: ComparisonSelectionState,
  linkTo: string,
  itemVariant: ComparisonEntityVariant,
): TryToggleComparisonResult["reason"] | null {
  const selected = isComparisonSelected(state, linkTo);

  if (!selected && !canAddComparisonVariant(state, itemVariant)) {
    return "variant_mismatch";
  }

  if (isComparisonSelectionDisabled(state, linkTo)) {
    return "max_reached";
  }

  return null;
}

export function tryToggleComparisonSelection(
  state: ComparisonSelectionState,
  linkTo: string,
  itemVariant: ComparisonEntityVariant,
): TryToggleComparisonResult {
  const failure = getTryToggleComparisonFailure(state, linkTo, itemVariant);
  if (failure) {
    return { ok: false, reason: failure };
  }

  const nextState = toggleComparisonSelection(state, linkTo, itemVariant);
  if (!nextState) {
    return { ok: false, reason: "max_reached" };
  }

  return { ok: true, state: nextState };
}
