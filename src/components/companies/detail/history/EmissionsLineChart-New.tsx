import {
  Legend,
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
import { ScopeLineNew } from "./ScopeLine-New";
import { CategoryLineNew } from "./CategoryLine-New";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { calculateTrendPercentageChange } from "@/lib/calculations/trends/trendPercentages";
import { exploreButtonFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { isMobile } from "react-device-detect";
import { Button } from "@/components/ui/button";
import { ChartLine, CommonLineStyles } from "@/components/charts";

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

export default function EmissionsLineChartNew({
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
  const [chartEndYear, setChartEndYear] = useState(2050);
  const [shortEndYear, setShortEndYear] = useState(2030);
  const [longEndYear, setLongEndYear] = useState(2050);
  const [showTrendPopup, setShowTrendPopup] = useState(false);
  const currentYear = new Date().getFullYear();
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
        undefined, // baseYear
        trendAnalysis.coefficients, // coefficients
        trendAnalysis.cleanData, // cleanData
      );
    }

    // Fallback to base year calculation
    if (companyBaseYear && !isFirstYear) {
      return generateApproximatedData(
        data,
        undefined, // regression - let the function calculate it
        chartEndYear,
        companyBaseYear, // baseYear
      );
    }

    return null;
  }, [
    data,
    dataView,
    chartEndYear,
    companyBaseYear,
    isFirstYear,
    trendAnalysis,
  ]);

  // Calculate y-axis domain
  const yDomain = useMemo(() => {
    if (!data.length) return [0, 100];

    const allValues = data.flatMap((d) => [
      d.total,
      d.scope1?.value,
      d.scope2?.value,
      d.scope3?.value,
      ...Object.values(d.categories || {}),
    ]);

    const validValues = allValues.filter(
      (v) => v !== null && v !== undefined && !isNaN(v),
    );

    if (!validValues.length) return [0, 100];

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const padding = (max - min) * 0.1;

    return [Math.max(0, min - padding), max + padding];
  }, [data]);

  const [yMin, yMax] = yDomain;

  // Filter data based on chart end year
  const filteredData = useMemo(() => {
    return data.filter((d) => d.year <= chartEndYear);
  }, [data, chartEndYear]);

  // Calculate trend percentage change for method explanation
  useEffect(() => {
    if (trendAnalysis?.explanation && setMethodExplanation) {
      const percentageChange = calculateTrendPercentageChange(
        data,
        companyBaseYear,
        currentYear,
      );
      const explanation = trendAnalysis.explanation.replace(
        "{percentageChange}",
        percentageChange.toFixed(1),
      );
      setMethodExplanation(explanation);
    }
  }, [trendAnalysis, data, companyBaseYear, currentYear, setMethodExplanation]);

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-grey">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="h-full">
        {!exploreMode ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
              onClick={handleClick}
            >
              <XAxis
                dataKey="year"
                stroke="var(--grey)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                padding={{ left: 0, right: 0 }}
                domain={[1990, chartEndYear]}
                allowDuplicatedCategory={true}
                ticks={[
                  1990,
                  2015,
                  2020,
                  currentYear,
                  ...(chartEndYear >= 2030 ? [2030] : []),
                  ...(chartEndYear >= 2040 ? [2040] : []),
                  ...(chartEndYear >= 2050 ? [2050] : []),
                ].filter((year) => year <= chartEndYear)}
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
                domain={[yMin, yMax]}
                padding={{ top: 0, bottom: 0 }}
              />

              <Tooltip
                content={
                  <CustomTooltip
                    data={data}
                    currentLanguage={currentLanguage}
                    getCategoryName={getCategoryName}
                    getCategoryColor={getCategoryColor}
                  />
                }
              />

              {dataView === "overview" && (
                <>
                  {/* Total emissions line - using ChartLine with CommonLineStyles */}
                  <ChartLine
                    {...CommonLineStyles.historical(
                      "total",
                      t("companies.emissionsHistory.totalEmissions"),
                    )}
                    dot={
                      isMobile
                        ? false
                        : { r: 4, fill: "white", cursor: "pointer" }
                    }
                    activeDot={
                      isMobile
                        ? false
                        : { r: 6, fill: "white", cursor: "pointer" }
                    }
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

                      {/* Approximated data line - using ChartLine with CommonLineStyles */}
                      <ChartLine
                        {...CommonLineStyles.approximated(
                          "approximated",
                          t("companies.emissionsHistory.approximated"),
                        )}
                        data={approximatedData}
                        type="linear"
                        dot={false}
                        activeDot={false}
                      />

                      {/* Carbon Law line - using ChartLine with CommonLineStyles */}
                      <ChartLine
                        {...CommonLineStyles.carbonLaw(
                          "carbonLaw",
                          t("companies.emissionsHistory.carbonLaw"),
                        )}
                        data={approximatedData}
                        dot={false}
                        activeDot={false}
                      />
                    </>
                  )}
                </>
              )}

              {dataView === "scopes" && (
                <>
                  <ScopeLineNew
                    scope="scope1"
                    isHidden={hiddenScopes.includes("scope1")}
                    onToggle={handleScopeToggle}
                  />
                  <ScopeLineNew
                    scope="scope2"
                    isHidden={hiddenScopes.includes("scope2")}
                    onToggle={handleScopeToggle}
                  />
                  <ScopeLineNew
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
                      <CategoryLineNew
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

      {/* Mobile trend explanation button and popup */}
      {isMobile && !exploreMode && trendAnalysis?.explanation && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrendPopup(true)}
            className="w-full bg-black-2 border-black-1 text-white hover:bg-black-1"
          >
            <span className="text-sm">
              {t("companies.emissionsHistory.trend")}
            </span>
          </Button>

          {/* Trend Explanation Popup Modal */}
          {showTrendPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-black-2 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {t("companies.emissionsHistory.trend")}
                  </h3>
                  <button
                    onClick={() => setShowTrendPopup(false)}
                    className="text-grey hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-grey leading-relaxed">
                  {trendAnalysis.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
