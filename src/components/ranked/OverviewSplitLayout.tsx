import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

export const OVERVIEW_VISUALIZATION_PANEL_CLASS =
  "relative min-w-0 min-h-[65vh] md:min-h-[570px] h-full";

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
    <div
      className={cn(
        "grid gap-6 items-stretch",
        showVisualization && showList
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1",
      )}
    >
      <div
        className={cn(
          OVERVIEW_VISUALIZATION_PANEL_CLASS,
          !showVisualization && "hidden",
        )}
      >
        {visualization}
      </div>
      <div className={cn("min-w-0 h-full", !showList && "hidden")}>{list}</div>
    </div>
  );
}
