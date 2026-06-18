import { SupportedLanguage } from "@/lib/languageDetection";
import { localizeUnit } from "@/utils/formatting/localization";

export function formatTurnoverChartValue(
  value: number,
  currency: string | undefined,
  currentLanguage: SupportedLanguage,
  t: (key: string) => string,
): string {
  const useMillions = value < 1e9;
  const scaledValue = value / (useMillions ? 1e6 : 1e9);
  const unitLabel = t(
    useMillions ? "companies.overview.million" : "companies.overview.billion",
  );
  const formattedValue = localizeUnit(scaledValue, currentLanguage);

  return currency
    ? `${formattedValue} ${unitLabel} ${currency}`
    : `${formattedValue} ${unitLabel}`;
}
