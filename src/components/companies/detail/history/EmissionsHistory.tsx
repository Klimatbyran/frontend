import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Text } from "@/components/ui/text";
import type { EmissionsHistoryProps } from "@/types/emissions";
import { useTimeSeriesChartState } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { getChartData } from "../../../../utils/data/chartData";
import { OverviewChart } from "./OverviewChart";

export function EmissionsHistory({
  company,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const isFinancialsSector =
    company.industry?.industryGics?.sectorCode === "40";

  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();

  const companyBaseYear = company.baseYear?.year;

  const processedPeriods = useMemo(
    () => company.reportingPeriods,
    [company.reportingPeriods],
  );

  const chartData = useMemo(
    () => getChartData(processedPeriods, isAIGenerated, isEmissionsAIGenerated),
    [processedPeriods, isAIGenerated, isEmissionsAIGenerated],
  );

  const trendAnalysis = useMemo(
    () => calculateTrendline(company),
    [company],
  );

  const handleYearSelect = (year: number) => {
    onYearSelect?.(year.toString());
  };

  const approximatedData = useMemo(() => {
    if (trendAnalysis?.coefficients) {
      return generateApproximatedData(
        chartData,
        chartEndYear,
        trendAnalysis.coefficients,
      );
    }

    return null;
  }, [chartData, chartEndYear, trendAnalysis]);

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
        />
        <div
          style={{
            height: isMobile ? "540px" : "555px",
          }}
        >
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
        </div>
      </SectionWithHelp>
    </div>
  );
}
