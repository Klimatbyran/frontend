import { CardGrid } from "@/components/layout/CardGrid";
import { useComparisonSelection } from "@/hooks/explore/useComparisonSelection";
import ListFilter from "@/components/explore/ListFilter";
import type { ComponentProps } from "react";
import { ListCard, type ListCardProps } from "./ListCard";
import { ComparisonView } from "./ComparisonView";
import { ComparisonControls } from "./ComparisonControls";

type ExploreEntityListProps = {
  items: ListCardProps[];
  /** Full unfiltered set used to resolve selected items in comparison view */
  allItems?: ListCardProps[];
  filterProps: ComponentProps<typeof ListFilter>;
};

export function ExploreEntityList({
  items,
  allItems,
  filterProps,
}: ExploreEntityListProps) {
  const comparison = useComparisonSelection(items);

  const itemLookup = allItems ?? items;
  const selectedItems = itemLookup.filter((item) =>
    comparison.selectedIds.has(item.linkTo),
  );

  return (
    <>
      <ListFilter
        {...filterProps}
        comparisonControls={<ComparisonControls comparison={comparison} />}
      />
      {comparison.showComparison ? (
        <ComparisonView items={selectedItems} onBack={comparison.backToList} />
      ) : (
        <CardGrid
          items={items}
          itemContent={(transformedData) => (
            <ListCard
              key={transformedData.linkTo}
              {...transformedData}
              comparisonMode={comparison.isCompareMode}
              selected={comparison.isSelected(transformedData.linkTo)}
              onSelect={() =>
                comparison.toggleSelection(transformedData.linkTo)
              }
              selectionDisabled={comparison.isSelectionDisabled(
                transformedData.linkTo,
              )}
            />
          )}
        />
      )}
    </>
  );
}
