import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapLegendPosition } from "./MapLegend";

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
  legendPosition = "bottom-right",
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  legendPosition?: MapLegendPosition;
}) {
  return (
    <div
      className={cn(
        "absolute flex flex-col gap-2",
        // Mobile: keep clear of the top-left tooltip and overview view toggle.
        "top-14 right-4",
        // Desktop: place controls in the corner opposite the legend.
        legendPosition === "bottom-right" &&
          "md:top-auto md:right-auto md:bottom-4 md:left-4",
        legendPosition === "bottom-left" &&
          "md:top-4 md:right-auto md:bottom-auto md:left-4",
      )}
    >
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Zoom in"
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
      >
        <ZoomIn className="w-5 h-5 text-white/70" />
      </button>
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Zoom out"
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
      >
        <ZoomOut className="w-5 h-5 text-white/70" />
      </button>
      <button
        onClick={onReset}
        aria-label="Reset"
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors"
      >
        <RotateCcw className="w-5 h-5 text-white/70" />
      </button>
    </div>
  );
}
