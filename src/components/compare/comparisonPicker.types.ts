import type { ComparisonEntityVariant } from "@/utils/compare/comparisonUtils";

export type ComparisonPickerPrefill = {
  linkTo: string;
  variant: ComparisonEntityVariant;
  name?: string;
};

export interface ComparisonPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityVariant?: ComparisonEntityVariant | null;
  /** Auto-add this entity when the dialog opens (e.g. current detail page). */
  prefillOnOpen?: ComparisonPickerPrefill;
  /** Show clear + view comparison actions in the footer. */
  showViewComparison?: boolean;
  /** Use a bottom-sheet layout on small screens. */
  sheetOnMobile?: boolean;
  /** Clear comparison selection when the dialog is dismissed. */
  clearOnClose?: boolean;
}
