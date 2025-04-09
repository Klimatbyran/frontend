import { SupportedLanguage } from "@/lib/languageDetection";

export function localizeUnit(
  unit: number | Date,
  currentLanguage: SupportedLanguage,
) {
  if (typeof unit === "number") {
    return localizeNumber(unit, currentLanguage);
  }

  if (unit instanceof Date) {
    return new Intl.DateTimeFormat(currentLanguage, {
      dateStyle: "short",
    }).format(unit);
  }
}

const defaultNumberFormatOptions = {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
};

const localizeNumber = (
  nr: number,
  currentLanguage: SupportedLanguage,
  options: Intl.NumberFormatOptions = defaultNumberFormatOptions,
) => {
  return new Intl.NumberFormat(currentLanguage, options).format(nr);
};

export function formatEmployeeCount(
  count: number,
  currentLanguage: SupportedLanguage,
) {
  return localizeNumber(count, currentLanguage, { maximumFractionDigits: 0 });
}

export function formatEmissionsAbsolute(
  count: number,
  currentLanguage: SupportedLanguage,
) {
  return localizeNumber(count, currentLanguage, { maximumFractionDigits: 0 });
}

export function formatPercentChange(
  value: number,
  currentLanguage: SupportedLanguage,
) {
  return new Intl.NumberFormat(currentLanguage, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
}

export function formatPercent(
  value: number,
  currentLanguage: SupportedLanguage,
) {
  return new Intl.NumberFormat(currentLanguage, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
