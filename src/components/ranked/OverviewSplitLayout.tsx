import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

const VISUALIZATION_PANEL_CLASS = "relative min-w-0 h-full";

/** Mobile viewport fraction and fixed desktop pixel height for the map/list panel */
export const OVERVIEW_PANEL_HEIGHT = "h-[85vh] md:h-[680px]" as const;

interface OverviewSplitLayoutProps {
  viewMode: OverviewViewMode;
  visualizationMode: OverviewViewMode;
  listMode?: OverviewViewMode;
  visualization: ReactNode;
  list: ReactNode;
  /** Map/list toggle — above the active panel on all screen sizes */
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
      {toggle && (showVisualization || showList) && (
        <div className="shrink-0 mb-3">{toggle}</div>
      )}
      <div className="flex-1 relative min-h-0">
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
