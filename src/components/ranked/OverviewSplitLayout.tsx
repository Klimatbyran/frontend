import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

const VISUALIZATION_PANEL_CLASS = "relative min-w-0 h-full";

interface OverviewSplitLayoutProps {
  viewMode: OverviewViewMode;
  visualizationMode: OverviewViewMode;
  listMode?: OverviewViewMode;
  visualization: ReactNode;
  list: ReactNode;
  /** Rendered as a full-width header row above both map and list panels */
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
    <div className="flex flex-col h-[75vh] md:h-[630px]">
      <div className="flex-1 relative min-h-0">
        {/* Toggle overlaid on map/graph (no space taken, no background) */}
        {toggle && showVisualization && (
          <div className="absolute top-4 md:top-[19px] left-4 right-4 md:left-auto z-40">
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
