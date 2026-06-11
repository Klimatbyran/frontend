import { AiIcon } from "@/components/ui/ai-icon";
import { cn } from "@/lib/utils";
import type { ComparisonCellValue } from "@/hooks/compare/useComparisonMetrics";

interface ComparisonCellProps {
  value: ComparisonCellValue;
  compact?: boolean;
  align?: "start" | "end";
}

export function ComparisonCell({
  value,
  compact = false,
  align = "start",
}: ComparisonCellProps) {
  const showBadge = value.displayAsBadge;

  return (
    <div
      className={cn(
        compact ? "" : "py-3 px-4",
        align === "end" && "text-right",
      )}
    >
      <div
        className={cn(
          "font-light",
          compact ? "text-base" : "text-lg",
          align === "end" && showBadge && "ml-auto",
          showBadge &&
            "inline-flex items-center rounded-full px-3 py-1 text-sm",
          showBadge &&
            value.colorClass === "text-green-3" &&
            "bg-green-3/15 text-green-3",
          showBadge &&
            value.colorClass === "text-pink-3" &&
            "bg-pink-3/15 text-pink-3",
          showBadge &&
            value.colorClass === "text-grey" &&
            "bg-white/10 text-grey",
          !showBadge && value.colorClass,
        )}
      >
        <span>{value.text}</span>
        {value.isAIGenerated && (
          <span className="ml-2 inline-flex">
            <AiIcon size="sm" />
          </span>
        )}
      </div>
      {value.unit && (
        <p className={cn("text-grey mt-1", compact ? "text-xs" : "text-sm")}>
          {value.unit}
        </p>
      )}
    </div>
  );
}
