import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stagingFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { useScreenSize } from "@/hooks/useScreenSize";

interface ChartYearControlsProps {
  chartEndYear: number;
  shortEndYear?: number; // Optional override, defaults to currentYear + 5
  longEndYear?: number; // Optional override, defaults to 2050
  setChartEndYear: (year: number) => void;
  className?: string;
  exploreMode?: boolean;
  setExploreMode?: (val: boolean) => void;
}

export const ChartYearControls: React.FC<ChartYearControlsProps> = ({
  chartEndYear,
  shortEndYear,
  longEndYear,
  setChartEndYear,
  className = "",
  exploreMode = false,
  setExploreMode,
}) => {
  const { isMobile } = useScreenSize();

  const currentYear = new Date().getFullYear();
  const defaultShortYear = shortEndYear ?? currentYear + 5;
  const defaultLongYear = longEndYear ?? 2050;

  // Hide controls when in explore mode
  if (exploreMode) {
    return null;
  }

  const showShortButton = chartEndYear === defaultLongYear;
  const showLongButton = chartEndYear === defaultShortYear;

  if (!showShortButton && !showLongButton && !setExploreMode) {
    return null;
  }

  // Mobile layout: stack vertically
  if (isMobile) {
    return (
      <div className={`mt-2 px-2 w-full space-y-2 ${className}`}>
        {(showShortButton || showLongButton) && (
          <div className="flex justify-center gap-2">
            {showShortButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartEndYear(defaultShortYear)}
                className="bg-black-2 border-black-1 text-white hover:bg-black-1 text-xs px-3 py-1"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                {defaultShortYear}
              </Button>
            )}
            {showLongButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartEndYear(defaultLongYear)}
                className="bg-black-2 border-black-1 text-white hover:bg-black-1 text-xs px-3 py-1"
              >
                {defaultLongYear}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {setExploreMode && stagingFeatureFlagEnabled() && (
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
    <div className={`relative mt-2 px-4 w-full ${className}`}>
      <div className="absolute left-0 top-0">
        {showShortButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartEndYear(defaultShortYear)}
            className="bg-black-2 border-black-1 text-white hover:bg-black-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {defaultShortYear}
          </Button>
        )}
      </div>
      <div className="absolute right-0 top-0">
        {showLongButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartEndYear(defaultLongYear)}
            className="bg-black-2 border-black-1 text-white hover:bg-black-1"
          >
            {defaultLongYear}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {setExploreMode && stagingFeatureFlagEnabled() && (
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
};
