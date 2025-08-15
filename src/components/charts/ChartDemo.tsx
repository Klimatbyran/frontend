import React, { useState } from "react";
import { LineChart, Line, Area, AreaChart, ComposedChart } from "recharts";
import {
  EnhancedChartLegend,
  ChartYearControls,
  ChartContainer,
  ChartAxis,
  ChartTooltip,
  ChartReferenceLines,
  CommonReferenceLines,
  LegendItem,
} from "./index";

// Sample data for demonstration
const sampleData = [
  { year: 1990, historical: 100, trend: 95, paris: 90 },
  { year: 2000, historical: 85, trend: 80, paris: 70 },
  { year: 2010, historical: 70, trend: 65, paris: 50 },
  { year: 2020, historical: 55, trend: 50, paris: 30 },
  { year: 2030, historical: 40, trend: 35, paris: 20 },
  { year: 2040, historical: 25, trend: 20, paris: 10 },
  { year: 2050, historical: 10, trend: 5, paris: 0 },
];

export const ChartDemo: React.FC = () => {
  const [chartEndYear, setChartEndYear] = useState(2050);
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  // Sample legend items
  const legendItems: LegendItem[] = [
    {
      name: "Historical",
      color: "white",
      isClickable: true,
      isHidden: hiddenItems.has("Historical"),
    },
    {
      name: "Trend",
      color: "var(--pink-3)",
      isClickable: true,
      isHidden: hiddenItems.has("Trend"),
    },
    {
      name: "Paris Agreement",
      color: "var(--green-3)",
      isClickable: true,
      isHidden: hiddenItems.has("Paris Agreement"),
    },
  ];

  const handleLegendToggle = (itemName: string) => {
    const newHidden = new Set(hiddenItems);
    if (newHidden.has(itemName)) {
      newHidden.delete(itemName);
    } else {
      newHidden.add(itemName);
    }
    setHiddenItems(newHidden);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 space-y-8 bg-black-1">
      <h2 className="text-2xl font-bold text-white">
        Shared Chart Components Demo
      </h2>

      {/* Enhanced Legend Demo */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Enhanced Legend</h3>
        <div className="bg-black-2 p-4 rounded-lg">
          <EnhancedChartLegend
            items={legendItems}
            onItemToggle={handleLegendToggle}
            showMetadata={false}
          />
        </div>
      </div>

      {/* Year Controls Demo */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Year Controls</h3>
        <div className="bg-black-2 p-4 rounded-lg">
          <ChartYearControls
            chartEndYear={chartEndYear}
            setChartEndYear={setChartEndYear}
          />
        </div>
      </div>

      {/* Chart with Shared Components Demo */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Chart with Shared Components
        </h3>
        <div className="bg-black-2 p-4 rounded-lg">
          <ChartContainer height="300px">
            <LineChart data={sampleData}>
              <ChartAxis
                xAxisTicks={[1990, 2000, 2010, 2020, 2030, 2040, 2050]}
                yAxisWidth={60}
              />

              <ChartTooltip />

              <ChartReferenceLines
                lines={[
                  CommonReferenceLines.currentYear(currentYear),
                  CommonReferenceLines.zeroEmissions(),
                ]}
              />

              <Line
                type="monotone"
                dataKey="historical"
                stroke="white"
                strokeWidth={2}
                dot={false}
                hide={hiddenItems.has("Historical")}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="var(--pink-3)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                hide={hiddenItems.has("Trend")}
              />
              <Line
                type="monotone"
                dataKey="paris"
                stroke="var(--green-3)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                hide={hiddenItems.has("Paris Agreement")}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Current State Display */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Current State</h3>
        <div className="bg-black-2 p-4 rounded-lg text-white">
          <p>Chart End Year: {chartEndYear}</p>
          <p>Hidden Items: {Array.from(hiddenItems).join(", ") || "None"}</p>
        </div>
      </div>
    </div>
  );
};
