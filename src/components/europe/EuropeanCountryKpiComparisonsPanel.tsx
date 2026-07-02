import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { EuropeanCountryKpiComparisonChart } from "@/components/europe/EuropeanCountryKpiComparisonChart";
import { EuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";

type EuropeanCountryKpiComparisonsProps = {
  comparisons: EuropeanCountryKpiComparisons;
  countryName: string;
};

export function EuropeanCountryKpiComparisonsPanel({
  comparisons,
  countryName,
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
      `${formatEmissionsAbsolute(value, currentLanguage)} ${t("emissionsUnit")}`,
    [currentLanguage, t],
  );

  const formatPerCapita = useCallback(
    (value: number) =>
      `${formatEmissionsAbsolute(value, currentLanguage)}${t("europe.list.kpis.emissionsPerCapita.unit")}`,
    [currentLanguage, t],
  );

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
      {comparisons.changeSince2015 && (
        <EuropeanCountryKpiComparisonChart
          title={t("detailPage.changeSince2015")}
          countryLabel={countryName}
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
          countryLabel={countryName}
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
      )}
    </div>
  );
}
