import { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  EmissionPeriod,
  interpolateScope3Categories,
} from "@/lib/calculations/emissions";
import type { EmissionsHistoryProps, DataView } from "@/types/emissions";
import { getChartData } from "../../../../utils/getChartData";
import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useLanguage } from "@/components/LanguageProvider";
import { HiddenItemsBadges } from "../HiddenItemsBadges";
import ChartHeader from "./ChartHeader";
import EmissionsLineChart from "./EmissionsLineChart";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
// import {
//   generateApproximatedData,
//   generateSophisticatedApproximatedData,
// } from "@/utils/companyEmissionsCalculations";
import { exploreButtonFeatureFlagEnabled } from "@/utils/feature-flag";

export function EmissionsHistory({
  reportingPeriods,
  onYearSelect,
  baseYear,
  features = {
    interpolateScope3: true,
    guessBaseYear: true,
    compositeTrend: true,
    outlierDetection: true,
  },
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { getCategoryName, getCategoryColor } = useCategoryMetadata();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const hasScope3Categories = useMemo(
    () =>
      reportingPeriods.some(
        (period) => period.emissions?.scope3?.categories?.length ?? false,
      ),
    [reportingPeriods],
  );

  const [dataView, setDataView] = useState<DataView>(() => {
    if (!hasScope3Categories && "categories" === "categories") {
      return "overview";
    }
    return "overview";
  });

  const companyBaseYear = baseYear?.year;

  // Only interpolate if the feature is enabled
  const processedPeriods = useMemo(
    () =>
      features.interpolateScope3
        ? interpolateScope3Categories(reportingPeriods as EmissionPeriod[])
        : reportingPeriods,
    [reportingPeriods, features.interpolateScope3],
  );

  // Process data based on view
  const chartData = useMemo(
    () =>
      getChartData(
        processedPeriods as EmissionPeriod[],
        isAIGenerated,
        isEmissionsAIGenerated,
      ),
    [processedPeriods, isAIGenerated, isEmissionsAIGenerated],
  );

  const handleClick = (data: {
    activePayload?: Array<{ payload: { year: number; total: number } }>;
  }) => {
    if (data?.activePayload?.[0]?.payload?.total) {
      onYearSelect?.(data.activePayload[0].payload.year.toString());
    }
  };

  // Add state for hidden scopes
  const [hiddenScopes, setHiddenScopes] = useState<
    Array<"scope1" | "scope2" | "scope3">
  >([]);

  // Add toggle handler
  const handleScopeToggle = (scope: "scope1" | "scope2" | "scope3") => {
    setHiddenScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const [hiddenCategories, setHiddenCategories] = useState<number[]>([]);

  // Explore mode state
  const [exploreMode, setExploreMode] = useState(false);

  // Calculation method toggle state
  const [calculationMethod, setCalculationMethod] = useState<
    | "simple"
    | "linear"
    | "exponential"
    | "weighted"
    | "weightedExponential"
    | "recentExponential"
  >("simple");

  // Feature flag for calculation method toggle
  const showCalculationToggle = exploreButtonFeatureFlagEnabled();

  const trendOptions = [
    { key: "simple", label: "Simple" },
    { key: "linear", label: "Sophisticated" },
    { key: "exponential", label: "Exponential" },
    { key: "weighted", label: "Weighted Recent" },
    { key: "weightedExponential", label: "Weighted Exponential" },
    { key: "recentExponential", label: "Recent Exponential" },
  ];

  // Validate input data
  if (!reportingPeriods?.length) {
    return (
      <div className="text-center py-12">
        <Text variant="body">
          {t("companies.emissionsHistory.noReportingPeriods")}
        </Text>
      </div>
    );
  }

  const handleCategoryToggle = (categoryId: number) => {
    setHiddenCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  return (
    <div>
      {!exploreMode && (
        <SectionWithHelp
          helpItems={[
            "scope1",
            "scope2",
            "scope3",
            "parisAgreementLine",
            "scope3EmissionLevels",
            "companyMissingData",
          ]}
        >
          <ChartHeader
            title={t("companies.emissionsHistory.title")}
            tooltipContent={t("companies.emissionsHistory.tooltip")}
            unit={t("companies.emissionsHistory.unit")}
            dataView={dataView}
            setDataView={setDataView}
            hasScope3Categories={hasScope3Categories}
          />
          <div className="h-[300px] md:h-[400px]">
            <EmissionsLineChart
              data={chartData}
              companyBaseYear={companyBaseYear}
              dataView={dataView}
              hiddenScopes={hiddenScopes}
              hiddenCategories={hiddenCategories}
              handleClick={handleClick}
              handleScopeToggle={handleScopeToggle}
              handleCategoryToggle={handleCategoryToggle}
              getCategoryName={getCategoryName}
              getCategoryColor={getCategoryColor}
              currentLanguage={currentLanguage}
              exploreMode={exploreMode}
              setExploreMode={setExploreMode}
              calculationMethod={calculationMethod}
            />
          </div>
          <HiddenItemsBadges
            hiddenScopes={hiddenScopes}
            hiddenCategories={hiddenCategories}
            onScopeToggle={handleScopeToggle}
            onCategoryToggle={handleCategoryToggle}
            getCategoryName={getCategoryName}
            getCategoryColor={getCategoryColor}
          />

          {/* Calculation Method Toggle - only show if feature flag enabled */}
          {showCalculationToggle && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                <Text variant="body" className="text-sm text-grey">
                  Calculation Method:
                </Text>
                {trendOptions.map((opt) => (
                  <Button
                    key={opt.key}
                    variant={
                      calculationMethod === opt.key ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCalculationMethod(opt.key as any)}
                    className={
                      calculationMethod === opt.key
                        ? "bg-blue-3 text-white border-blue-3"
                        : ""
                    }
                    style={{ minWidth: 110, marginBottom: 4 }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              {/* Method Description */}
              <div className="bg-black-2 rounded-lg p-4 max-w-4xl mx-auto">
                <Text
                  variant="body"
                  className="text-sm text-grey mb-2 font-medium"
                >
                  {calculationMethod === "simple" && "Simple Method"}
                  {calculationMethod === "linear" &&
                    "Sophisticated (Linear) Method"}
                  {calculationMethod === "exponential" && "Exponential Method"}
                  {calculationMethod === "weighted" && "Weighted Recent Method"}
                  {calculationMethod === "weightedExponential" &&
                    "Weighted Exponential Method"}
                  {calculationMethod === "recentExponential" &&
                    "Recent Exponential Method"}
                </Text>

                {calculationMethod === "simple" && (
                  <div className="text-xs text-grey space-y-2">
                    <p>
                      <strong>How it works:</strong> Calculates the average
                      annual change (slope) from all data points since the base
                      year, then projects forward from the last data point.
                    </p>
                    <p>
                      <strong>Formula:</strong> Average annual change = (Total
                      change in emissions) ÷ (Total years between data points)
                    </p>
                    <p>
                      <strong>Projection:</strong> Starts from the last reported
                      data point and applies the average annual change for each
                      future year.
                    </p>
                    <p>
                      <strong>Use case:</strong> Best for companies with
                      relatively consistent year-over-year changes. Simple and
                      intuitive.
                    </p>
                  </div>
                )}

                {calculationMethod === "linear" && (
                  <div className="text-xs text-grey space-y-2">
                    <p>
                      <strong>How it works:</strong> Uses linear regression
                      (least squares) to fit a straight line through all data
                      points since the base year, then anchors the projection at
                      the last data point.
                    </p>
                    <p>
                      <strong>Formula:</strong> Linear regression calculates the
                      best-fit line that minimizes the sum of squared
                      differences from actual data points.
                    </p>
                    <p>
                      <strong>Projection:</strong> The regression line is scaled
                      so it passes through the last reported data point,
                      ensuring continuity.
                    </p>
                    <p>
                      <strong>Use case:</strong> Best for companies with varying
                      year-over-year changes but an overall linear trend. More
                      mathematically rigorous than simple method.
                    </p>
                  </div>
                )}

                {calculationMethod === "exponential" && (
                  <div className="text-xs text-grey space-y-2">
                    <p>
                      <strong>How it works:</strong> Fits an exponential curve
                      (y = a × e^(bx)) to all data points since the base year,
                      then scales it to pass through the last data point.
                    </p>
                    <p>
                      <strong>Formula:</strong> Exponential fit: y = a × e^(bx),
                      where a and b are calculated using logarithmic regression
                      on the data.
                    </p>
                    <p>
                      <strong>Projection:</strong> The exponential curve is
                      scaled so it passes through the last reported data point,
                      then projected forward.
                    </p>
                    <p>
                      <strong>Use case:</strong> Best for companies showing
                      accelerating or decelerating trends (curved patterns).
                      Captures non-linear growth or decline.
                    </p>
                  </div>
                )}

                {calculationMethod === "weighted" && (
                  <div className="text-xs text-grey space-y-2">
                    <p>
                      <strong>How it works:</strong> Uses weighted linear
                      regression that gives double weight to the last 2 data
                      points when there are 4+ reporting years from the base
                      year. Falls back to regular linear regression for fewer
                      data points.
                    </p>
                    <p>
                      <strong>Formula:</strong> Weighted linear regression where
                      recent points (last 2) get weight 2, older points get
                      weight 1. This emphasizes recent trends while still
                      considering historical data.
                    </p>
                    <p>
                      <strong>Projection:</strong> The weighted regression line
                      is anchored at the last reported data point, ensuring
                      continuity with actual data.
                    </p>
                    <p>
                      <strong>Use case:</strong> Best for companies where recent
                      data is more indicative of current trends. Useful when
                      recent policy changes or business decisions may have
                      altered the emissions trajectory.
                    </p>
                  </div>
                )}

                {calculationMethod === "weightedExponential" && (
                  <div className="text-xs text-grey space-y-2">
                    <p>
                      <strong>How it works:</strong> Fits an exponential curve
                      (y = a × e^(bx)) using weighted regression that gives
                      exponential decay weights to data points. Recent data has
                      more influence on the curve fit.
                    </p>
                    <p>
                      <strong>Formula:</strong> Weighted exponential regression:
                      y = a × e^(bx), where weights follow exponential decay
                      (most recent = 1, next = 0.7, next = 0.49, etc.). This
                      emphasizes recent trends while fitting an exponential
                      curve.
                    </p>
                    <p>
                      <strong>Projection:</strong> The weighted exponential
                      curve is scaled to pass through the last reported data
                      point, then projected forward using the exponential
                      formula.
                    </p>
                    <p>
                      <strong>Use case:</strong> Best for companies showing
                      accelerating/decelerating trends where recent data is more
                      reliable. Combines the benefits of exponential fitting
                      with recent data emphasis.
                    </p>
                  </div>
                )}

                {calculationMethod === "recentExponential" && (
                  <div className="text-xs text-grey space-y-2">
                    <p>
                      <strong>How it works:</strong> Fits an exponential curve
                      (y = a × e^(bx)) to only the last 4 years of data,
                      ignoring older historical data points.
                    </p>
                    <p>
                      <strong>Formula:</strong> Exponential regression on recent
                      data: y = a × e^(bx), calculated using only the last 4
                      reporting years. This focuses entirely on recent trends.
                    </p>
                    <p>
                      <strong>Projection:</strong> The exponential curve is
                      scaled to pass through the last reported data point, then
                      projected forward using the exponential formula.
                    </p>
                    <p>
                      <strong>Use case:</strong> Best for companies where recent
                      data is most relevant and older data may not reflect
                      current business conditions or policy changes. Useful when
                      there have been significant recent changes in operations.
                    </p>
                  </div>
                )}

                <div className="text-xs text-grey mt-3 pt-3 border-t border-grey/20">
                  <p>
                    <strong>Note:</strong> All methods anchor the projection at
                    the last reported data point to ensure continuity. The trend
                    line shows estimated values from the last reported year to
                    the current year, then projects future values.
                  </p>
                </div>
              </div>
            </div>
          )}
        </SectionWithHelp>
      )}
      {exploreMode && (
        <div className="w-full h-full flex-1">
          <EmissionsLineChart
            data={chartData}
            companyBaseYear={companyBaseYear}
            dataView={dataView}
            hiddenScopes={hiddenScopes}
            hiddenCategories={hiddenCategories}
            handleClick={handleClick}
            handleScopeToggle={handleScopeToggle}
            handleCategoryToggle={handleCategoryToggle}
            getCategoryName={getCategoryName}
            getCategoryColor={getCategoryColor}
            currentLanguage={currentLanguage}
            exploreMode={exploreMode}
            setExploreMode={setExploreMode}
            calculationMethod={calculationMethod}
          />
        </div>
      )}
    </div>
  );
}
