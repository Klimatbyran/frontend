import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Text } from "@/components/ui/text";
import type { Municipality } from "@/types/municipality";

interface MunicipalityMapProps {
  municipalities: Municipality[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function MunicipalityMap({
  municipalities,
  selectedId,
  onSelect,
  className,
}: MunicipalityMapProps) {
  // Calculate value ranges for color scaling
  const { min, max } = useMemo(() => {
    const values = municipalities.map((m) => m.bicycleMetrePerCapita);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [municipalities]);

  // Get color based on value
  const getColor = (value: number) => {
    const normalizedValue = (value - min) / (max - min);
    return `rgb(${Math.round(153 + normalizedValue * 102)}, ${Math.round(
      207 + normalizedValue * 48,
    )}, ${Math.round(255)})`;
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 200 400"
        className="w-full max-w-[500px]"
        style={{ filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))" }}
      >
        <g>
          {municipalities.map((municipality) => (
            <TooltipProvider key={municipality.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <path
                    // d={municipality.path}
                    fill={getColor(municipality.bicycleMetrePerCapita)}
                    stroke={
                      selectedId === municipality.name ? "white" : "#2E2E2E"
                    }
                    strokeWidth={selectedId === municipality.name ? "2" : "0.5"}
                    className="transition-colors cursor-pointer hover:brightness-110"
                    onClick={() => onSelect?.(municipality.name)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <Text variant="small">{municipality.name}</Text>
                    <Text variant="h2">
                      {municipality.bicycleMetrePerCapita.toFixed(1)}m
                    </Text>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </g>
      </svg>

      {/* Color scale legend */}
      <div className="absolute left-0 bottom-0 bg-black-1 rounded-level-2 p-4">
        <Text variant="small" className="text-grey mb-2">
          Cykelväg per invånare
        </Text>
        <div className="flex items-center gap-2">
          <div
            className="w-24 h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, rgb(153, 207, 255), rgb(255, 255, 255))`,
            }}
          />
          <div className="flex justify-between w-full text-xs text-grey">
            <span>{min.toFixed(1)}m</span>
            <span>{max.toFixed(1)}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
