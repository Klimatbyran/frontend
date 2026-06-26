import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

/** Shared class for the visualization slot — keep in sync with the list slot height */
export const OVERVIEW_VISUALIZATION_PANEL_CLASS = "relative min-w-0 h-full";

interface OverviewSplitLayoutProps {
  viewMode: OverviewViewMode;
  visualizationMode: OverviewViewMode;
  listMode?: OverviewViewMode;
  visualization: ReactNode;
  list: ReactNode;
}

export function OverviewSplitLayout({
  viewMode,
  visualizationMode,
  listMode = "list",
  visualization,
  list,
}: OverviewSplitLayoutProps) {
  const showBoth = viewMode !== visualizationMode && viewMode !== listMode;
  const showVisualization = showBoth || viewMode === visualizationMode;
  const showList = showBoth || viewMode === listMode;

  return (
    // Fixed height wrapper — both map and list fill this exactly, so no
    // layout shift when toggling between them.
    <div className="h-[65vh] md:h-[570px]">
      <div
        className={cn(
          "relative min-w-0 h-full",
          !showVisualization && "hidden",
        )}
      >
        {visualization}
      </div>
      <div
        className={cn("min-w-0 h-full overflow-y-auto", !showList && "hidden")}
      >
        {list}
      </div>
    </div>
  );
}
