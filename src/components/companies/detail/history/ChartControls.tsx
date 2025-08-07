import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { exploreButtonFeatureFlagEnabled } from "@/utils/ui/featureFlags";

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
  if (exploreMode) {
    return null;
  }

  return (
    <div className="relative mt-2 px-4 w-full">
      {/* Year toggle buttons positioned absolutely */}
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
      {/* Explore button centered independently */}
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
