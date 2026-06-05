import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/contexts/ToastContext";
import type { ComparisonPickerPrefill } from "@/components/explore/comparisonPicker.types";
import { COMPARISON_MAX } from "@/utils/explore/comparisonUtils";

interface UseComparisonPickerPrefillOptions {
  open: boolean;
  prefillOnOpen?: ComparisonPickerPrefill;
  tryToggleSelection: (linkTo: string, variant: ComparisonPickerPrefill["variant"]) => boolean;
  isSelected: (linkTo: string) => boolean;
}

export function useComparisonPickerPrefill({
  open,
  prefillOnOpen,
  tryToggleSelection,
  isSelected,
}: UseComparisonPickerPrefillOptions) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { selectedCount } = useComparison();
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

    const added = tryToggleSelection(
      prefillOnOpen.linkTo,
      prefillOnOpen.variant,
    );

    if (added && prefillOnOpen.name) {
      showToast(
        t("explorePage.comparison.addedToastTitle"),
        t("explorePage.comparison.addedToastMessage", {
          name: prefillOnOpen.name,
          count: selectedCount + 1,
          max: COMPARISON_MAX,
        }),
      );
    }
  }, [
    isSelected,
    open,
    prefillOnOpen,
    selectedCount,
    showToast,
    t,
    tryToggleSelection,
  ]);
}
