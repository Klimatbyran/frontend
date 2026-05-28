import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Text } from "@/components/ui/text";
import type { EmissionsHistoryProps, DataView } from "@/types/emissions";
import {
  getDynamicChartHeight,
  useDataView,
  useTimeSeriesChartState,
  useHiddenItems,
  useCompanyViewOptions,
} from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { getChartData } from "../../../../utils/data/chartData";
import { ScopesChart } from "./ScopesChart";
import { OverviewChart } from "./OverviewChart";

export function EmissionsHistory({
  company,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  // Check if company is in Financials sector
  const isFinancialsSector =
    company.industry?.industryGics?.sectorCode === "40";

  const { dataView, setDataView } = useDataView<DataView>("overview", [
    "overview",
    "scopes",
  ]);

  const dataViewOptions = useCompanyViewOptions();

  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();

  const { hiddenItems: hiddenScopes, toggleItem: toggleScope } = useHiddenItems<
    "scope1" | "scope2" | "scope3"
  >([]);

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
  }, [chartData, dataView, chartEndYear, companyBaseYear, trendAnalysis]);

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
          unit={t("companies.emissionsHistory.unit")}
          dataView={dataView}
          setDataView={(value) => setDataView(value as "overview" | "scopes")}
          dataViewOptions={dataViewOptions}
          dataViewPlaceholder={t("companies.dataView.selectView")}
        />
        <div style={{ height: getDynamicChartHeight(dataView, isMobile) }}>
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
            />
          )}
        </div>
      </SectionWithHelp>
    </div>
  );
}
