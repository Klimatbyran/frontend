import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import type { ReportingPeriod } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { getMeetsParisDisplay } from "@/components/detail/meetsParisStat";
import { EmissionsAssessmentButton } from "../emissions-assessment/EmissionsAssessmentButton";
import {
  detailStatItemClassName,
  detailStatsRowClassName,
} from "@/components/detail/detailStatsLayout";
import { cn } from "@/lib/utils";
import { OverviewStat } from "./OverviewStat";
import { FinancialsTooltip } from "./FinancialsTooltip";
import { CompanyOverviewTooltip } from "./CompanyOverviewTooltip";

interface CompanyOverviewActionsProps {
  companyId: string;
  sortedPeriods: ReportingPeriod[];
}

export function CompanyOverviewActions({
  companyId,
  sortedPeriods,
}: CompanyOverviewActionsProps) {
  const { token } = useAuth();

  if (!token) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2">
      <EmissionsAssessmentButton
        companyId={companyId}
        sortedPeriods={sortedPeriods}
      />
    </div>
  );
}

interface CompanyOverviewMainStatsProps {
  periodYear: string;
  sectorCode?: string;
  calculatedTotalEmissions: number | null;
  currentLanguage: string;
  totalEmissionsAIGenerated: boolean;
  yearOverYearChange: number | null;
  yearOverYearAIGenerated: boolean;
  meetsParis: boolean | null;
}

export function CompanyOverviewMainStats({
  periodYear,
  sectorCode,
  calculatedTotalEmissions,
  currentLanguage,
  totalEmissionsAIGenerated,
  yearOverYearChange,
  yearOverYearAIGenerated,
  meetsParis,
}: CompanyOverviewMainStatsProps) {
  const { t } = useTranslation();
  const meetsParisDisplay = getMeetsParisDisplay(meetsParis, t);

  return (
    <div className={cn("mb-8 md:mb-12", detailStatsRowClassName)}>
      <OverviewStat
        className={detailStatItemClassName}
        useFlex1={false}
        label={t("detailPage.meetsParisGoal")}
        value={meetsParisDisplay.value}
        valueClassName={meetsParisDisplay.valueClassName}
        caption={meetsParisDisplay.caption}
      />
      <OverviewStat
        className={detailStatItemClassName}
        useFlex1={false}
        label={
          <div className="flex items-center gap-2">
            <Text className="mb-1 md:mb-2 lg:text-base md:text-sm sm:text-sm">
              {t("companies.overview.changeSinceLastYear")}
            </Text>
            <CompanyOverviewTooltip yearOverYearChange={yearOverYearChange} />
          </div>
        }
        value={
          yearOverYearChange !== null ? (
            <span
              className={
                yearOverYearChange < 0 ? "text-orange-2" : "text-pink-3"
              }
            >
              {formatPercentChange(yearOverYearChange, currentLanguage, false)}
            </span>
          ) : (
            <span className="text-grey">{t("companies.overview.noData")}</span>
          )
        }
        showAiIcon={yearOverYearAIGenerated}
      />

      <OverviewStat
        className={detailStatItemClassName}
        useFlex1={false}
        label={
          <div className="flex items-center gap-2">
            <Text variant="body" className="lg:text-base md:text-sm text-sm">
              {t("companies.overview.totalEmissions")} {periodYear}
            </Text>
            {sectorCode === "40" && <FinancialsTooltip />}
          </div>
        }
        value={
          !calculatedTotalEmissions
            ? t("companies.overview.noData")
            : formatEmissionsAbsolute(calculatedTotalEmissions, currentLanguage)
        }
        valueClassName={
          !calculatedTotalEmissions ? "text-grey" : "text-orange-2"
        }
        unit={calculatedTotalEmissions ? t("emissionsUnit") : undefined}
        showAiIcon={totalEmissionsAIGenerated}
      />
    </div>
  );
}
