import { useTranslation } from "react-i18next";
import { GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";
import { useComparison } from "@/contexts/ComparisonContext";
import {
  COMPARISON_MAX,
  getComparisonViewSnapshot,
  isComparisonViewed,
} from "@/utils/explore/comparisonUtils";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";
import { useComparisonPickerTrigger } from "@/hooks/explore/useComparisonPickerTrigger";
import { ComparisonPickerDialog } from "./ComparisonPickerDialog";

interface ComparisonDetailChipProps {
  linkTo: string;
  variant: ComparisonEntityVariant;
  name?: string;
  className?: string;
}

export function ComparisonDetailChip({
  linkTo,
  variant,
  name,
  className,
}: ComparisonDetailChipProps) {
  const { t } = useTranslation();
  const { selectedCount, isSelected } = useComparison();
  const { openPicker, dialogProps } = useComparisonPickerTrigger({
    entityVariant: variant,
    prefillOnOpen: { linkTo, variant, name },
    showViewComparison: true,
    sheetOnMobile: true,
  });
  const isCurrentSelected = isSelected(linkTo);
  const compareViewPending =
    isComparisonViewed() || getComparisonViewSnapshot() !== null;
  const hasSelection = selectedCount > 0 && !compareViewPending;

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        aria-label={
          hasSelection
            ? t("explorePage.comparison.chipAriaWithCount", {
                count: selectedCount,
                max: COMPARISON_MAX,
              })
            : t("explorePage.comparison.compare")
        }
        className={cn(
          "inline-flex h-8 min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm leading-none transition-colors",
          hasSelection
            ? "border-blue-2 bg-blue-5/15 text-blue-2 hover:bg-blue-5/25"
            : "border-white/40 bg-transparent text-white hover:bg-white/10",
          className,
        )}
      >
        <GitCompareArrows className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium tabular-nums">
          {hasSelection
            ? `${selectedCount}/${COMPARISON_MAX}`
            : t("explorePage.comparison.compare")}
        </span>
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            hasSelection && isCurrentSelected ? "bg-blue-2" : "bg-transparent",
          )}
          aria-hidden
        />
      </button>
      <ComparisonPickerDialog {...dialogProps} />
    </>
  );
}
