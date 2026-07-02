import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { EuropeanCountryKpiComparisonChart } from "@/components/europe/EuropeanCountryKpiComparisonChart";
import { EuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import {
  formatEmissionsAbsolute,
  formatEmissionsAbsoluteCompact,
  formatPercentChange,
} from "@/utils/formatting/localization";

type EuropeanCountryKpiComparisonsProps = {
  comparisons: EuropeanCountryKpiComparisons;
};

export function EuropeanCountryKpiComparisonsPanel({
  comparisons,
}: EuropeanCountryKpiComparisonsProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const countryLabel = t("europe.detailPage.countryLabel");
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

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
      {comparisons.changeSince2015 && (
        <EuropeanCountryKpiComparisonChart
          title={t("detailPage.changeSince2015")}
          countryLabel={countryLabel}
          europeanAverageLabel={europeanAverageLabel}
          countryValue={comparisons.changeSince2015.countryValue}
          averageValue={comparisons.changeSince2015.averageValue}
          formatValue={formatPercent}
        />
      )}
      {comparisons.totalEmissions && (
        <EuropeanCountryKpiComparisonChart
          title={t("detailPage.totalEmissions", {
            year: comparisons.totalEmissions.year,
          })}
          countryLabel={countryLabel}
          europeanAverageLabel={europeanAverageLabel}
          countryValue={comparisons.totalEmissions.countryValue}
          averageValue={comparisons.totalEmissions.averageValue}
          formatValue={formatEmissions}
          info
          infoText={t("europe.detailPage.totalEmissionsTooltip")}
        />
      )}
      {comparisons.emissionsPerCapita && (
        <EuropeanCountryKpiComparisonChart
          title={t("europe.list.kpis.emissionsPerCapita.label")}
          countryLabel={countryLabel}
          europeanAverageLabel={europeanAverageLabel}
          countryValue={comparisons.emissionsPerCapita.countryValue}
          averageValue={comparisons.emissionsPerCapita.averageValue}
          formatValue={formatPerCapita}
          info
          infoText={t(
            "europe.list.kpis.emissionsPerCapita.detailedDescription",
          )}
        />
      )}
    </div>
  );
}
