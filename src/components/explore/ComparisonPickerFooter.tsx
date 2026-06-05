import { ComparisonActionBar } from "./ComparisonActionBar";

interface ComparisonPickerFooterProps {
  selectedCount: number;
  canViewComparison: boolean;
  showViewComparison: boolean;
  onClearSelection: () => void;
  onDone: () => void;
  onViewComparison: () => void;
}

export function ComparisonPickerFooter({
  selectedCount,
  canViewComparison,
  showViewComparison,
  onClearSelection,
  onDone,
  onViewComparison,
}: ComparisonPickerFooterProps) {
  return (
    <ComparisonActionBar
      className="border-t border-black-1 px-6 py-3"
      selectedCount={selectedCount}
      canViewComparison={canViewComparison}
      onClearSelection={onClearSelection}
      onDone={onDone}
      onViewComparison={onViewComparison}
      showClear={showViewComparison}
      showDone
      showViewComparison={showViewComparison}
    />
  );
}
