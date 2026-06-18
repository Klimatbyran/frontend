import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";
import { localizeUnit } from "@/utils/formatting/localization";
import { formatPercentChange } from "@/utils/formatting/localization";
import type { EmissionsIntensitySummary } from "@/types/emissionsIntensity";

interface EmissionsIntensitySummaryProps {
  summary: EmissionsIntensitySummary;
}

export function EmissionsIntensitySummaryPanel({
  summary,
}: EmissionsIntensitySummaryProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const trendConfig = {
    improving: {
      label: t("companies.emissionsIntensity.summary.improving"),
      description: t(
        "companies.emissionsIntensity.summary.improvingDescription",
      ),
      className: "text-green-3",
      icon: ArrowDownRight,
    },
    worsening: {
      label: t("companies.emissionsIntensity.summary.worsening"),
      description: t(
        "companies.emissionsIntensity.summary.worseningDescription",
      ),
      className: "text-pink-3",
      icon: ArrowUpRight,
    },
    stable: {
      label: t("companies.emissionsIntensity.summary.stable"),
      description: t("companies.emissionsIntensity.summary.stableDescription"),
      className: "text-grey",
      icon: ArrowRight,
    },
  }[summary.trend];

  const TrendIcon = trendConfig.icon;
  const changeLabel = formatPercentChange(
    summary.changeFromFirstYearPercent,
    currentLanguage,
  );

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-level-2 bg-black-1 p-4 md:p-5">
        <Text className="text-sm text-grey">
          {t("companies.emissionsIntensity.summary.latestIntensity")}
        </Text>
        <div className="mt-2 flex items-baseline gap-2">
          <Text className="text-3xl md:text-4xl font-light tracking-tight">
            {localizeUnit(summary.latestIntensity, currentLanguage)}
          </Text>
          <Text className="text-sm text-grey">
            {t("companies.emissionsIntensity.unitShort", {
              currency: summary.turnoverCurrency ?? "",
            })}
          </Text>
        </div>
        <Text className="mt-2 text-xs text-grey">
          {t("companies.emissionsIntensity.summary.latestYear", {
            year: summary.latestYear,
          })}
        </Text>
      </div>

      <div className="rounded-level-2 bg-black-1 p-4 md:p-5">
        <Text className="text-sm text-grey">
          {t("companies.emissionsIntensity.summary.changeSinceFirstYear")}
        </Text>
        <div className="mt-2 flex items-center gap-2">
          <Text
            className={cn(
              "text-3xl md:text-4xl font-light tracking-tight",
              summary.changeFromFirstYearPercent < 0
                ? "text-green-3"
                : summary.changeFromFirstYearPercent > 0
                  ? "text-pink-3"
                  : "text-white",
            )}
          >
            {changeLabel}
          </Text>
        </div>
        <Text className="mt-2 text-xs text-grey">
          {t("companies.emissionsIntensity.summary.sinceYear", {
            year: summary.firstYear,
          })}
        </Text>
      </div>

      <div className="rounded-level-2 bg-black-1 p-4 md:p-5">
        <Text className="text-sm text-grey">
          {t("companies.emissionsIntensity.summary.trend")}
        </Text>
        <div className="mt-2 flex items-center gap-2">
          <TrendIcon className={cn("h-6 w-6", trendConfig.className)} />
          <Text className={cn("text-xl md:text-2xl", trendConfig.className)}>
            {trendConfig.label}
          </Text>
        </div>
        <Text className="mt-2 text-xs text-grey">
          {trendConfig.description}
        </Text>
      </div>
    </div>
  );
}
