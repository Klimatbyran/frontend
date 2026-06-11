import { useCallback, useEffect } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import {
  isNavigatingToComparison,
  markNavigatingToComparison,
} from "@/utils/explore/comparisonUtils";

interface UseComparisonPickerDialogStateOptions {
  onOpenChange: (open: boolean) => void;
  clearOnClose?: boolean;
  /** When true, clears selection if the dialog unmounts while still open. */
  open: boolean;
}

export function useComparisonPickerDialogState({
  onOpenChange,
  clearOnClose = true,
  open,
}: UseComparisonPickerDialogStateOptions) {
  const { clearSelection } = useComparison();

  const clearIfAbandoned = useCallback(() => {
    if (clearOnClose && !isNavigatingToComparison()) {
      clearSelection();
    }
  }, [clearOnClose, clearSelection]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        clearIfAbandoned();
      }

      onOpenChange(nextOpen);
    },
    [clearIfAbandoned, onOpenChange],
  );

  const navigateToComparison = useCallback(() => {
    markNavigatingToComparison();
    handleOpenChange(false);
  }, [handleOpenChange]);

  // Closing via route change can unmount the dialog without a final onOpenChange.
  useEffect(() => {
    return () => {
      if (open) {
        clearIfAbandoned();
      }
    };
  }, [clearIfAbandoned, open]);

  return {
    handleOpenChange,
    navigateToComparison,
  };
}
