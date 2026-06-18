import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { getDynamicChartHeight } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import type { EmissionsHistoryProps } from "@/types/emissions";
import {
  getEmissionsIntensityData,
  getEmissionsIntensitySummary,
  hasEnoughIntensityData,
} from "@/utils/data/emissionsIntensityData";
import { EmissionsIntensityChart } from "./EmissionsIntensityChart";
import { EmissionsIntensitySummaryPanel } from "./EmissionsIntensitySummary";

export function EmissionsIntensityHistory({
  company,
  onYearSelect,
}: EmissionsHistoryProps) {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const intensityData = useMemo(
    () =>
      getEmissionsIntensityData(
        company.reportingPeriods,
        isAIGenerated,
        isEmissionsAIGenerated,
      ),
    [company.reportingPeriods, isAIGenerated, isEmissionsAIGenerated],
  );

  const summary = useMemo(
    () => getEmissionsIntensitySummary(intensityData),
    [intensityData],
  );

  if (!hasEnoughIntensityData(company.reportingPeriods) || !summary) {
    return null;
  }

  const handleYearSelect = (year: number) => {
    onYearSelect?.(year.toString());
  };

  return (
    <div>
      <SectionWithHelp helpItems={["companyTurnover", "historicalEmissions"]}>
        <CardHeader
          title={t("companies.emissionsIntensity.title")}
          tooltipContent={t("companies.emissionsIntensity.tooltip")}
          unit={t("companies.emissionsIntensity.unit", {
            currency: summary.turnoverCurrency ?? "",
          })}
        />

        <EmissionsIntensitySummaryPanel summary={summary} />

        <div style={{ height: getDynamicChartHeight("overview", isMobile) }}>
          <EmissionsIntensityChart
            data={intensityData}
            summary={summary}
            companyBaseYear={company.baseYear?.year}
            onYearSelect={handleYearSelect}
          />
        </div>
      </SectionWithHelp>
    </div>
  );
}
