import type { TFunction } from "i18next";
import { SupportedLanguage } from "@/lib/languageDetection";
import { localizeUnit } from "@/utils/formatting/localization";

const BILLION_THRESHOLD = 1e9;

function getTurnoverScale(value: number) {
  const useMillions = value < BILLION_THRESHOLD;

  return {
    scaledValue: value / (useMillions ? 1e6 : 1e9),
    unitKey: useMillions
      ? "companies.overview.million"
      : "companies.overview.billion",
  } as const;
}

/** Formats a raw turnover value as "12,3 million SEK" (or billion). */
export function formatTurnoverValue(
  value: number,
  currentLanguage: SupportedLanguage,
  t: TFunction,
  currency?: string | null,
): string {
  const { scaledValue, unitKey } = getTurnoverScale(value);
  const formattedValue = localizeUnit(scaledValue, currentLanguage);
  const unitLabel = t(unitKey);

  return currency
    ? `${formattedValue} ${unitLabel} ${currency}`
    : `${formattedValue} ${unitLabel}`;
}

/** Compact axis label for chart Y-axes (no currency). */
export function formatTurnoverAxisValue(
  value: number,
  currentLanguage: SupportedLanguage,
): string {
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
