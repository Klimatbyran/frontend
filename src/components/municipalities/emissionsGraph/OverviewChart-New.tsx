import { FC, useState, useMemo } from "react";
import { LineChart, Line } from "recharts";
import { useTranslation } from "react-i18next";
import { DataPoint } from "@/types/municipality";
import {
  ChartContainer,
  ChartTooltip,
  ChartReferenceLines,
  CommonReferenceLines,
  DynamicLegendContainer,
  ChartYearControls,
  LegendItem,
} from "@/components/charts";
import { XAxis, YAxis } from "recharts";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

interface OverviewChartNewProps {
  projectedData: DataPoint[];
}

export const OverviewChartNew: FC<OverviewChartNewProps> = ({
  projectedData,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  // State for year range control - default to 2030 (current year + 5)
  const [chartEndYear, setChartEndYear] = useState(
    new Date().getFullYear() + 5,
  );

  // State for hidden lines
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  // Create legend items for the chart
  const legendItems: LegendItem[] = useMemo(
    () => [
      {
        name: t("municipalities.graph.historical"),
        color: "white",
        isClickable: true,
        isHidden: hiddenLines.has("historical"),
        isDashed: false,
      },
      {
        name: t("municipalities.graph.estimated"),
        color: "white",
        isClickable: true,
        isHidden: hiddenLines.has("approximated"),
        isDashed: true,
      },
      {
        name: t("municipalities.graph.trend"),
        color: "var(--pink-3)",
        isClickable: true,
        isHidden: hiddenLines.has("trend"),
        isDashed: true,
      },
      {
        name: t("municipalities.graph.parisAgreement"),
        color: "var(--green-3)",
        isClickable: true,
        isHidden: hiddenLines.has("paris"),
        isDashed: true,
      },
    ],
    [hiddenLines, t],
  );

  // Handle legend item toggle
  const handleLegendToggle = (itemName: string) => {
    const newHidden = new Set(hiddenLines);
    if (newHidden.has(itemName)) {
      newHidden.delete(itemName);
    } else {
      newHidden.add(itemName);
    }
    setHiddenLines(newHidden);
  };

  // Filter data based on chart end year
  const filteredData = useMemo(() => {
    return projectedData.filter((point) => point.year <= chartEndYear);
  }, [projectedData, chartEndYear]);

  // Reference lines configuration
  const referenceLines = useMemo(
    () => [CommonReferenceLines.currentYear(currentYear)],
    [currentYear],
  );

  return (
    <div className="h-full flex flex-col">
      {/* Chart - fixed height to prevent shrinking */}
      <div className="h-[250px] md:h-[300px] w-full">
        <ChartContainer height="100%" width="100%">
          <LineChart
            data={filteredData}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="year"
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              padding={{ left: 0, right: 0 }}
              domain={[1990, 2050]}
              allowDuplicatedCategory={true}
              ticks={[1990, 2015, 2020, currentYear, 2030, 2040, 2050]}
              tickFormatter={(year) => year}
            />
            <YAxis
              stroke="var(--grey)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                formatEmissionsAbsoluteCompact(value, currentLanguage)
              }
              width={40}
              domain={[0, "auto"]}
              padding={{ top: 0, bottom: 0 }}
            />

            <ChartTooltip />

            <ChartReferenceLines lines={referenceLines} />

            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="white"
              strokeWidth={2}
              dot={false}
              connectNulls
              name={t("municipalities.graph.historical")}
              hide={hiddenLines.has("historical")}
            />

            {/* Estimated line */}
            <Line
              type="monotone"
              dataKey="approximated"
              stroke="white"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              connectNulls
              name={t("municipalities.graph.estimated")}
              hide={hiddenLines.has("approximated")}
            />

            {/* Trend line */}
            <Line
              type="monotone"
              dataKey="trend"
              stroke="var(--pink-3)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name={t("municipalities.graph.trend")}
              hide={hiddenLines.has("trend")}
            />

            {/* Paris Agreement line */}
            <Line
              type="monotone"
              dataKey="paris"
              stroke="var(--green-3)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name={t("municipalities.graph.parisAgreement")}
              hide={hiddenLines.has("paris")}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Legend and controls - scrollable if needed */}
      <div className="mt-2 mb-2 space-y-2 min-h-0">
        <DynamicLegendContainer
          items={legendItems}
          onItemToggle={handleLegendToggle}
          showMetadata={false}
          allowClickToHide={false}
          maxHeight="200px"
          mobileMaxHeight="150px"
        />

        <ChartYearControls
          chartEndYear={chartEndYear}
          setChartEndYear={setChartEndYear}
        />
      </div>
    </div>
  );
};
