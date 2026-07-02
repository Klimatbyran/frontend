import { useEffect, useRef } from "react";
import type { ComparisonPickerPrefill } from "@/components/compare/comparisonPicker.types";

interface UseComparisonPickerPrefillOptions {
  open: boolean;
  prefillOnOpen?: ComparisonPickerPrefill;
  tryToggleSelection: (
    linkTo: string,
    variant: ComparisonPickerPrefill["variant"],
  ) => boolean;
  isSelected: (linkTo: string) => boolean;
}

export function useComparisonPickerPrefill({
  open,
  prefillOnOpen,
  tryToggleSelection,
  isSelected,
}: UseComparisonPickerPrefillOptions) {
  const prefillAppliedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      prefillAppliedRef.current = false;
      return;
    }

    if (!prefillOnOpen || prefillAppliedRef.current) {
      return;
    }

    prefillAppliedRef.current = true;

    if (isSelected(prefillOnOpen.linkTo)) {
      return;
    }

    tryToggleSelection(prefillOnOpen.linkTo, prefillOnOpen.variant);
  }, [isSelected, open, prefillOnOpen, tryToggleSelection]);
}
