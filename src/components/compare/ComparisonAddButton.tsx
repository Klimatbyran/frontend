import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { getComparisonCopyKey } from "@/utils/compare/comparisonCopy";
import type { ComparisonEntityVariant } from "@/utils/compare/comparisonUtils";
import { useComparisonPickerTrigger } from "@/hooks/compare/useComparisonPickerTrigger";
import { ComparisonPickerDialog } from "./ComparisonPickerDialog";

interface ComparisonAddButtonProps {
  entityVariant?: ComparisonEntityVariant | null;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ComparisonAddButton({
  entityVariant: entityVariantProp,
  variant = "outline",
  size = "sm",
}: ComparisonAddButtonProps) {
  const { t } = useTranslation();
  const { variant: contextVariant } = useComparison();
  const entityVariant = entityVariantProp ?? contextVariant;
  const { openPicker, dialogProps } = useComparisonPickerTrigger({
    entityVariant,
  });

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className="gap-2"
        onClick={openPicker}
      >
        <Plus className="h-4 w-4" />
        {t(getComparisonCopyKey("addEntity", entityVariant))}
      </Button>
      <ComparisonPickerDialog {...dialogProps} />
    </>
  );
}
