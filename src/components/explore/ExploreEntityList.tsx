import { CardGrid } from "@/components/layout/CardGrid";
import { useComparisonSelection } from "@/hooks/explore/useComparisonSelection";
import { useComparisonItems } from "@/hooks/explore/useComparisonItems";
import ListFilter from "@/components/explore/ListFilter";
import { PageLoading } from "@/components/pageStates/Loading";
import type { ComponentProps } from "react";
import { ListCard, type ListCardProps } from "./ListCard";
import { ComparisonView } from "./ComparisonView";
import { ComparisonControls } from "./ComparisonControls";

type ExploreEntityListProps = {
  items: ListCardProps[];
  filterProps: ComponentProps<typeof ListFilter>;
};

export function ExploreEntityList({
  items,
  filterProps,
}: ExploreEntityListProps) {
  const comparison = useComparisonSelection(items);
  const { items: comparisonItems, loading: comparisonLoading } =
    useComparisonItems();

  return (
    <>
      {!comparison.showComparison && (
        <ListFilter
          {...filterProps}
          hideListControls={comparison.isCompareMode}
          comparisonControls={<ComparisonControls comparison={comparison} />}
        />
      )}
      {comparison.showComparison ? (
        comparisonLoading ? (
          <PageLoading />
        ) : (
          <ComparisonView
            items={comparisonItems}
            onBack={comparison.backToList}
          />
        )
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
