import { useTranslation } from "react-i18next";
import { CombinedData } from "@/hooks/useCombinedData";
import { CommandItem } from "@/components/ui/command";
import type { ComparisonPickerSearchGroup } from "@/hooks/explore/useComparisonPickerSearch";
import { combinedDataToComparison } from "@/utils/explore/comparisonUtils";
import { ComparisonPickerRow } from "./ComparisonPickerRow";

interface ComparisonPickerSearchResultsProps {
  groupedLists: ComparisonPickerSearchGroup[];
  showRowTypeLabels: boolean;
  isSearchPending: boolean;
  isSelected: (linkTo: string) => boolean;
  isSelectionDisabled: (linkTo: string) => boolean;
  onSelect: (item: CombinedData) => void;
}

export function ComparisonPickerSearchResults({
  groupedLists,
  showRowTypeLabels,
  isSearchPending,
  isSelected,
  isSelectionDisabled,
  onSelect,
}: ComparisonPickerSearchResultsProps) {
  const { t } = useTranslation();

  if (isSearchPending) {
    return null;
  }

  return (
    <>
      {groupedLists.map(({ category, items }) =>
        items.map((item) => {
          const mapped = combinedDataToComparison(item);
          const selected = mapped ? isSelected(mapped.linkTo) : false;
          const disabled =
            mapped !== null && !selected && isSelectionDisabled(mapped.linkTo);

          return (
            <CommandItem
              key={`${category}-${item.id}`}
              value={`${item.name}-${item.id}`}
              disabled={disabled}
              onSelect={() => onSelect(item)}
              className="px-4 py-2.5"
            >
              <ComparisonPickerRow
                name={item.name}
                selected={selected}
                typeLabel={
                  showRowTypeLabels
                    ? t(
                        item.category === "companies"
                          ? "globalSearch.searchCategoryCompany"
                          : item.category === "municipalities"
                            ? "globalSearch.searchCategoryMunicipality"
                            : "globalSearch.searchCategoryRegion",
                      )
                    : undefined
                }
              />
            </CommandItem>
          );
        }),
      )}
    </>
  );
}
