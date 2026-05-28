import { FC } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { IntensityTrend } from "@/utils/data/emissionsIntensityData";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

interface IntensityTrendStatusProps {
  trend: IntensityTrend;
}

const trendStyles = {
  decreasing: {
    container: "border-green-3/30 bg-green-3/10",
    iconWrap: "bg-green-3/20 text-green-3",
    label: "text-green-3",
    Icon: TrendingDown,
  },
  increasing: {
    container: "border-pink-3/30 bg-pink-3/10",
    iconWrap: "bg-pink-3/20 text-pink-3",
    label: "text-pink-3",
    Icon: TrendingUp,
  },
  stable: {
    container: "border-grey/30 bg-black-1",
    iconWrap: "bg-black-2 text-grey",
    label: "text-grey",
    Icon: Minus,
  },
  unknown: {
    container: "border-grey/30 bg-black-1",
    iconWrap: "bg-black-2 text-grey",
    label: "text-grey",
    Icon: Minus,
  },
} as const;

export const IntensityTrendStatus: FC<IntensityTrendStatusProps> = ({
  trend,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const styles = trendStyles[trend.direction];
  const Icon = styles.Icon;

  const titleKey = {
    decreasing: "companies.emissionsIntensity.trendDecreasing",
    increasing: "companies.emissionsIntensity.trendIncreasing",
    stable: "companies.emissionsIntensity.trendStable",
    unknown: "companies.emissionsIntensity.trendUnknown",
  }[trend.direction];

  const hintKey = {
    decreasing: "companies.emissionsIntensity.trendDecreasingHint",
    increasing: "companies.emissionsIntensity.trendIncreasingHint",
    stable: "companies.emissionsIntensity.trendStableHint",
    unknown: "companies.emissionsIntensity.trendUnknownDescription",
  }[trend.direction];

  return (
    <div
      className={cn(
        "rounded-level-2  p-4 md:p-6 flex items-start gap-4",
        styles.container,
      )}
    >
      <div className={cn("rounded-full p-3 shrink-0", styles.iconWrap)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <Text variant="h4" className={styles.label}>
          {t(titleKey)}
        </Text>
        <Text variant="body" className="text-grey">
          {t(hintKey)}
        </Text>
      </div>
    </div>
  );
};
