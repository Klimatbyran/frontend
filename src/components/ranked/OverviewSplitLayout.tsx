import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OverviewViewMode = "map" | "list" | "graph";

/** Shared min-height for map/list panels — taller on mobile for better usability. */
export const OVERVIEW_PANEL_MIN_HEIGHT_CLASS =
  "min-h-[75dvh] md:min-h-[570px]";

export const OVERVIEW_VISUALIZATION_PANEL_CLASS = `relative min-w-0 h-full ${OVERVIEW_PANEL_MIN_HEIGHT_CLASS}`;

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div
        className={cn(
          OVERVIEW_VISUALIZATION_PANEL_CLASS,
          viewMode !== visualizationMode && "max-md:hidden",
        )}
      >
        {visualization}
      </div>
      <div
        className={cn(
          "min-w-0 h-full",
          OVERVIEW_PANEL_MIN_HEIGHT_CLASS,
          viewMode !== listMode && "max-md:hidden",
        )}
      >
        {list}
      </div>
    </div>
  );
}
