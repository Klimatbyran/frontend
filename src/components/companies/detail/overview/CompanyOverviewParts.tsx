import { Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Text } from "@/components/ui/text";
import type { ReportingPeriod } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { EmissionsAssessmentButton } from "../emissions-assessment/EmissionsAssessmentButton";
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
  const navigate = useNavigate();

  if (!token) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => navigate("edit")}
      >
        Edit
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-5/30 text-xs text-orange-2">
          <Pen />
        </div>
      </Button>
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

function getMeetsParisDisplay(
  meetsParis: boolean | null,
  t: (key: string) => string,
) {
  if (meetsParis === true) {
    return { value: t("yes"), className: "text-green-3" };
  }
  if (meetsParis === false) {
    return { value: t("no"), className: "text-pink-3" };
  }
  return { value: t("unknown"), className: "text-grey" };
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
    <div className="mb-2 md:mb-4 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:gap-16 md:items-center">
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
              : formatEmissionsAbsolute(
                  calculatedTotalEmissions,
                  currentLanguage,
                )
          }
          valueClassName={
            !calculatedTotalEmissions ? "text-grey" : "text-orange-2"
          }
          unit={calculatedTotalEmissions ? t("emissionsUnit") : undefined}
          showAiIcon={totalEmissionsAIGenerated}
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
                {formatPercentChange(
                  yearOverYearChange,
                  currentLanguage,
                  false,
                )}
              </span>
            ) : (
              <span className="text-grey">
                {t("companies.overview.noData")}
              </span>
            )
          }
          showAiIcon={yearOverYearAIGenerated}
        />

        <OverviewStat
          label={t("companies.overview.onTrackToMeetParis")}
          value={meetsParisDisplay.value}
          valueClassName={meetsParisDisplay.className}
        />
      </div>
    </div>
  );
}
