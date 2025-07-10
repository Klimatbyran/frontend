import {
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "../CustomTooltip";
import { ChartData } from "@/types/emissions";
import { t } from "i18next";
import { formatEmissionsAbsoluteCompact } from "@/utils/localizeUnit";
import { useMemo, useState } from "react";
import {
  calculateLinearRegression,
  calculateWeightedLinearRegression,
  generateApproximatedData,
  generateSophisticatedApproximatedData,
  fitExponentialRegression,
  calculateWeightedExponentialRegression,
  calculateRecentExponentialRegression,
} from "@/utils/companyEmissionsCalculations";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExploreChart } from "./ExploreChart";
import { exploreButtonFeatureFlagEnabled } from "@/utils/feature-flag";

interface EmissionsLineChartProps {
  data: ChartData[];
  companyBaseYear?: number;
  dataView: "overview" | "scopes" | "categories";
  hiddenScopes: Array<"scope1" | "scope2" | "scope3">;
  hiddenCategories: number[];
  handleClick: (data: {
    activePayload?: Array<{
      payload: {
        year: number;
        total: number;
      };
    }>;
  }) => void;
  handleScopeToggle: (scope: "scope1" | "scope2" | "scope3") => void;
  handleCategoryToggle: (categoryId: number) => void;
  getCategoryName: (id: number) => string;
  getCategoryColor: (id: number) => string;
  currentLanguage: "sv" | "en";
  exploreMode: boolean;
  setExploreMode: (val: boolean) => void;
  calculationMethod?:
    | "simple"
    | "linear"
    | "exponential"
    | "weighted"
    | "weightedExponential"
    | "recentExponential";
}

function hasTotalEmissions(d: ChartData): d is ChartData & { total: number } {
  return d.total !== undefined && d.total !== null;
}

export default function EmissionsLineChart({
  data,
  companyBaseYear,
  dataView,
  hiddenScopes,
  hiddenCategories,
  handleClick,
  handleScopeToggle,
  handleCategoryToggle,
  getCategoryName,
  getCategoryColor,
  currentLanguage,
  exploreMode,
  setExploreMode,
  calculationMethod = "simple",
}: EmissionsLineChartProps) {
  const currentYear = new Date().getFullYear();
  const shortEndYear = currentYear + 5;
  const longEndYear = 2050;
  const [chartEndYear, setChartEndYear] = useState(shortEndYear);
  // --- New logic for dynamic explore steps ---
  const hasDataBeforeBaseYear =
    companyBaseYear && data.some((d) => d.year < companyBaseYear);
  // Build steps dynamically
  const exploreSteps = [
    ...(hasDataBeforeBaseYear
      ? [
          {
            label: "Data before the base year",
            description: t(
              "companies.emissionsHistory.exploreStep0Description",
            ),
          },
        ]
      : []),
    {
      label: "Base year to latest reporting period",
      description:
        "This section highlights the period from the base year to the latest reported data.",
    },
    {
      label: "Approximated values",
      description:
        "Here we show the estimated values from the last reporting period to the current year.",
    },
    {
      label: "Projection outwards",
      description: "This step shows the future trend line projection.",
    },
    {
      label: "Paris line",
      description: "This step shows the Paris Agreement reduction path.",
    },
    {
      label: "Difference shading",
      description:
        "Red/green shading shows the difference between the trend and Paris lines, representing the tCO₂ gap.",
    },
    {
      label: "Total area analysis",
      description:
        "Shows the cumulative emissions difference over time. The total area between trend and Paris lines represents the overall impact from current year to 2050.",
    },
  ];
  // Set initial step based on whether the first step exists
  const initialExploreStep = 0;
  const [exploreStep, setExploreStep] = useState(initialExploreStep);

  // Helper to get last two periods with emissions
  function getLastTwoEmissionsPoints(data: ChartData[]) {
    return data
      .filter(hasTotalEmissions)
      .map((d) => ({ x: d.year, y: d.total as number }))
      .slice(-2);
  }

  const approximatedData = useMemo(() => {
    if (dataView !== "overview") {
      return null;
    }
    if (calculationMethod === "linear") {
      return generateSophisticatedApproximatedData(
        data,
        chartEndYear,
        "linear",
        companyBaseYear,
      );
    } else if (calculationMethod === "exponential") {
      return generateSophisticatedApproximatedData(
        data,
        chartEndYear,
        "exponential",
        companyBaseYear,
      );
    } else if (calculationMethod === "weighted") {
      // Weighted method (linear regression, exponential weights)
      const regressionPoints = (() => {
        if (companyBaseYear) {
          const baseYearPoints = data
            .filter((d) => hasTotalEmissions(d) && d.year >= companyBaseYear)
            .map((d) => ({ x: d.year, y: d.total as number }));
          if (baseYearPoints.length < 2) {
            return getLastTwoEmissionsPoints(data);
          }
          return baseYearPoints;
        } else {
          return getLastTwoEmissionsPoints(data);
        }
      })();
      if (regressionPoints.length < 2) {
        return null;
      }
      const regression = calculateWeightedLinearRegression(regressionPoints);
      if (!regression) {
        return null;
      }
      return generateApproximatedData(
        data,
        regression,
        chartEndYear,
        companyBaseYear,
      );
    } else if (calculationMethod === "weightedExponential") {
      // Weighted exponential regression
      const regressionPoints = (() => {
        if (companyBaseYear) {
          const baseYearPoints = data
            .filter((d) => hasTotalEmissions(d) && d.year >= companyBaseYear)
            .map((d) => ({ x: d.year, y: d.total as number }));
          if (baseYearPoints.length < 2) {
            return getLastTwoEmissionsPoints(data);
          }
          return baseYearPoints;
        } else {
          return getLastTwoEmissionsPoints(data);
        }
      })();
      if (regressionPoints.length < 2) {
        return null;
      }
      const expFit = calculateWeightedExponentialRegression(
        regressionPoints,
        0.7,
      );
      if (!expFit) {
        return null;
      }
      // Anchor at last data point
      const lastYear = regressionPoints[regressionPoints.length - 1].x;
      const lastValue = regressionPoints[regressionPoints.length - 1].y;
      const fitValueAtLast = expFit.a * Math.exp(expFit.b * lastYear);
      const scale =
        lastValue && fitValueAtLast ? lastValue / fitValueAtLast : 1;
      const allYears = Array.from(
        { length: chartEndYear - data[0].year + 1 },
        (_, i) => data[0].year + i,
      );
      const currentYear = new Date().getFullYear();
      const reductionRate = 0.1172;
      return allYears.map((year) => {
        let approximatedValue = null;
        if (year > lastYear) {
          approximatedValue = scale * expFit.a * Math.exp(expFit.b * year);
          if (approximatedValue < 0) approximatedValue = 0;
        } else if (year === lastYear) {
          approximatedValue = lastValue;
        }
        let parisValue = null;
        if (year >= currentYear) {
          const currentYearValue =
            scale * expFit.a * Math.exp(expFit.b * currentYear);
          const calculatedValue =
            currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
          parisValue = calculatedValue > 0 ? calculatedValue : null;
        }
        return {
          year,
          approximated: approximatedValue,
          total: data.find((d) => d.year === year)?.total,
          carbonLaw: parisValue,
        };
      });
    } else if (calculationMethod === "recentExponential") {
      // Recent exponential regression (last 4 years)
      const regressionPoints = (() => {
        if (companyBaseYear) {
          const baseYearPoints = data
            .filter((d) => hasTotalEmissions(d) && d.year >= companyBaseYear)
            .map((d) => ({ x: d.year, y: d.total as number }));
          if (baseYearPoints.length < 2) {
            return getLastTwoEmissionsPoints(data);
          }
          return baseYearPoints;
        } else {
          return getLastTwoEmissionsPoints(data);
        }
      })();
      if (regressionPoints.length < 2) {
        return null;
      }
      const expFit = calculateRecentExponentialRegression(regressionPoints, 4);
      if (!expFit) {
        return null;
      }
      // Anchor at last data point
      const lastYear = regressionPoints[regressionPoints.length - 1].x;
      const lastValue = regressionPoints[regressionPoints.length - 1].y;
      const fitValueAtLast = expFit.a * Math.exp(expFit.b * lastYear);
      const scale =
        lastValue && fitValueAtLast ? lastValue / fitValueAtLast : 1;
      const allYears = Array.from(
        { length: chartEndYear - data[0].year + 1 },
        (_, i) => data[0].year + i,
      );
      const currentYear = new Date().getFullYear();
      const reductionRate = 0.1172;
      return allYears.map((year) => {
        let approximatedValue = null;
        if (year > lastYear) {
          approximatedValue = scale * expFit.a * Math.exp(expFit.b * year);
          if (approximatedValue < 0) approximatedValue = 0;
        } else if (year === lastYear) {
          approximatedValue = lastValue;
        }
        let parisValue = null;
        if (year >= currentYear) {
          const currentYearValue =
            scale * expFit.a * Math.exp(expFit.b * currentYear);
          const calculatedValue =
            currentYearValue * Math.pow(1 - reductionRate, year - currentYear);
          parisValue = calculatedValue > 0 ? calculatedValue : null;
        }
        return {
          year,
          approximated: approximatedValue,
          total: data.find((d) => d.year === year)?.total,
          carbonLaw: parisValue,
        };
      });
    } else {
      // Simple (original) method
      const regressionPoints = (() => {
        if (companyBaseYear) {
          const baseYearPoints = data
            .filter((d) => hasTotalEmissions(d) && d.year >= companyBaseYear)
            .map((d) => ({ x: d.year, y: d.total as number }));
          if (baseYearPoints.length < 2) {
            return getLastTwoEmissionsPoints(data);
          }
          return baseYearPoints;
        } else {
          return getLastTwoEmissionsPoints(data);
        }
      })();
      if (regressionPoints.length < 2) {
        return null;
      }
      const regression = calculateLinearRegression(regressionPoints);
      if (!regression) {
        return null;
      }
      return generateApproximatedData(
        data,
        regression,
        chartEndYear,
        companyBaseYear,
      );
    }
  }, [data, dataView, companyBaseYear, chartEndYear, calculationMethod]);

  // Generate ticks based on the current end year
  const generateTicks = () => {
    const baseTicks = [data[0]?.year || 2000, 2020, currentYear, 2025];
    if (chartEndYear === shortEndYear) {
      return [...baseTicks, shortEndYear];
    } else {
      return [...baseTicks, shortEndYear, 2030, 2040, 2050];
    }
  };

  // Trend line explanation for step 2
  const trendExplanation = t("companies.emissionsHistory.trendInfo", {
    percentage: /* insert percentage or leave blank for now */ "...",
    baseYear: companyBaseYear || "",
  });

  // Calculate global min/max Y values for consistent Y-axis scaling
  const allYValues = [
    ...data.map((d) => d.total).filter((v) => v !== undefined && v !== null),
    ...(approximatedData
      ? approximatedData
          .map((d) => d.approximated)
          .filter((v) => v !== undefined && v !== null)
      : []),
  ];
  const yMin = Math.min(...allYValues, 0);
  const yMax = Math.max(...allYValues, 10);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative w-full flex-1 min-h-[350px]">
        {/* Chart area: show normal or explore mode */}
        {!exploreMode ? (
          <ResponsiveContainer width="100%" height="100%" className="w-full">
            <LineChart
              data={data}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              onClick={handleClick}
            >
              {companyBaseYear && (
                <ReferenceLine
                  label={{
                    value: t("companies.emissionsHistory.baseYear"),
                    position: "top",
                    fill: "white",
                    fontSize: 12,
                    fontWeight: "normal",
                  }}
                  x={companyBaseYear}
                  stroke="var(--grey)"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
              )}

              <Legend
                verticalAlign="bottom"
                align="right"
                height={36}
                iconType="line"
                wrapperStyle={{ fontSize: "12px", color: "var(--grey)" }}
              />

              <XAxis
                dataKey="year"
                stroke="var(--grey)"
                tickLine={false}
                axisLine={false}
                type="number"
                domain={[data[0]?.year || 2000, chartEndYear]}
                ticks={generateTicks()}
                tick={({ x, y, payload }) => {
                  const isBaseYear = payload.value === companyBaseYear;
                  return (
                    <text
                      x={x - 15}
                      y={y + 10}
                      fontSize={12}
                      fill={`${isBaseYear ? "white" : "var(--grey)"}`}
                      fontWeight={`${isBaseYear ? "bold" : "normal"}`}
                    >
                      {payload.value}
                    </text>
                  );
                }}
                padding={{ left: 0, right: 0 }}
              />

              <YAxis
                stroke="var(--grey)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={60}
                domain={[0, "auto"]} // Hard stop at 0, no emissions below 0
                padding={{ top: 0, bottom: 0 }}
                tickFormatter={(value) =>
                  formatEmissionsAbsoluteCompact(value, currentLanguage)
                }
              />

              <Tooltip
                content={
                  <CustomTooltip
                    companyBaseYear={companyBaseYear}
                    filterDuplicateValues={dataView === "overview"}
                    trendData={
                      exploreButtonFeatureFlagEnabled() &&
                      approximatedData &&
                      dataView === "overview"
                        ? (() => {
                            // Calculate the regression points based on base year logic
                            const regressionPoints = companyBaseYear
                              ? data
                                  .filter(
                                    (d) =>
                                      hasTotalEmissions(d) &&
                                      d.year >= companyBaseYear,
                                  )
                                  .map((d) => ({
                                    x: d.year,
                                    y: d.total as number,
                                  }))
                              : getLastTwoEmissionsPoints(data);

                            if (regressionPoints.length < 2) {
                              return undefined;
                            }

                            let percentageChange = 0;

                            if (calculationMethod === "simple") {
                              // Simple method: average annual change
                              let totalChange = 0;
                              let totalYears = 0;
                              for (
                                let i = 1;
                                i < regressionPoints.length;
                                i++
                              ) {
                                totalChange +=
                                  regressionPoints[i].y -
                                  regressionPoints[i - 1].y;
                                totalYears +=
                                  regressionPoints[i].x -
                                  regressionPoints[i - 1].x;
                              }
                              const slope =
                                totalYears !== 0 ? totalChange / totalYears : 0;

                              // Calculate percentage change
                              const avgEmissions =
                                regressionPoints.reduce(
                                  (sum, point) => sum + point.y,
                                  0,
                                ) / regressionPoints.length;
                              percentageChange =
                                avgEmissions > 0
                                  ? (slope / avgEmissions) * 100
                                  : 0;
                            } else if (calculationMethod === "linear") {
                              // Sophisticated method: linear regression
                              const regression =
                                calculateLinearRegression(regressionPoints);
                              if (!regression) {
                                return undefined;
                              }

                              const avgEmissions =
                                regressionPoints.reduce(
                                  (sum, point) => sum + point.y,
                                  0,
                                ) / regressionPoints.length;
                              percentageChange =
                                avgEmissions > 0
                                  ? (regression.slope / avgEmissions) * 100
                                  : 0;
                            } else if (calculationMethod === "exponential") {
                              // Exponential method: exponential fit
                              const expFit =
                                fitExponentialRegression(regressionPoints);
                              if (!expFit) {
                                return undefined;
                              }

                              // Calculate the average annual percentage change from exponential fit
                              const avgEmissions =
                                regressionPoints.reduce(
                                  (sum, point) => sum + point.y,
                                  0,
                                ) / regressionPoints.length;

                              // For exponential, calculate the percentage change at the midpoint
                              const midYear =
                                (regressionPoints[0].x +
                                  regressionPoints[regressionPoints.length - 1]
                                    .x) /
                                2;
                              const midValue =
                                expFit.a * Math.exp(expFit.b * midYear);
                              const nextYearValue =
                                expFit.a * Math.exp(expFit.b * (midYear + 1));
                              const annualChange = nextYearValue - midValue;
                              percentageChange =
                                midValue > 0
                                  ? (annualChange / midValue) * 100
                                  : 0;
                            } else if (calculationMethod === "weighted") {
                              // Weighted method: weighted linear regression
                              const regression =
                                calculateWeightedLinearRegression(
                                  regressionPoints,
                                );
                              if (!regression) {
                                return undefined;
                              }

                              const avgEmissions =
                                regressionPoints.reduce(
                                  (sum, point) => sum + point.y,
                                  0,
                                ) / regressionPoints.length;
                              percentageChange =
                                avgEmissions > 0
                                  ? (regression.slope / avgEmissions) * 100
                                  : 0;
                            } else if (
                              calculationMethod === "weightedExponential"
                            ) {
                              // Weighted Exponential method: weighted exponential regression
                              const regression =
                                calculateWeightedExponentialRegression(
                                  regressionPoints,
                                  0.7,
                                );
                              if (!regression) {
                                return undefined;
                              }
                              // For exponential y = a * exp(bx), percent change per year = (exp(b) - 1) * 100
                              percentageChange =
                                (Math.exp(regression.b) - 1) * 100;
                            } else if (
                              calculationMethod === "recentExponential"
                            ) {
                              // Recent Exponential method: recent exponential regression
                              const regression =
                                calculateRecentExponentialRegression(
                                  regressionPoints,
                                  4,
                                );
                              if (!regression) {
                                return undefined;
                              }
                              percentageChange =
                                (Math.exp(regression.b) - 1) * 100;
                            }

                            return {
                              slope: percentageChange,
                              baseYear:
                                companyBaseYear || data[0]?.year || 2000,
                              lastReportedYear: data
                                .filter(hasTotalEmissions)
                                .reduce(
                                  (lastYear, d) => Math.max(lastYear, d.year),
                                  0,
                                ),
                            };
                          })()
                        : undefined
                    }
                  />
                }
              />

              {dataView === "overview" && (
                <>
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="white"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "white", cursor: "pointer" }}
                    activeDot={{ r: 6, fill: "white", cursor: "pointer" }}
                    connectNulls
                    name={t("companies.emissionsHistory.totalEmissions")}
                  />
                  {approximatedData && (
                    <>
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
                      <Line
                        type="linear"
                        dataKey="approximated"
                        data={approximatedData}
                        stroke="var(--grey)"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={false}
                        name={t("companies.emissionsHistory.approximated")}
                      />
                      <Line
                        type="monotone"
                        dataKey="carbonLaw"
                        data={approximatedData}
                        stroke="var(--green-3)"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={false}
                        name={t("companies.emissionsHistory.carbonLaw")}
                      />
                    </>
                  )}
                </>
              )}

              {dataView === "scopes" && (
                <>
                  {!hiddenScopes.includes("scope1") && (
                    <Line
                      type="monotone"
                      dataKey="scope1.value"
                      stroke="var(--pink-3)"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "var(--pink-3)",
                        cursor: "pointer",
                        onClick: () => handleScopeToggle("scope1"),
                      }}
                      activeDot={{
                        r: 6,
                        fill: "var(--pink-3)",
                        cursor: "pointer",
                      }}
                      name="Scope 1"
                    />
                  )}
                  {!hiddenScopes.includes("scope2") && (
                    <Line
                      type="monotone"
                      dataKey="scope2.value"
                      stroke="var(--green-2)"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "var(--green-2)",
                        cursor: "pointer",
                        onClick: () => handleScopeToggle("scope2"),
                      }}
                      activeDot={{
                        r: 6,
                        fill: "var(--green-2)",
                        cursor: "pointer",
                      }}
                      name="Scope 2"
                    />
                  )}
                  {!hiddenScopes.includes("scope3") && (
                    <Line
                      type="monotone"
                      dataKey="scope3.value"
                      stroke="var(--blue-2)"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "var(--blue-2)",
                        cursor: "pointer",
                        onClick: () => handleScopeToggle("scope3"),
                      }}
                      activeDot={{
                        r: 6,
                        fill: "var(--blue-2)",
                        cursor: "pointer",
                        onClick: () => handleScopeToggle("scope3"),
                      }}
                      name="Scope 3"
                    />
                  )}
                </>
              )}

              {dataView === "categories" &&
                Object.keys(data[0])
                  .filter(
                    (key) =>
                      key.startsWith("cat") && !key.includes("Interpolated"),
                  )
                  .sort((a, b) => {
                    const aCatId = parseInt(a.replace("cat", ""));
                    const bCatId = parseInt(b.replace("cat", ""));
                    return aCatId - bCatId;
                  })
                  .map((categoryKey) => {
                    const categoryId = parseInt(categoryKey.replace("cat", ""));
                    const isInterpolatedKey = `${categoryKey}Interpolated`;

                    // Check if the category is hidden
                    if (hiddenCategories.includes(categoryId)) {
                      return null;
                    }
                    // Calculate strokeDasharray based on the first data point
                    const strokeDasharray = data[0][isInterpolatedKey]
                      ? "4 4"
                      : "0";

                    return (
                      <Line
                        key={categoryKey}
                        type="monotone"
                        dataKey={categoryKey}
                        stroke={getCategoryColor(categoryId)}
                        strokeWidth={2}
                        strokeDasharray={strokeDasharray}
                        dot={(props) => {
                          const { cx, cy, payload } = props;

                          if (!payload) {
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={0}
                                className="stroke-2 cursor-pointer"
                              />
                            );
                          }

                          const value = payload.originalValues?.[categoryKey];

                          if (
                            value === null ||
                            value === undefined ||
                            isNaN(value)
                          ) {
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={0}
                                className="stroke-2 cursor-pointer"
                              />
                            );
                          }

                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4}
                              className="stroke-2 cursor-pointer"
                              style={{
                                fill: getCategoryColor(categoryId),
                                stroke: getCategoryColor(categoryId),
                              }}
                              cursor="pointer"
                              onClick={() => handleCategoryToggle(categoryId)}
                            />
                          );
                        }}
                        activeDot={(props: {
                          cx?: number;
                          cy?: number;
                          payload?: any;
                        }) => {
                          const { cx, cy, payload } = props;

                          if (!payload) {
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={0}
                                className="stroke-2 cursor-pointer"
                              />
                            );
                          }

                          const value = payload.originalValues?.[categoryKey];

                          if (
                            value === null ||
                            value === undefined ||
                            isNaN(value)
                          ) {
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={0}
                                className="stroke-2 cursor-pointer"
                              />
                            );
                          }

                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={6}
                              className="stroke-2 cursor-pointer"
                              style={{
                                fill: getCategoryColor(categoryId),
                                stroke: getCategoryColor(categoryId),
                              }}
                              cursor="pointer"
                              onClick={() => handleCategoryToggle(categoryId)}
                            />
                          );
                        }}
                        name={getCategoryName(categoryId)}
                      />
                    );
                  })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col w-full bg-black-2 rounded-lg p-6">
            {/* Placeholder for animated/segmented chart for each step */}
            <div className="mb-4 text-center">
              <div className="text-lg font-bold mb-2">
                {exploreSteps[exploreStep].label}
              </div>
              <div className="text-grey text-base mb-4">
                {exploreSteps[exploreStep].description}
              </div>
            </div>

            {/* Render the explore chart, only show step 0 if it exists */}
            <div className="w-full h-[350px] mb-8">
              <ExploreChart
                data={data}
                step={exploreStep + (hasDataBeforeBaseYear ? 0 : 1)}
                companyBaseYear={companyBaseYear}
                currentLanguage={currentLanguage}
                trendExplanation={
                  exploreStep === 2 ? trendExplanation : undefined
                }
                yDomain={[yMin, yMax]}
              />
            </div>

            {/* Button controls - always below chart, never overlapping */}
            <div className="flex flex-row gap-4 justify-center pt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExploreStep((s) => Math.max(0, s - 1))}
                disabled={exploreStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExploreStep((s) =>
                    Math.min(exploreSteps.length - 1, s + 1),
                  )
                }
                disabled={exploreStep === exploreSteps.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExploreMode(false);
                  setExploreStep(initialExploreStep);
                }}
                className="ml-2"
              >
                Exit
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Chart view toggle buttons below the chart/legend */}
      {!exploreMode && (
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
                  setExploreStep(initialExploreStep);
                }}
                className="bg-green-3 text-black font-semibold shadow-md hover:bg-green-2"
              >
                Explore the Data
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
