import { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
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
    </SectionWithHelp>
  );
}
