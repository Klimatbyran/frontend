import { CardGrid } from "@/components/layout/CardGrid";
import ListFilter from "@/components/explore/ListFilter";
import type { ComponentProps } from "react";
import { ListCard, type ListCardProps } from "./ListCard";

type ExploreEntityListProps = {
  items: ListCardProps[];
  filterProps: ComponentProps<typeof ListFilter>;
};

export function ExploreEntityList({
  items,
  filterProps,
}: ExploreEntityListProps) {
  return (
    <>
      <ListFilter {...filterProps} />
      <CardGrid
        items={items}
        itemContext={null}
        itemContent={(item) => <ListCard key={item.linkTo} {...item} />}
      />
    </>
  );
}
