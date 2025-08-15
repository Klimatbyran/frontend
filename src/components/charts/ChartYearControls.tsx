import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChartYearControlsProps {
  chartEndYear: number;
  shortEndYear?: number; // Optional override, defaults to currentYear + 5
  longEndYear?: number; // Optional override, defaults to 2050
  setChartEndYear: (year: number) => void;
  className?: string;
}

export const ChartYearControls: React.FC<ChartYearControlsProps> = ({
  chartEndYear,
  shortEndYear,
  longEndYear,
  setChartEndYear,
  className = "",
}) => {
  // Calculate default years if not provided
  const currentYear = new Date().getFullYear();
  const defaultShortYear = shortEndYear ?? currentYear + 5;
  const defaultLongYear = longEndYear ?? 2050;

  // Determine which button to show based on current state
  const showShortButton = chartEndYear === defaultLongYear;
  const showLongButton = chartEndYear === defaultShortYear;

  if (!showShortButton && !showLongButton) {
    return null;
  }

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
    </div>
  );
};
