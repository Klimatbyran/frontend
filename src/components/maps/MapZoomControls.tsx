import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { MapLegendPosition } from "./MapLegend";

export type MapZoomControlsPosition =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

const DESKTOP_POSITION_CLASSES: Record<MapZoomControlsPosition, string> = {
  "bottom-left": "md:top-auto md:right-auto md:bottom-4 md:left-4",
  "bottom-right": "md:top-auto md:left-auto md:bottom-4 md:right-4",
  "top-left": "md:top-4 md:right-auto md:bottom-auto md:left-4",
  "top-right": "md:top-4 md:left-auto md:bottom-auto md:right-4",
};

function resolveZoomControlsPosition(
  position: MapZoomControlsPosition | undefined,
  legendPosition: MapLegendPosition,
): MapZoomControlsPosition {
  if (position) return position;
  // Place controls in the corner opposite the legend.
  return legendPosition === "bottom-right" ? "bottom-left" : "top-left";
}

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
  position,
  legendPosition = "bottom-right",
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  position?: MapZoomControlsPosition;
  legendPosition?: MapLegendPosition;
}) {
  const { t } = useTranslation();
  const resolvedPosition = resolveZoomControlsPosition(
    position,
    legendPosition,
  );

  return (
    <div
      className={cn(
        "absolute flex flex-col gap-2",
        // Mobile: keep clear of the top-left tooltip and overview view toggle.
        "top-14 right-4",
        DESKTOP_POSITION_CLASSES[resolvedPosition],
      )}
    >
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label={t("mapControls.zoomIn")}
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
      >
        <ZoomIn className="w-5 h-5 text-white/70" />
      </button>
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label={t("mapControls.zoomOut")}
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
      >
        <ZoomOut className="w-5 h-5 text-white/70" />
      </button>
      <button
        onClick={onReset}
        aria-label={t("mapControls.reset")}
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors"
      >
        <RotateCcw className="w-5 h-5 text-white/70" />
      </button>
    </div>
  );
}
