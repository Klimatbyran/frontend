import { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { interpolateScope3Categories } from "@/lib/calculations/emissions";
import type { EmissionsHistoryProps, DataView } from "@/types/emissions";
import { getChartData } from "../../../../utils/getChartData";
import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useLanguage } from "@/components/LanguageProvider";
import { HiddenItemsBadges } from "../HiddenItemsBadges";
import ChartHeader from "./ChartHeader";
import EmissionsLineChart from "./EmissionsLineChart";

export function EmissionsHistory({
  reportingPeriods,
  onYearSelect,
  className,
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
        ? interpolateScope3Categories(reportingPeriods)
        : reportingPeriods,
    [reportingPeriods, features.interpolateScope3],
  );

  // Process data based on view
  const chartData = useMemo(
    () => getChartData(processedPeriods),
    [processedPeriods],
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

  // Add state for hidden categories
  const [hiddenCategories, setHiddenCategories] = useState<number[]>([]);

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
    <div
      className={cn("bg-black-2 rounded-level-1 px-4 md:px-16 py-8", className)}
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
    </div>
  );
}
