import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Text } from "@/components/ui/text";
import type { PageCompanyEmissionsHistory } from "@/types/pages";
import { useTimeSeriesChartState } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import {
  approximatedDataFromEmissionsHistory,
  chartDataFromEmissionsHistory,
} from "@/utils/pages/companyDetailAdapters";
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
  const approximatedData = useMemo(
    () => approximatedDataFromEmissionsHistory(history, chartEndYear),
    [history, chartEndYear],
  );

  const handleYearSelect = (year: number) => {
    onYearSelect?.(year.toString());
  };

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
