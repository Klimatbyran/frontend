import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/contexts/ToastContext";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";
import { getTryToggleComparisonFailure } from "@/utils/explore/comparisonSelection";

export function useComparisonPickerToggle() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    selectedIds,
    variant,
    toggleSelection,
    isSelected,
    isSelectionDisabled,
  } = useComparison();

  const showVariantMismatchToast = useCallback(() => {
    showToast(
      t("explorePage.comparison.variantMismatchTitle"),
      t("explorePage.comparison.variantMismatchMessage"),
    );
  }, [showToast, t]);

  const tryToggleSelection = useCallback(
    (linkTo: string, itemVariant: ComparisonEntityVariant): boolean => {
      const failure = getTryToggleComparisonFailure(
        { selectedIds, variant },
        linkTo,
        itemVariant,
      );

      if (failure === "variant_mismatch") {
        showVariantMismatchToast();
        return false;
      }

      if (failure === "max_reached") {
        return false;
      }

      toggleSelection(linkTo, itemVariant);
      return true;
    },
    [selectedIds, showVariantMismatchToast, toggleSelection, variant],
  );

  return {
    isSelected,
    isSelectionDisabled,
    tryToggleSelection,
  };
}
