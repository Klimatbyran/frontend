import { forwardRef, ReactNode, useEffect, useRef } from "react";
import { VirtuosoGrid, Virtuoso } from "react-virtuoso";
import { useLocation } from "react-router-dom";
import { useScreenSize } from "@/hooks/useScreenSize";

const gridComponents = {
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children }, ref) => (
      <div
        ref={ref}
        style={style}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 lg:mt-0"
      >
        {children}
      </div>
    ),
  ),
  Item: ({ children }: React.HTMLAttributes<HTMLDivElement>) => children,
};

type CardGridProps<T, C> = {
  items: T[];
  itemContent: (data: T, context: C) => ReactNode;
  itemContext: C;
};

export function CardGrid<T, C>({
  items,
  itemContent,
  itemContext,
}: CardGridProps<T, C>) {
  const { isMobile } = useScreenSize();
  const location = useLocation();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const gridKey = location.pathname;

  if (isMobile) {
    return (
      <Virtuoso
        key={gridKey}
        data={items}
        context={itemContext}
        useWindowScroll
        style={{ height: "calc(100vh - 120px)" }}
        itemContent={(_index, item, context) => (
          <div className="mb-6">{itemContent(item, context)}</div>
        )}
      />
    );
  }

  return (
    <VirtuosoGrid
      key={gridKey}
      totalCount={items.length}
      data={items}
      context={itemContext}
      components={gridComponents}
      useWindowScroll
      itemContent={(_index, item, context) => itemContent(item, context)}
    />
  );
}
