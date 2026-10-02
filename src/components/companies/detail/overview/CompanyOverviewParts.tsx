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
import { OverviewStat } from "./OverviewStat";
import { FinancialsTooltip } from "./FinancialsTooltip";
import { CompanyOverviewTooltip } from "./CompanyOverviewTooltip";
import type { CompanyBenchmarkSet } from "@/utils/detail/companyBenchmarks";

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
  benchmarks?: CompanyBenchmarkSet | null;
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
  benchmarks,
}: CompanyOverviewMainStatsProps) {
  const { t } = useTranslation();
  const meetsParisDisplay = getMeetsParisDisplay(meetsParis, t);

  return (
    <div className="mb-8 grid grid-cols-1 gap-8 md:mb-12 md:grid-cols-3 md:items-start md:gap-12">
      <OverviewStat
        label={t("detailPage.meetsParisGoal")}
        value={meetsParisDisplay.value}
        valueClassName={meetsParisDisplay.valueClassName}
        caption={meetsParisDisplay.caption}
        benchmark={benchmarks?.meetsParis}
      />
      <OverviewStat
        label={
          <div className="flex items-center gap-2">
            <Text variant="body" className="lg:text-lg md:text-base text-sm">
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
        benchmark={benchmarks?.totalEmissions}
      />

      <OverviewStat
        label={
          <div className="flex items-center gap-2">
            <Text className="mb-1 md:mb-2 lg:text-lg md:text-base sm:text-sm">
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
        benchmark={benchmarks?.yearOverYearChange}
      />
    </div>
  );
}
