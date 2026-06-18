import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import type { EmissionsHistoryProps } from "@/types/emissions";
import { getDynamicChartHeight } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getChartData } from "@/utils/data/chartData";
import { hasEnoughTurnoverData } from "@/utils/data/turnoverChartData";
import { TurnoverChart } from "./TurnoverChart";

export function TurnoverHistory({
  company,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const companyBaseYear = company.baseYear?.year;

  const chartData = useMemo(
    () => getChartData(company.reportingPeriods, isAIGenerated, isEmissionsAIGenerated),
    [company.reportingPeriods, isAIGenerated, isEmissionsAIGenerated],
  );

  if (!hasEnoughTurnoverData(company.reportingPeriods)) {
    return null;
  }

  const handleYearSelect = (year: number) => {
    onYearSelect?.(year.toString());
  };

  return (
    <div>
      <SectionWithHelp helpItems={["companyTurnover"]}>
        <CardHeader
          title={t("companies.turnoverHistory.title")}
          tooltipContent={t("companies.turnoverHistory.tooltip")}
          unit={t("companies.turnoverHistory.unit")}
        />
        <div style={{ height: getDynamicChartHeight("overview", isMobile) }}>
          <TurnoverChart
            data={chartData}
            companyBaseYear={companyBaseYear}
            onYearSelect={handleYearSelect}
          />
        </div>
      </SectionWithHelp>
    </div>
  );
}
