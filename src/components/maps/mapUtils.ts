import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";

export type FitBoundsPadding =
  | L.FitBoundsOptions["padding"]
  | readonly number[]
  | Pick<
      L.FitBoundsOptions,
      "padding" | "paddingTopLeft" | "paddingBottomRight"
    >;

function isCornerPadding(
  padding: Exclude<FitBoundsPadding, undefined>,
): padding is Pick<
  L.FitBoundsOptions,
  "padding" | "paddingTopLeft" | "paddingBottomRight"
> {
  return (
    !Array.isArray(padding) &&
    ("padding" in padding ||
      "paddingTopLeft" in padding ||
      "paddingBottomRight" in padding)
  );
}

export function toFitBoundsOptions(
  padding?: FitBoundsPadding,
): L.FitBoundsOptions {
  if (padding && isCornerPadding(padding)) {
    return padding;
  }

  if (Array.isArray(padding)) {
    return { padding: [padding[0] ?? 0, padding[1] ?? 0] };
  }

  const point = padding as L.PointExpression | undefined;
  return {
    padding: point ?? [MAP_FIT_BOUNDS_PADDING[0], MAP_FIT_BOUNDS_PADDING[1]],
  };
}

export function fitMapToBounds(
  map: L.Map,
  bounds: L.LatLngBounds,
  padding?: FitBoundsPadding,
) {
  map.fitBounds(bounds, { animate: false, ...toFitBoundsOptions(padding) });
}
