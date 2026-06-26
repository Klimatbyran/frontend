import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

const VISUALIZATION_PANEL_CLASS = "relative min-w-0 h-full";

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
    <div className="h-[65vh] md:h-[630px]">
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
