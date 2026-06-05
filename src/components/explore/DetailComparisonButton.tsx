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
  const {
    isSelected,
    isSelectionDisabled,
    toggleSelection,
    canAddVariant,
  } = useComparison();

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

  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={handleClick}
      className="gap-2 shrink-0"
    >
      {selected ? (
        <Check className="w-4 h-4" />
      ) : (
        <GitCompareArrows className="w-4 h-4" />
      )}
      {selected
        ? t("explorePage.comparison.addedToComparison")
        : t("explorePage.comparison.addToComparison")}
    </Button>
  );
}
