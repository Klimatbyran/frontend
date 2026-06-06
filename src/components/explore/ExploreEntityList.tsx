import { CardGrid } from "@/components/layout/CardGrid";
import { useComparisonSelection } from "@/hooks/explore/useComparisonSelection";
import ListFilter from "@/components/explore/ListFilter";
import type { ComponentProps } from "react";
import { ListCard, type ListCardProps } from "./ListCard";
import { ComparisonActiveBar, ComparisonToggle } from "./ComparisonControls";

type ExploreEntityListProps = {
  items: ListCardProps[];
  filterProps: ComponentProps<typeof ListFilter>;
};

export function ExploreEntityList({
  items,
  filterProps,
}: ExploreEntityListProps) {
  const comparison = useComparisonSelection(items);

  return (
    <>
      <ListFilter
        {...filterProps}
        comparisonToggle={<ComparisonToggle comparison={comparison} />}
        comparisonActiveBar={
          comparison.isCompareMode ? (
            <ComparisonActiveBar comparison={comparison} />
          ) : null
        }
      />
      <CardGrid
        items={items}
        itemContext={null}
        itemContent={(transformedData) => (
          <ListCard
            key={transformedData.linkTo}
            {...transformedData}
            comparisonMode={comparison.isCompareMode}
            selected={comparison.isSelected(transformedData.linkTo)}
            onSelect={() => comparison.toggleSelection(transformedData.linkTo)}
            selectionDisabled={comparison.isSelectionDisabled(
              transformedData.linkTo,
            )}
          />
        )}
      />
    </>
  );
}
