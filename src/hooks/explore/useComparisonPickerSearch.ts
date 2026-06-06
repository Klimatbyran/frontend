import { useMemo } from "react";
import { CombinedData, useCombinedData } from "@/hooks/useCombinedData";
import { useHeroGlobalSearch } from "@/hooks/landing/useHeroGlobalSearch";
import { useComparison } from "@/contexts/ComparisonContext";
import { COMPARISON_SEARCH_CATEGORIES } from "@/components/explore/comparisonPicker.constants";
import {
  combinedDataToComparison,
  isComparableSearchResult,
  variantToCategory,
  type ComparisonEntityCategory,
  type ComparisonEntityVariant,
} from "@/utils/explore/comparisonUtils";

export type ComparisonPickerSearchGroup = {
  category: ComparisonEntityCategory;
  items: CombinedData[];
};

export function useComparisonPickerSearch(
  inputValue: string,
  entityVariant?: ComparisonEntityVariant | null,
) {
  const { isSelected } = useComparison();
  const { searchResults, isSearching, isDebouncing } = useHeroGlobalSearch(
    inputValue,
    { skipDiversityCap: true },
  );
  const { data: combinedData, loading: combinedLoading } = useCombinedData(
    searchResults,
    inputValue,
  );

  const allowedCategory = entityVariant
    ? variantToCategory(entityVariant)
    : null;

  const comparableData = useMemo(() => {
    const comparable = combinedData.filter(isComparableSearchResult);
    const categoryFiltered = allowedCategory
      ? comparable.filter((item) => item.category === allowedCategory)
      : comparable;

    return categoryFiltered.filter((item) => {
      const mapped = combinedDataToComparison(item);
      return mapped ? !isSelected(mapped.linkTo) : true;
    });
  }, [allowedCategory, combinedData, isSelected]);

  const groupedLists = useMemo((): ComparisonPickerSearchGroup[] => {
    return COMPARISON_SEARCH_CATEGORIES.map((category) => ({
      category,
      items: comparableData.filter((item) => item.category === category),
    })).filter(
      (group) =>
        group.items.length > 0 &&
        (!allowedCategory || group.category === allowedCategory),
    );
  }, [allowedCategory, comparableData]);

  const hasSearchQuery = inputValue.trim().length > 0;
  const isSearchPending = isSearching || isDebouncing || combinedLoading;
  const hasResults = groupedLists.some((group) => group.items.length > 0);

  return {
    groupedLists,
    hasSearchQuery,
    isSearchPending,
    hasResults,
    comparableDataLength: comparableData.length,
  };
}
