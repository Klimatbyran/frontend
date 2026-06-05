import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";
import { ComparisonPickerDialog } from "./ComparisonPickerDialog";

interface ComparisonAddButtonProps {
  entityVariant?: ComparisonEntityVariant | null;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

function addEntityLabelKey(
  entityVariant: ComparisonEntityVariant | null | undefined,
): string {
  if (entityVariant) {
    return `explorePage.comparison.addEntity.${entityVariant}`;
  }
  return "explorePage.comparison.addEntity.default";
}

export function ComparisonAddButton({
  entityVariant: entityVariantProp,
  variant = "outline",
  size = "sm",
}: ComparisonAddButtonProps) {
  const { t } = useTranslation();
  const { variant: contextVariant } = useComparison();
  const [open, setOpen] = useState(false);
  const entityVariant = entityVariantProp ?? contextVariant;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {t(addEntityLabelKey(entityVariant))}
      </Button>
      <ComparisonPickerDialog
        open={open}
        onOpenChange={setOpen}
        entityVariant={entityVariant}
      />
    </>
  );
}
