import { useTranslation } from "react-i18next";
import type { ListCardProps } from "@/components/explore/ListCard";
import { COMPARISON_MAX } from "@/utils/explore/comparisonUtils";
import type { ComparisonEntityVariant } from "@/utils/explore/comparisonUtils";
import { ComparisonPickerRow } from "./ComparisonPickerRow";

interface ComparisonPickerSelectedSectionProps {
  selectedCount: number;
  selectedItems: ListCardProps[];
  loading: boolean;
  activeVariant: ComparisonEntityVariant | null;
  onToggle: (linkTo: string, variant: ComparisonEntityVariant) => void;
}

export function ComparisonPickerSelectedSection({
  selectedCount,
  selectedItems,
  loading,
  activeVariant,
  onToggle,
}: ComparisonPickerSelectedSectionProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-black-1 pb-2 pt-3">
      <p className="pb-1.5 text-sm text-grey">
        {t("explorePage.comparison.pickerSelectedHeading", {
          count: selectedCount,
          max: COMPARISON_MAX,
        })}
      </p>
      {loading ? (
        <p className="text-grey text-sm">
          {t("explorePage.comparison.pickerLoading")}
        </p>
      ) : (
        <div className="space-y-0.5">
          {selectedItems.map((item) => (
            <button
              key={item.linkTo}
              type="button"
              className="flex min-h-10 w-full rounded-sm px-2 py-2 text-left hover:bg-black-1"
              onClick={() =>
                activeVariant && onToggle(item.linkTo, activeVariant)
              }
            >
              <ComparisonPickerRow name={item.name} selected />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
