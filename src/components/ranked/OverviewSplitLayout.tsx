import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const OVERVIEW_VISUALIZATION_PANEL_CLASS =
  "relative min-w-0 min-h-[65vh] md:min-h-[570px] h-full";

interface OverviewSplitLayoutProps {
  viewMode: string;
  visualizationMode: string;
  listMode?: string;
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
          viewMode !== listMode && "max-md:hidden",
        )}
      >
        {list}
      </div>
    </div>
  );
}
