import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";

export type MapFitBoundsPadding =
  | L.FitBoundsOptions["padding"]
  | Pick<
      L.FitBoundsOptions,
      "padding" | "paddingTopLeft" | "paddingBottomRight"
    >;

export function fitMapToBounds(
  map: L.Map,
  bounds: L.LatLngBounds,
  padding: MapFitBoundsPadding = MAP_FIT_BOUNDS_PADDING,
) {
  const options = Array.isArray(padding) ? { padding } : padding;
  map.fitBounds(bounds, { ...options, animate: false });
}
