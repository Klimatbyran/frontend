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
  /** Optional toggle rendered as an overlay in the top-left of the container */
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
    <div className="relative h-[65vh] md:h-[630px]">
      {toggle && (
        <div className="absolute top-3 left-3 z-[1000]">{toggle}</div>
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
        className={cn("min-w-0 h-full overflow-hidden", !showList && "hidden")}
      >
        {list}
      </div>
    </div>
  );
}
