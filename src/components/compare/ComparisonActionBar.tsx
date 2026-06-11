import { cn } from "@/lib/utils";
import {
  ComparisonClearButton,
  ComparisonDoneButton,
  ComparisonSelectedCount,
  ComparisonViewButton,
} from "./ComparisonActions";

interface ComparisonActionBarProps {
  selectedCount: number;
  canViewComparison: boolean;
  onClearSelection?: () => void;
  onViewComparison?: () => void;
  onDone?: () => void;
  showClear?: boolean;
  showDone?: boolean;
  showViewComparison?: boolean;
  className?: string;
}

export function ComparisonActionBar({
  selectedCount,
  canViewComparison,
  onClearSelection,
  onViewComparison,
  onDone,
  showClear = false,
  showDone = false,
  showViewComparison = false,
  className,
}: ComparisonActionBarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <ComparisonSelectedCount count={selectedCount} />
      <div className="flex flex-wrap items-center gap-2">
        {showClear && onClearSelection && (
          <ComparisonClearButton
            onClick={onClearSelection}
            disabled={selectedCount === 0}
            hideWhenDisabled
          />
        )}
        {showDone && onDone && showViewComparison && (
          <ComparisonDoneButton onClick={onDone} variant="outline" />
        )}
        {showViewComparison && onViewComparison && (
          <ComparisonViewButton
            onClick={onViewComparison}
            disabled={!canViewComparison}
            size="sm"
          />
        )}
        {showDone && onDone && !showViewComparison && (
          <ComparisonDoneButton onClick={onDone} />
        )}
      </div>
    </div>
  );
}
