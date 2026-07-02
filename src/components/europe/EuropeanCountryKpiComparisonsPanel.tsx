import { type ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { EuropeanCountryKpiComparisonChart } from "@/components/europe/EuropeanCountryKpiComparisonChart";
import { EuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { cn } from "@/lib/utils";

type EuropeanCountryKpiComparisonsProps = {
  countryName: string;
  comparisons: EuropeanCountryKpiComparisons | null;
  leadingContent?: ReactNode;
};

function KpiChartCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-level-2 bg-white/5 p-4 shadow-lg backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EuropeanCountryKpiComparisonsPanel({
  countryName,
  comparisons,
  leadingContent,
}: EuropeanCountryKpiComparisonsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const europeanAverageLabel = t("europe.detailPage.europeanAverage");

  const formatPercent = useCallback(
    (value: number) => formatPercentChange(value, currentLanguage),
    [currentLanguage],
  );

  const formatEmissions = useCallback(
    (value: number) =>
      `${formatEmissionsAbsoluteCompact(value, currentLanguage)} ${t("emissionsUnit")}`,
    [currentLanguage, t],
  );

  const formatPerCapita = useCallback(
    (value: number) =>
      `${formatEmissionsAbsolute(value, currentLanguage)}${t("europe.list.kpis.emissionsPerCapita.unit")}`,
    [currentLanguage, t],
  );

  if (!leadingContent && !comparisons) {
    return null;
  }

  const hasLeadingContent = Boolean(leadingContent);
  const chartCount = [
    comparisons?.changeSince2015,
    comparisons?.totalEmissions,
    comparisons?.emissionsPerCapita,
  ].filter(Boolean).length;

  if (chartCount === 0 && !hasLeadingContent) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-4 grid gap-4",
        hasLeadingContent
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 lg:grid-cols-3",
      )}
    >
      {leadingContent && (
        <div className="flex min-w-0 items-center sm:col-span-2 lg:col-span-1">
          {leadingContent}
        </div>
      )}

      {comparisons?.changeSince2015 && (
        <KpiChartCard>
          <EuropeanCountryKpiComparisonChart
            title={t("detailPage.changeSince2015")}
            countryLabel={countryName}
            europeanAverageLabel={europeanAverageLabel}
            countryValue={comparisons.changeSince2015.countryValue}
            averageValue={comparisons.changeSince2015.averageValue}
            formatValue={formatPercent}
          />
        </KpiChartCard>
      )}
      {comparisons?.totalEmissions && (
        <KpiChartCard>
          <EuropeanCountryKpiComparisonChart
            title={t("detailPage.totalEmissions", {
              year: comparisons.totalEmissions.year,
            })}
            countryLabel={countryName}
            europeanAverageLabel={europeanAverageLabel}
            countryValue={comparisons.totalEmissions.countryValue}
            averageValue={comparisons.totalEmissions.averageValue}
            formatValue={formatEmissions}
            info
            infoText={t("europe.detailPage.totalEmissionsTooltip")}
          />
        </KpiChartCard>
      )}
      {comparisons?.emissionsPerCapita && (
        <KpiChartCard>
          <EuropeanCountryKpiComparisonChart
            title={t("europe.list.kpis.emissionsPerCapita.label")}
            countryLabel={countryName}
            europeanAverageLabel={europeanAverageLabel}
            countryValue={comparisons.emissionsPerCapita.countryValue}
            averageValue={comparisons.emissionsPerCapita.averageValue}
            formatValue={formatPerCapita}
            info
            infoText={t(
              "europe.list.kpis.emissionsPerCapita.detailedDescription",
            )}
          />
        </KpiChartCard>
      )}
    </div>
  );
}
