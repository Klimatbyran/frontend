import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import type { PageCompanyTurnoverHistory } from "@/types/pages";
import { getDynamicChartHeight } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { chartDataFromTurnoverDecoupling } from "@/utils/pages/companyDetailAdapters";
import { TurnoverEmissionsChart } from "./TurnoverEmissionsChart";
import { TurnoverEmissionsIntensityPanel } from "./TurnoverEmissionsIntensityPanel";

interface TurnoverEmissionsHistoryProps {
  history: PageCompanyTurnoverHistory;
  onYearSelect?: (year: string) => void;
}

export function TurnoverEmissionsHistory({
  history,
  onYearSelect,
}: TurnoverEmissionsHistoryProps) {
  const { t } = useTranslation();
  const companyBaseYear = history.baseYear ?? undefined;
  const decoupling = history.decoupling;

  const displayData = useMemo(
    () => chartDataFromTurnoverDecoupling(history),
    [history],
  );

  if (!decoupling || displayData.length === 0) return null;

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
            displayData={displayData}
            companyBaseYear={companyBaseYear}
            onYearSelect={
              onYearSelect ? (year) => onYearSelect(year.toString()) : undefined
            }
          />
        </div>
        <TurnoverEmissionsIntensityPanel comparison={decoupling.comparison} />
      </div>
    </SectionWithHelp>
  );
}
