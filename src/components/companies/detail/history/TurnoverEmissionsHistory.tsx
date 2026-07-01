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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex w-full flex-col lg:w-1/2">
          <CardHeader
            title={t("companies.turnoverEmissionsHistory.title")}
            tooltipContent={t("companies.turnoverEmissionsHistory.tooltip")}
            unit={t("companies.turnoverEmissionsHistory.unit")}
            className="[&>div]:mb-4 lg:[&>div]:mb-6"
          />
          <div style={{ height: getDynamicChartHeight("overview", isMobile) }}>
            <TurnoverEmissionsChart
              displayData={section.displayData}
              companyBaseYear={companyBaseYear}
              onYearSelect={(year) => onYearSelect?.(year.toString())}
            />
          </div>
        </div>
        <div className="flex w-full flex-col lg:w-1/2">
          <CardHeader
            title={t(
              "companies.turnoverEmissionsHistory.intensityPanel.title",
            )}
            tooltipContent={t(
              "companies.turnoverEmissionsHistory.intensityPanel.tooltip",
            )}
            className="[&>div]:mb-4 lg:[&>div]:mb-6"
          />
          <TurnoverEmissionsIntensityPanel comparison={section.comparison} />
        </div>
      </div>
    </SectionWithHelp>
  );
}
