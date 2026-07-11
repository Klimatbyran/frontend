import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import type { EmissionsHistoryProps } from "@/types/emissions";
import { getDynamicChartHeight } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { getChartData } from "@/utils/data/chartData";
import { getTurnoverEmissionsSection } from "@/utils/data/turnoverChartData";
import { TurnoverEmissionsChart } from "./TurnoverEmissionsChart";
import { TurnoverEmissionsIntensityPanel } from "./TurnoverEmissionsIntensityPanel";

export function TurnoverEmissionsHistory({
  company,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const companyBaseYear = company.baseYear?.year;

  const section = useMemo(() => {
    const chartData = getChartData(
      company.reportingPeriods,
      isAIGenerated,
      isEmissionsAIGenerated,
    );

    return getTurnoverEmissionsSection(chartData, companyBaseYear);
  }, [
    company.reportingPeriods,
    companyBaseYear,
    isAIGenerated,
    isEmissionsAIGenerated,
  ]);

  if (!section) return null;

  return (
    <SectionWithHelp helpItems={["companyTurnover", "historicalEmissions"]}>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-0">
        <div className="flex w-full flex-col lg:col-start-1 lg:row-start-1">
          <CardHeader
            title={t("companies.turnoverEmissionsHistory.title")}
            tooltipContent={t("companies.turnoverEmissionsHistory.tooltip")}
            unit={t("companies.turnoverEmissionsHistory.unit")}
            className="[&>div]:mb-3 lg:[&>div]:mb-6"
          />
        </div>
        <div
          className="flex w-full flex-col lg:col-start-1 lg:row-start-2"
          style={{
            height: isMobile
              ? "360px"
              : getDynamicChartHeight("overview", isMobile),
          }}
        >
          <TurnoverEmissionsChart
            displayData={section.displayData}
            companyBaseYear={companyBaseYear}
            onYearSelect={(year) => onYearSelect?.(year.toString())}
          />
        </div>
        <div className="flex w-full flex-col lg:col-start-2 lg:row-start-2 lg:h-full">
          <TurnoverEmissionsIntensityPanel comparison={section.comparison} />
        </div>
      </div>
    </SectionWithHelp>
  );
}
