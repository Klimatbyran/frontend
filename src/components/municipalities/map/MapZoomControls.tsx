import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
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
