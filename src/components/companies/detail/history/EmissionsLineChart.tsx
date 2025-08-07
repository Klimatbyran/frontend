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
import { useTranslation } from "react-i18next";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";
import { useMemo, useState, useEffect } from "react";
import { ExploreMode } from "./ExploreMode";
import { ChartControls } from "./ChartControls";
import { ScopeLine } from "./ScopeLine";
import { CategoryLine } from "./CategoryLine";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { calculateTrendPercentageChange } from "@/lib/calculations/trends/trendPercentages";
import { exploreButtonFeatureFlagEnabled } from "@/utils/ui/featureFlags";

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
  setMethodExplanation?: (explanation: string | null) => void;
  trendAnalysis?: {
    method: string;
    explanation: string;
    explanationParams?: Record<string, string | number>;
    coefficients?:
      | { slope: number; intercept: number }
      | { a: number; b: number };
    cleanData?: { year: number; value: number }[];
  } | null;
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
  setMethodExplanation,
  trendAnalysis,
}: EmissionsLineChartProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const shortEndYear = currentYear + 5;
  const longEndYear = 2050;
  const [chartEndYear, setChartEndYear] = useState(shortEndYear);
  const isFirstYear = companyBaseYear === data[0]?.year;

  // Generate approximated data using the consolidated function
  const approximatedData = useMemo(() => {
    if (dataView !== "overview") {
      return null;
    }

    // Don't show trendline if method is "none"
    if (trendAnalysis?.method === "none") {
      return null;
    }

    // Use coefficients from trend analysis if available
    if (trendAnalysis?.coefficients) {
      return generateApproximatedData(
        data,
        undefined, // regression
        chartEndYear,
        companyBaseYear,
        trendAnalysis.coefficients, // coefficients
        trendAnalysis.cleanData, // cleanData
      );
    }

    // Fallback to simple method if no coefficients available
    return generateApproximatedData(
      data,
      { slope: 0, intercept: 0 },
      chartEndYear,
      companyBaseYear,
    );
  }, [data, dataView, chartEndYear, companyBaseYear, trendAnalysis]);

  // Generate ticks based on the current end year
  const generateTicks = () => {
    const baseTicks = [data[0]?.year || 2000, 2020, currentYear, 2025];
    if (chartEndYear === shortEndYear) {
      return [...baseTicks, shortEndYear];
    } else {
      return [...baseTicks, shortEndYear, 2030, 2040, 2050];
    }
  };

  // Call setMethodExplanation when explanation changes
  useEffect(() => {
    if (setMethodExplanation && trendAnalysis) {
      const translatedExplanation = trendAnalysis.explanationParams
        ? t(trendAnalysis.explanation, trendAnalysis.explanationParams)
        : t(trendAnalysis.explanation);
      setMethodExplanation(translatedExplanation || null);
    } else if (setMethodExplanation) {
      setMethodExplanation(null);
    }
  }, [trendAnalysis, setMethodExplanation, t]);

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
                    dx: isFirstYear ? 15 : 0,
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
                      dataView === "overview" &&
                      trendAnalysis?.coefficients &&
                      trendAnalysis?.cleanData &&
                      trendAnalysis.cleanData.length >= 2
                        ? (() => {
                            const cleanData = trendAnalysis.cleanData;
                            const avgEmissions =
                              cleanData.reduce(
                                (sum, point) => sum + point.value,
                                0,
                              ) / cleanData.length;
                            const percentageChange =
                              calculateTrendPercentageChange(
                                trendAnalysis.coefficients,
                                avgEmissions,
                              );

                            return {
                              slope: percentageChange,
                              baseYear:
                                companyBaseYear || data[0]?.year || 2000,
                              lastReportedYear: Math.max(
                                ...cleanData.map((d) => d.year),
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
                  <ScopeLine
                    scope="scope1"
                    isHidden={hiddenScopes.includes("scope1")}
                    onToggle={handleScopeToggle}
                  />
                  <ScopeLine
                    scope="scope2"
                    isHidden={hiddenScopes.includes("scope2")}
                    onToggle={handleScopeToggle}
                  />
                  <ScopeLine
                    scope="scope3"
                    isHidden={hiddenScopes.includes("scope3")}
                    onToggle={handleScopeToggle}
                  />
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
                      <CategoryLine
                        key={categoryKey}
                        categoryKey={categoryKey}
                        categoryId={categoryId}
                        isHidden={hiddenCategories.includes(categoryId)}
                        strokeDasharray={strokeDasharray}
                        getCategoryColor={getCategoryColor}
                        getCategoryName={getCategoryName}
                        onToggle={handleCategoryToggle}
                      />
                    );
                  })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ExploreMode
            data={data}
            companyBaseYear={companyBaseYear}
            currentLanguage={currentLanguage}
            trendAnalysis={trendAnalysis}
            yDomain={[yMin, yMax]}
            onExit={() => setExploreMode(false)}
          />
        )}
      </div>
      {/* Chart view toggle buttons below the chart/legend */}
      <ChartControls
        chartEndYear={chartEndYear}
        shortEndYear={shortEndYear}
        longEndYear={longEndYear}
        setChartEndYear={setChartEndYear}
        exploreMode={exploreMode}
        setExploreMode={setExploreMode}
      />
    </div>
  );
}
