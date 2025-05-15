import { forwardRef, ReactNode } from "react";
import { VirtuosoGrid } from "react-virtuoso";

const gridComponents = {
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children }, ref) => (
      <div
        ref={ref}
        style={style}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 md:mt-0"
      >
        {children}
      </div>
    ),
  ),
  Item: ({ children }: React.HTMLAttributes<HTMLDivElement>) => children,
};

type CardGridProps<T> = {
  items: T[];
  itemContent: (data: T) => ReactNode;
};

export function CardGrid<T>({ items, itemContent }: CardGridProps<T>) {
  return (
    <VirtuosoGrid
      totalCount={items.length}
      data={items}
      components={gridComponents}
      useWindowScroll
      itemContent={(_index, item) => {
        return itemContent(item);
      }}
    />
  );
}
