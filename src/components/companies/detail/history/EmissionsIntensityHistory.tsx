import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { getDynamicChartHeight, useDataView } from "@/components/charts";
import { ViewOption } from "@/components/charts/DataViewSelector";
import { CardHeader } from "@/components/layout/CardHeader";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import type { EmissionsHistoryProps } from "@/types/emissions";
import type { EmissionsIntensityView } from "@/types/emissionsIntensity";
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

  const { dataView, setDataView } = useDataView<EmissionsIntensityView>(
    "intensity",
    ["intensity", "growth"],
  );

  const dataViewOptions = useMemo(
    (): ViewOption<EmissionsIntensityView>[] => [
      {
        value: "intensity",
        label: t("companies.emissionsIntensity.views.intensity"),
      },
      {
        value: "growth",
        label: t("companies.emissionsIntensity.views.growth"),
      },
    ],
    [t],
  );

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
          dataView={dataView}
          setDataView={setDataView}
          dataViewOptions={dataViewOptions}
          dataViewPlaceholder={t("companies.dataView.selectView")}
        />

        <EmissionsIntensitySummaryPanel summary={summary} />

        <div style={{ height: getDynamicChartHeight(dataView, isMobile) }}>
          <EmissionsIntensityChart
            data={intensityData}
            summary={summary}
            dataView={dataView}
            companyBaseYear={company.baseYear?.year}
            onYearSelect={handleYearSelect}
          />
        </div>
      </SectionWithHelp>
    </div>
  );
}
