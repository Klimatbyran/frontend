import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import type { CompanyDetails } from "@/types/company";
import { getDynamicChartHeight } from "@/components/charts";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { Text } from "@/components/ui/text";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import {
  filterIntensityHistoryFromBaseYear,
  getEmissionsIntensityHistory,
  getIntensityTrend,
  getIntensityUnitCurrency,
} from "@/utils/data/emissionsIntensityData";
import { EmissionsIntensityTrendChart } from "./EmissionsIntensityTrendChart";
import { IntensityTrendStatus } from "./IntensityTrendStatus";

interface EmissionsIntensityProps {
  company: CompanyDetails;
}

export function EmissionsIntensity({ company }: EmissionsIntensityProps) {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const baseYear = company.baseYear?.year;

  const history = useMemo(() => {
    const fullHistory = getEmissionsIntensityHistory(
      company.reportingPeriods,
      isEmissionsAIGenerated,
      isAIGenerated,
    );

    return filterIntensityHistoryFromBaseYear(fullHistory, baseYear);
  }, [
    company.reportingPeriods,
    isEmissionsAIGenerated,
    isAIGenerated,
    baseYear,
  ]);

  const trend = useMemo(() => getIntensityTrend(history), [history]);

  const unit = useMemo(() => {
    const unitCurrency = getIntensityUnitCurrency(
      history.map((point) => point.currency),
    );
    return unitCurrency
      ? t("companies.emissionsIntensity.unit", { currency: unitCurrency })
      : t("companies.emissionsIntensity.unitGeneric");
  }, [history, t]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div>
      <SectionWithHelp helpItems={["companyTurnover", "totalEmissions"]}>
        <CardHeader
          title={t("companies.emissionsIntensity.title")}
          tooltipContent={t("companies.emissionsIntensity.tooltip")}
          unit={unit}
        />

        <div className="space-y-6 md:space-y-8">
          <Text variant="body" className="text-grey max-w-3xl">
            {t("companies.emissionsIntensity.explanation")}
          </Text>

          <IntensityTrendStatus trend={trend} />

          <div style={{ height: getDynamicChartHeight("overview", isMobile) }}>
            <EmissionsIntensityTrendChart
              data={history}
              companyBaseYear={baseYear}
              unitLabel={unit}
            />
          </div>
        </div>
      </SectionWithHelp>
    </div>
  );
}
