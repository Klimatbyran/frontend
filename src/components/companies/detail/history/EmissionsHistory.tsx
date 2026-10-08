import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Text } from "@/components/ui/text";
import type { PageCompanyEmissionsHistory } from "@/types/pages";
import { useTimeSeriesChartState } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import { chartDataFromEmissionsHistory } from "@/utils/pages/companyDetailAdapters";
import { OverviewChart } from "./OverviewChart";

interface EmissionsHistoryProps {
  history: PageCompanyEmissionsHistory;
  onYearSelect?: (year: string) => void;
}

export function EmissionsHistory({
  history,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const isFinancialsSector = history.sectorCode === "40";

  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();

  const companyBaseYear = history.baseYear ?? undefined;
  const chartData = useMemo(
    () => chartDataFromEmissionsHistory(history),
    [history],
  );

  const companyForTrend = useMemo(
    () => ({
      futureEmissionsTrendSlope: history.futureEmissionsTrendSlope,
      baseYear: history.baseYear != null ? { year: history.baseYear } : null,
      reportingPeriods: history.periods
        .filter((period) => period.total != null)
        .map((period) => ({
          endDate: `${period.year}-12-31`,
          emissions: { calculatedTotalEmissions: period.total },
        })),
    }),
    [history],
  );

  const trendAnalysis = useMemo(
    () => calculateTrendline(companyForTrend),
    [companyForTrend],
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

  if (!history.periods.length) {
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
