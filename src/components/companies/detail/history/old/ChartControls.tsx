import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { exploreButtonFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { useScreenSize } from "@/hooks/useScreenSize";

interface ChartControlsProps {
  chartEndYear: number;
  shortEndYear: number;
  longEndYear: number;
  setChartEndYear: (year: number) => void;
  exploreMode: boolean;
  setExploreMode: (val: boolean) => void;
}

export function ChartControls({
  chartEndYear,
  shortEndYear,
  longEndYear,
  setChartEndYear,
  exploreMode,
  setExploreMode,
}: ChartControlsProps) {
  const { isMobile } = useScreenSize();

  if (exploreMode) {
    return null;
  }

  // Mobile layout: stack vertically
  if (isMobile) {
    return (
      <div className="mt-2 px-2 w-full space-y-2">
        {/* Year controls */}
        <div className="flex justify-center gap-2">
          {chartEndYear === longEndYear && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartEndYear(shortEndYear)}
              className="bg-black-2 border-black-1 text-white hover:bg-black-1 text-xs px-3 py-1"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              {shortEndYear}
            </Button>
          )}
          {chartEndYear === shortEndYear && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartEndYear(longEndYear)}
              className="bg-black-2 border-black-1 text-white hover:bg-black-1 text-xs px-3 py-1"
            >
              {longEndYear}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Explore mode button */}
        {exploreButtonFeatureFlagEnabled() && (
          <div className="flex justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setExploreMode(true);
              }}
              className="bg-green-3 text-black font-semibold shadow-md hover:bg-green-2 text-xs px-4 py-1"
            >
              Explore the Data
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout: original absolute positioning
  return (
    <div className="relative mt-2 px-4 w-full">
      <div className="absolute left-0 top-0">
        {chartEndYear === longEndYear && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartEndYear(shortEndYear)}
            className="bg-black-2 border-black-1 text-white hover:bg-black-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {shortEndYear}
          </Button>
        )}
      </div>
      <div className="absolute right-0 top-0">
        {chartEndYear === shortEndYear && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartEndYear(longEndYear)}
            className="bg-black-2 border-black-1 text-white hover:bg-black-1"
          >
            {longEndYear}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      {exploreButtonFeatureFlagEnabled() && (
        <div className="flex justify-center items-center">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setExploreMode(true);
            }}
            className="bg-green-3 text-black font-semibold shadow-md hover:bg-green-2"
          >
            Explore the Data
          </Button>
        </div>
      )}
    </div>
  );
}
