import {
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
} from "recharts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatEmissionsAbsoluteCompact } from "@/utils/localizeUnit";
import { CustomTooltip } from "./CustomTooltip";

// Shared data types
export interface EmissionsDataPoint {
  year: number;
  total?: number;
  trend?: number;
  paris?: number;
  carbonLaw?: number;
  approximated?: number;
  scope1?: { value: number; isAIGenerated?: boolean };
  scope2?: { value: number; isAIGenerated?: boolean };
  scope3?: { value: number; isAIGenerated?: boolean };
  [key: string]: any; // For dynamic category/sector keys
}

export type DataView = "overview" | "scopes" | "categories" | "sectors";

export interface EmissionsLineGraphProps {
  data: EmissionsDataPoint[];
  dataView: DataView;
  currentLanguage: "sv" | "en";
  // Chart configuration
  endYear?: number;
  startYear?: number;
  showLegend?: boolean;
  showCurrentYearLine?: boolean;
  showBaseYearLine?: boolean;
  baseYear?: number;
  // Interaction handlers
  onDataPointClick?: (data: { year: number; total?: number }) => void;
  onItemToggle?: (itemKey: string) => void;
  // Customization
  hiddenItems?: Set<string>;
  getItemName?: (key: string) => string;
  getItemColor?: (key: string) => string;
  // Tooltip customization
  tooltipProps?: {
    showApproximated?: boolean;
    showGap?: boolean;
  };
}

// Utility functions
const calculateLinearRegression = (data: { x: number; y: number }[]) => {
  const n = data.length;
  if (n < 2) return null;

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const lastPoint = data[data.length - 1];
  const intercept = lastPoint.y - slope * lastPoint.x;

  return { slope, intercept };
};

const generateTrendData = (
  data: EmissionsDataPoint[],
  regression: { slope: number; intercept: number },
  endYear: number,
) => {
  const lastReportedYear = data
    .filter(
      (d): d is EmissionsDataPoint & { total: number } =>
        d.total !== undefined && d.total !== null,
    )
    .reduce((lastYear, d) => Math.max(lastYear, d.year), 0);

  const trendStartYear = data[0].year;
  const currentYear = new Date().getFullYear();
  const currentYearTrendValue =
    regression.slope * currentYear + regression.intercept;

  const allYears = Array.from(
    { length: endYear - trendStartYear + 1 },
    (_, i) => trendStartYear + i,
  );

  const reductionRate = 0.1356;

  return allYears.map((year) => {
    const shouldShowTrend = year >= lastReportedYear;
    const trendValue = shouldShowTrend
      ? regression.slope * year + regression.intercept
      : null;

    return {
      year,
      approximated: year <= currentYear ? trendValue : null,
      trend: year >= currentYear ? trendValue : null,
      total: data.find((d) => d.year === year)?.total,
      carbonLaw:
        year >= currentYear
          ? currentYearTrendValue *
            Math.pow(1 - reductionRate, year - currentYear)
          : null,
    };
  });
};

export function EmissionsLineGraph({
  data,
  dataView,
  currentLanguage,
  endYear = 2030,
  startYear,
  showLegend = true,
  showCurrentYearLine = true,
  showBaseYearLine = false,
  baseYear,
  onDataPointClick,
  onItemToggle,
  hiddenItems = new Set(),
  getItemName = (key) => key,
  getItemColor = () => "var(--grey)",
  tooltipProps = {},
}: EmissionsLineGraphProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Calculate trend data for overview view
  const trendData = useMemo(() => {
    if (dataView !== "overview") return null;

    const validPoints = data
      .filter(
        (d): d is EmissionsDataPoint & { total: number } =>
          d.total !== undefined && d.total !== null,
      )
      .map((d) => ({ x: d.year, y: d.total }));

    if (validPoints.length < 2) return null;

    const regression = calculateLinearRegression(validPoints);
    if (!regression) return null;

    return generateTrendData(data, regression, endYear);
  }, [data, dataView, endYear]);

  // Determine chart domain
  const chartStartYear = startYear || data[0]?.year || 1990;
  const chartEndYear = endYear;

  // Get dynamic items (categories or sectors) for categories/sectors view
  const dynamicItems = useMemo(() => {
    if (dataView !== "categories" && dataView !== "sectors") return [];

    const allKeys = new Set<string>();
    data.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (
          (dataView === "categories" &&
            key.startsWith("cat") &&
            !key.includes("Interpolated")) ||
          (dataView === "sectors" &&
            ![
              "year",
              "total",
              "trend",
              "paris",
              "carbonLaw",
              "approximated",
            ].includes(key))
        ) {
          allKeys.add(key);
        }
      });
    });

    return Array.from(allKeys).filter((key) => !hiddenItems.has(key));
  }, [data, dataView, hiddenItems]);

  // Handle legend click
  const handleLegendClick = (data: { dataKey: string | number }) => {
    if (onItemToggle) {
      onItemToggle(data.dataKey as string);
    }
  };

  // Handle area/line click
  const handleItemClick = (itemKey: string) => {
    if (onItemToggle) {
      onItemToggle(itemKey);
    }
  };

  // Handle data point click
  const handleClick = (data: any) => {
    if (onDataPointClick && data?.activePayload?.[0]?.payload) {
      const payload = data.activePayload[0].payload;
      onDataPointClick({ year: payload.year, total: payload.total });
    }
  };

  // Determine chart type
  const useComposedChart = dataView === "sectors";
  const ChartComponent = useComposedChart ? ComposedChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height="100%" className="w-full">
      <ChartComponent
        data={data}
        margin={{ top: 20, right: 20, left: 5, bottom: 10 }}
        onClick={handleClick}
      >
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            align="right"
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: "12px", color: "var(--grey)" }}
            onClick={handleLegendClick}
          />
        )}

        {showBaseYearLine && baseYear && (
          <ReferenceLine
            label={{
              value: t("companies.emissionsHistory.baseYear"),
              position: "top",
              fill: "white",
              fontSize: 12,
              fontWeight: "normal",
            }}
            x={baseYear}
            stroke="var(--grey)"
            strokeDasharray="4 4"
            isFront={false}
            ifOverflow="extendDomain"
          />
        )}

        {showCurrentYearLine && (
          <ReferenceLine
            x={currentYear}
            stroke="var(--orange-2)"
            strokeWidth={1}
            label={{
              value: currentYear,
              position: "top",
              fill: "var(--orange-2)",
              fontSize: 12,
              fontWeight: "normal",
            }}
          />
        )}

        <XAxis
          dataKey="year"
          stroke="var(--grey)"
          tickLine={false}
          axisLine={false}
          type="number"
          domain={[chartStartYear, chartEndYear]}
          tick={{ fontSize: 12 }}
          padding={{ left: 0, right: 0 }}
          ticks={[1990, 2015, 2020, currentYear, 2030, 2040, 2050].filter(
            (year) => year >= chartStartYear && year <= chartEndYear,
          )}
          tickFormatter={(year) => year}
        />

        <YAxis
          stroke="var(--grey)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={60}
          domain={[0, "auto"]}
          padding={{ top: 0, bottom: 0 }}
          tickFormatter={(value) =>
            formatEmissionsAbsoluteCompact(value, currentLanguage)
          }
        />

        <Tooltip
          content={
            <CustomTooltip
              dataView={dataView}
              hiddenItems={hiddenItems}
              tooltipProps={tooltipProps}
            />
          }
        />

        {/* Overview View */}
        {dataView === "overview" && (
          <>
            <Line
              type="monotone"
              dataKey="total"
              stroke="white"
              strokeWidth={2}
              dot={false}
              connectNulls
              name={t("municipalities.graph.historical")}
            />
            {trendData && (
              <>
                <Line
                  type="monotone"
                  dataKey="approximated"
                  data={trendData}
                  stroke="white"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                  name={t("municipalities.graph.estimated")}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  data={trendData}
                  stroke="var(--pink-3)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name={t("municipalities.graph.trend")}
                />
                <Line
                  type="monotone"
                  dataKey="carbonLaw"
                  data={trendData}
                  stroke="var(--green-3)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name={t("companies.emissionsHistory.carbonLaw")}
                />
              </>
            )}
          </>
        )}

        {/* Scopes View */}
        {dataView === "scopes" && (
          <>
            {!hiddenItems.has("scope1") && (
              <Line
                type="monotone"
                dataKey="scope1.value"
                stroke="var(--pink-3)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--pink-3)",
                  cursor: "pointer",
                  onClick: () => handleItemClick("scope1"),
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--pink-3)",
                  cursor: "pointer",
                }}
                name="Scope 1"
              />
            )}
            {!hiddenItems.has("scope2") && (
              <Line
                type="monotone"
                dataKey="scope2.value"
                stroke="var(--green-2)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--green-2)",
                  cursor: "pointer",
                  onClick: () => handleItemClick("scope2"),
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--green-2)",
                  cursor: "pointer",
                }}
                name="Scope 2"
              />
            )}
            {!hiddenItems.has("scope3") && (
              <Line
                type="monotone"
                dataKey="scope3.value"
                stroke="var(--blue-2)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--blue-2)",
                  cursor: "pointer",
                  onClick: () => handleItemClick("scope3"),
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--blue-2)",
                  cursor: "pointer",
                }}
                name="Scope 3"
              />
            )}
          </>
        )}

        {/* Categories View */}
        {dataView === "categories" &&
          dynamicItems.map((categoryKey) => {
            const categoryId = parseInt(categoryKey.replace("cat", ""));
            const isInterpolatedKey = `${categoryKey}Interpolated`;
            const strokeDasharray = data[0]?.[isInterpolatedKey] ? "4 4" : "0";

            return (
              <Line
                key={categoryKey}
                type="monotone"
                dataKey={categoryKey}
                stroke={getItemColor(categoryKey)}
                strokeWidth={2}
                strokeDasharray={strokeDasharray}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload) return null;

                  const value = payload.originalValues?.[categoryKey];
                  if (value === null || value === undefined || isNaN(value)) {
                    return null;
                  }

                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      style={{
                        fill: getItemColor(categoryKey),
                        stroke: getItemColor(categoryKey),
                      }}
                      cursor="pointer"
                      onClick={() => handleItemClick(categoryKey)}
                    />
                  );
                }}
                activeDot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload) return null;

                  const value = payload.originalValues?.[categoryKey];
                  if (value === null || value === undefined || isNaN(value)) {
                    return null;
                  }

                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      style={{
                        fill: getItemColor(categoryKey),
                        stroke: getItemColor(categoryKey),
                      }}
                      cursor="pointer"
                      onClick={() => handleItemClick(categoryKey)}
                    />
                  );
                }}
                name={getItemName(categoryKey)}
              />
            );
          })}

        {/* Sectors View */}
        {dataView === "sectors" &&
          dynamicItems.map((sector) => {
            const isHidden = hiddenItems.has(sector);
            const sectorColor = isHidden ? "var(--grey)" : getItemColor(sector);

            return useComposedChart ? (
              <Area
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={sectorColor}
                fillOpacity={0}
                stackId="1"
                strokeWidth={isHidden ? 0 : 1}
                name={sector}
                connectNulls={true}
                onClick={() => handleItemClick(sector)}
                style={{ cursor: "pointer", opacity: isHidden ? 0.4 : 1 }}
                hide={isHidden}
              />
            ) : (
              <Line
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={sectorColor}
                strokeWidth={isHidden ? 0 : 2}
                dot={false}
                name={sector}
                connectNulls={true}
                onClick={() => handleItemClick(sector)}
                style={{ cursor: "pointer", opacity: isHidden ? 0.4 : 1 }}
              />
            );
          })}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
