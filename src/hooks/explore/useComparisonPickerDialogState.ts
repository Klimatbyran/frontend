import { useCallback, useRef } from "react";
import { useComparison } from "@/contexts/ComparisonContext";

interface UseComparisonPickerDialogStateOptions {
  onOpenChange: (open: boolean) => void;
  clearOnClose?: boolean;
}

export function useComparisonPickerDialogState({
  onOpenChange,
  clearOnClose = true,
}: UseComparisonPickerDialogStateOptions) {
  const { clearSelection } = useComparison();
  const navigatingToComparisonRef = useRef(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        navigatingToComparisonRef.current = false;
        onOpenChange(nextOpen);
        return;
      }

      if (clearOnClose && !navigatingToComparisonRef.current) {
        clearSelection();
      }

      onOpenChange(nextOpen);
    },
    [clearOnClose, clearSelection, onOpenChange],
  );

  const navigateToComparison = useCallback(() => {
    navigatingToComparisonRef.current = true;
    handleOpenChange(false);
  }, [handleOpenChange]);

  return {
    handleOpenChange,
    navigateToComparison,
  };
}
