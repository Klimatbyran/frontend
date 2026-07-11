import { useTranslation } from "react-i18next";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  COMPARISON_MAX,
  COMPARISON_MIN,
} from "@/utils/compare/comparisonUtils";

export function ComparisonSelectedCount({ count }: { count: number }) {
  const { t } = useTranslation();

  return (
    <span className="text-grey text-sm">
      {t("explorePage.comparison.selected", {
        count,
        min: COMPARISON_MIN,
        max: COMPARISON_MAX,
      })}
    </span>
  );
}

export function ComparisonClearButton({
  onClick,
  disabled = false,
  hideWhenDisabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  hideWhenDisabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(hideWhenDisabled && disabled && "invisible")}
    >
      {t("explorePage.comparison.clearSelection")}
    </Button>
  );
}

export function ComparisonViewButton({
  onClick,
  disabled,
  size = "default",
}: {
  onClick: () => void;
  disabled: boolean;
  size?: "default" | "sm";
}) {
  const { t } = useTranslation();

  return (
    <Button
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "gap-2 font-medium",
        !disabled && "bg-blue-5 text-white hover:bg-blue-6 hover:opacity-100",
      )}
    >
      <GitCompareArrows className="h-4 w-4" />
      {t("explorePage.comparison.viewComparison")}
    </Button>
  );
}

export function ComparisonDoneButton({
  onClick,
  variant = "default",
}: {
  onClick: () => void;
  variant?: "default" | "outline";
}) {
  const { t } = useTranslation();

  return (
    <Button variant={variant} size="sm" onClick={onClick}>
      {t("explorePage.comparison.pickerDone")}
    </Button>
  );
}
