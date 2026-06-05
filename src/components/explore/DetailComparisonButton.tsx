import { useTranslation } from "react-i18next";
import { GitCompareArrows, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/contexts/ToastContext";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";

interface DetailComparisonButtonProps {
  linkTo: string;
  variant: ComparisonEntityVariant;
}

export function DetailComparisonButton({
  linkTo,
  variant,
}: DetailComparisonButtonProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSelected, isSelectionDisabled, toggleSelection, canAddVariant } =
    useComparison();

  const selected = isSelected(linkTo);
  const disabled = !selected && isSelectionDisabled(linkTo);

  const handleClick = () => {
    if (!selected && !canAddVariant(variant)) {
      showToast(
        t("explorePage.comparison.variantMismatchTitle"),
        t("explorePage.comparison.variantMismatchMessage"),
      );
      return;
    }

    toggleSelection(linkTo, variant);
  };

  const label = selected
    ? t("explorePage.comparison.addedToComparison")
    : t("explorePage.comparison.compare");

  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={handleClick}
      className="h-8 w-fit shrink-0 gap-1.5 px-2.5 text-xs sm:px-3 sm:text-sm"
    >
      {selected ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <GitCompareArrows className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </Button>
  );
}
