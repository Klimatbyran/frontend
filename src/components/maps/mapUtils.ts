import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";

export function fitMapToBounds(
  map: L.Map,
  bounds: L.LatLngBounds,
  padding: L.FitBoundsOptions["padding"] = MAP_FIT_BOUNDS_PADDING,
) {
  map.fitBounds(bounds, { padding, animate: false });
}
