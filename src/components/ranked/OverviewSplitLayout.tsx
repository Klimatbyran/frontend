import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

const VISUALIZATION_PANEL_CLASS = "relative min-w-0 h-full";

/** Mobile viewport fraction and fixed desktop pixel height for the map/list panel */
export const OVERVIEW_PANEL_HEIGHT = "h-[85vh] md:h-[632px]" as const;

interface OverviewSplitLayoutProps {
  viewMode: OverviewViewMode;
  visualizationMode: OverviewViewMode;
  listMode?: OverviewViewMode;
  visualization: ReactNode;
  list: ReactNode;
  /** Map/list toggle — overlaid on mobile, top-right on desktop map view */
  toggle?: ReactNode;
}

export function OverviewSplitLayout({
  viewMode,
  visualizationMode,
  listMode = "list",
  visualization,
  list,
  toggle,
}: OverviewSplitLayoutProps) {
  const showBoth = viewMode !== visualizationMode && viewMode !== listMode;
  const showVisualization = showBoth || viewMode === visualizationMode;
  const showList = showBoth || viewMode === listMode;

  // When the visualization panel becomes visible again, Leaflet needs to
  // recalculate its dimensions. Dispatching a resize event triggers
  // Leaflet's built-in invalidateSize listener.
  useEffect(() => {
    if (showVisualization) {
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
  }, [showVisualization]);

  return (
    // Fixed height wrapper — both map and list fill this exactly, so no
    // layout shift when toggling between them.
    <div className={`flex flex-col ${OVERVIEW_PANEL_HEIGHT}`}>
      <div className="flex-1 relative min-h-0">
        {toggle && showVisualization && (
          <div className="absolute top-4 left-4 right-16 md:top-[20px] md:right-4 md:left-auto z-40">
            {toggle}
          </div>
        )}
        {toggle && showList && !showVisualization && (
          <div className="absolute top-4 left-4 right-4 z-40 md:hidden">
            {toggle}
          </div>
        )}
        <div
          className={cn(
            VISUALIZATION_PANEL_CLASS,
            !showVisualization && "hidden",
          )}
        >
          {visualization}
        </div>
        <div
          className={cn(
            "min-w-0 h-full overflow-hidden",
            !showList && "hidden",
          )}
        >
          {list}
        </div>
      </div>
    </div>
  );
}
