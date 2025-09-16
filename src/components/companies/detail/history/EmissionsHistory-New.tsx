import { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { EmissionPeriod } from "@/types/emissions";
import { interpolateScope3Categories } from "@/utils/data/chartData";
import type { EmissionsHistoryProps, DataView } from "@/types/emissions";
import { getChartData } from "../../../../utils/data/chartData";
import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ChartHeader,
  getDynamicChartHeight,
  useDataView,
  useTimeSeriesChartState,
  useHiddenItems,
} from "@/components/charts";
import { OverviewChartNew } from "./OverviewChart-New";
import { ScopesChartNew } from "./ScopesChart-New";
import { CategoriesChartNew } from "./CategoriesChart-New";
import { ExploreMode } from "./explore-mode/ExploreMode";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { selectBestTrendLineMethod } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { isMobile } from "react-device-detect";

export function EmissionsHistoryNew({
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

  const { dataView, setDataView } = useDataView<DataView>(
    "overview",
    hasScope3Categories
      ? ["overview", "scopes", "categories"]
      : ["overview", "scopes"],
  );

  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();

  const { hiddenItems: hiddenScopes, toggleItem: toggleScope } = useHiddenItems<
    "scope1" | "scope2" | "scope3"
  >([]);

  const { hiddenItems: hiddenCategories, toggleItem: toggleCategory } =
    useHiddenItems<number>([]);

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

  // Calculate trend analysis for unified coefficients
  const trendAnalysis = useMemo(() => {
    if (dataView !== "overview") return null;

    const emissionsData = chartData
      .filter((d) => d.total !== undefined && d.total !== null)
      .map((d) => ({ year: d.year, total: d.total as number }));

    if (emissionsData.length < 2) return null;

    return selectBestTrendLineMethod(emissionsData, companyBaseYear);
  }, [chartData, dataView, companyBaseYear]);

  const handleYearSelect = (year: number) => {
    onYearSelect?.(year.toString());
  };

  // Toggle handlers using the new hooks
  const handleScopeToggle = (scope: "scope1" | "scope2" | "scope3") => {
    toggleScope(scope);
  };

  const handleCategoryToggle = (categoryId: number) => {
    toggleCategory(categoryId);
  };

  const [exploreMode, setExploreMode] = useState(false);

  // Generate approximated data for overview
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
        chartData,
        undefined, // regression
        chartEndYear,
        companyBaseYear,
        trendAnalysis.coefficients,
        trendAnalysis.cleanData,
      );
    }

    // Fallback to simple method if no coefficients available
    return generateApproximatedData(
      chartData,
      { slope: 0, intercept: 0 },
      chartEndYear,
      companyBaseYear,
    );
  }, [chartData, dataView, chartEndYear, companyBaseYear, trendAnalysis]);

  // Calculate yDomain for explore mode
  const yDomain = useMemo((): [number, number] => {
    const values = chartData
      .filter((d) => d.total !== undefined && d.total !== null)
      .map((d) => d.total as number);

    if (values.length === 0) return [0, 1000];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;

    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  // Explore mode handlers
  const handleExitExploreMode = () => {
    setExploreMode(false);
  };

  if (!reportingPeriods?.length) {
    return (
      <div className="text-center py-12">
        <Text variant="body">
          {t("companies.emissionsHistory.noReportingPeriods")}
        </Text>
      </div>
    );
  }

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
            setDataView={(value) =>
              setDataView(value as "overview" | "scopes" | "categories")
            }
            hasAdditionalData={hasScope3Categories}
            dataViewType="company"
          />
          <div style={{ height: getDynamicChartHeight(dataView, isMobile) }}>
            {!exploreMode ? (
              <>
                {dataView === "overview" && (
                  <OverviewChartNew
                    data={chartData}
                    companyBaseYear={companyBaseYear}
                    chartEndYear={chartEndYear}
                    setChartEndYear={setChartEndYear}
                    shortEndYear={shortEndYear}
                    longEndYear={longEndYear}
                    approximatedData={approximatedData}
                    onYearSelect={handleYearSelect}
                    exploreMode={exploreMode}
                    setExploreMode={setExploreMode}
                  />
                )}
                {dataView === "scopes" && (
                  <ScopesChartNew
                    data={chartData}
                    companyBaseYear={companyBaseYear}
                    chartEndYear={chartEndYear}
                    setChartEndYear={setChartEndYear}
                    shortEndYear={shortEndYear}
                    longEndYear={longEndYear}
                    hiddenScopes={Array.from(hiddenScopes)}
                    handleScopeToggle={handleScopeToggle}
                    onYearSelect={handleYearSelect}
                    exploreMode={exploreMode}
                    setExploreMode={setExploreMode}
                  />
                )}
                {dataView === "categories" && (
                  <CategoriesChartNew
                    data={chartData}
                    companyBaseYear={companyBaseYear}
                    chartEndYear={chartEndYear}
                    setChartEndYear={setChartEndYear}
                    shortEndYear={shortEndYear}
                    longEndYear={longEndYear}
                    hiddenCategories={Array.from(hiddenCategories)}
                    handleCategoryToggle={handleCategoryToggle}
                    getCategoryName={getCategoryName}
                    getCategoryColor={getCategoryColor}
                    onYearSelect={handleYearSelect}
                    exploreMode={exploreMode}
                    setExploreMode={setExploreMode}
                  />
                )}
              </>
            ) : (
              <ExploreMode
                data={chartData}
                companyBaseYear={companyBaseYear}
                currentLanguage={currentLanguage}
                trendAnalysis={trendAnalysis}
                yDomain={yDomain}
                onExit={handleExitExploreMode}
              />
            )}
          </div>
        </SectionWithHelp>
      )}
    </div>
  );
}
