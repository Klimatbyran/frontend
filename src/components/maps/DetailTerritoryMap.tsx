import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import TerritoryMap from "./TerritoryMap";

type DetailTerritoryMapProps = Omit<
  ComponentProps<typeof TerritoryMap>,
  "fitBounds" | "showTooltip" | "legendPosition"
>;

export function DetailTerritoryMap({
  className,
  ...props
}: DetailTerritoryMapProps) {
  return (
    <TerritoryMap
      fitBounds
      showTooltip={false}
      legendPosition="bottom-left"
      className={cn("max-w-none", className)}
      {...props}
    />
  );
}
