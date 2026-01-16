import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Text } from "@/components/ui/text";
import type { EmissionsHistoryProps, DataView } from "@/types/emissions";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getDynamicChartHeight,
  useDataView,
  useTimeSeriesChartState,
  useHiddenItems,
  useCompanyViewOptions,
  ChartModeSelector,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { getChartData } from "../../../../utils/data/chartData";
import { ExploreMode } from "./explore-mode/ExploreMode";
import { CategoriesChart } from "./CategoriesChart";
import { ScopesChart } from "./ScopesChart";
import { OverviewChart } from "./OverviewChart";

export function EmissionsHistory({
  company,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { getCategoryName, getCategoryColor } = useCategoryMetadata();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  // Check if company is in Financials sector
  const isFinancialsSector =
    company.industry?.industryGics?.sectorCode === "40";

  const hasScope3Categories = useMemo(
    () =>
      company.reportingPeriods.some(
        (period) => period.emissions?.scope3?.categories?.length ?? false,
      ),
    [company.reportingPeriods],
  );

  const { dataView, setDataView } = useDataView<DataView>(
    "overview",
    hasScope3Categories
      ? ["overview", "scopes", "categories"]
      : ["overview", "scopes"],
  );

  const dataViewOptions = useCompanyViewOptions(hasScope3Categories);

  const {
    chartEndYear,
    setChartEndYear,
    shortEndYear,
    longEndYear,
    chartMode,
    setChartMode,
  } = useTimeSeriesChartState();

  const { hiddenItems: hiddenScopes, toggleItem: toggleScope } = useHiddenItems<
    "scope1" | "scope2" | "scope3"
  >([]);

  const { hiddenItems: hiddenCategories, toggleItem: toggleCategory } =
    useHiddenItems<number>([]);

  const companyBaseYear = company.baseYear?.year;

  const processedPeriods = useMemo(
    () => company.reportingPeriods,
    [company.reportingPeriods],
  );

  // Process data based on view
  const chartData = useMemo(
    () => getChartData(processedPeriods, isAIGenerated, isEmissionsAIGenerated),
    [processedPeriods, isAIGenerated, isEmissionsAIGenerated],
  );

  // Calculate trend analysis for unified coefficients
  const trendAnalysis = useMemo(() => {
    if (dataView !== "overview") return null;

    // Use API slope if company data is available and has trendline slope
    if (company) {
      return calculateTrendline(company);
    }

    // No company data available, no trendline
    return null;
  }, [dataView, company]);

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

    // Only show future projections if we have a valid trend analysis with coefficients
    if (trendAnalysis?.coefficients) {
      return generateApproximatedData(
        chartData,
        chartEndYear,
        trendAnalysis.coefficients,
      );
    }

    // No trend analysis = no future projections
    return null;
  }, [chartData, dataView, chartEndYear, trendAnalysis]);

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

  if (!company.reportingPeriods?.length) {
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
            // "howTrendLinesCalculated",
            // "whatTrendLineRepresents",
            "scope3EmissionLevels",
            "companyMissingData",
            "historicalEmissions",
            ...(isFinancialsSector
              ? (["financialsScope3Category15"] as const)
              : []),
          ]}
        >
          <CardHeader
            title={t("companies.emissionsHistory.title")}
            tooltipContent={t("companies.emissionsHistory.tooltip")}
            unit={
              <ChartModeSelector
                chartMode={chartMode}
                setChartMode={setChartMode}
              />
            }
            dataView={dataView}
            setDataView={(value) =>
              setDataView(value as "overview" | "scopes" | "categories")
            }
            dataViewOptions={dataViewOptions}
            dataViewPlaceholder={t("companies.dataView.selectView")}
          />
          <div style={{ height: getDynamicChartHeight(dataView, isMobile) }}>
            {!exploreMode ? (
              <>
                {dataView === "overview" && (
                  <OverviewChart
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
                    chartMode={chartMode}
                  />
                )}
                {dataView === "scopes" && (
                  <ScopesChart
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
                    chartMode={chartMode}
                  />
                )}
                {dataView === "categories" && (
                  <CategoriesChart
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
                    chartMode={chartMode}
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
