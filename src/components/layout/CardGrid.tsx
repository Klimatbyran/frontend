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
  const { isMobile } = useScreenSize();
  const location = useLocation();
  const isMountedRef = useRef(true);

  // Track mount state to prevent operations after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Use location pathname as key to force clean remount when navigating between pages
  // This prevents race conditions where react-virtuoso tries to manipulate DOM nodes
  // that React Router has already removed during navigation
  // Only use pathname (not search params) to avoid unnecessary remounts on filter changes
  const gridKey = location.pathname;

  // On mobile, using different grid settings to prevent scrolling errors
  if (isMobile) {
    return (
      <Virtuoso
        key={gridKey}
        data={items}
        useWindowScroll
        style={{ height: "calc(100vh - 120px)" }}
        itemContent={(_index, item) => (
          <div className="mb-6">{itemContent(item)}</div>
        )}
      />
    );
  }

  return (
    <VirtuosoGrid
      key={gridKey}
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
