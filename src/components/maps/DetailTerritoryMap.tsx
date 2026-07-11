import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  DETAIL_MAP_MOBILE_FIT_BOUNDS_PADDING,
  MAP_FIT_BOUNDS_PADDING,
} from "./mapConstants";
import TerritoryMap from "./TerritoryMap";

type DetailTerritoryMapProps = Omit<
  ComponentProps<typeof TerritoryMap>,
  "scrollWheelZoom" | "fitBounds" | "showTooltip" | "legendPosition"
>;

export function DetailTerritoryMap({
  className,
  ...props
}: DetailTerritoryMapProps) {
  const { isMobile } = useScreenSize();

  return (
    <TerritoryMap
      fitBounds
      showTooltip={false}
      legendPosition="bottom-left"
      fitBoundsPadding={
        isMobile ? DETAIL_MAP_MOBILE_FIT_BOUNDS_PADDING : MAP_FIT_BOUNDS_PADDING
      }
      className={cn("max-w-none", className)}
      {...props}
    />
  );
}
