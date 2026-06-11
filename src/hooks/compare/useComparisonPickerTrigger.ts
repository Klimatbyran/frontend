import { useState } from "react";
import type { ComparisonPickerDialogProps } from "@/components/compare/comparisonPicker.types";

type ComparisonPickerConfig = Omit<
  ComparisonPickerDialogProps,
  "open" | "onOpenChange"
>;

export function useComparisonPickerTrigger(config: ComparisonPickerConfig) {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    openPicker: () => setOpen(true),
    dialogProps: {
      ...config,
      open,
      onOpenChange: setOpen,
    } satisfies ComparisonPickerDialogProps,
  };
}
