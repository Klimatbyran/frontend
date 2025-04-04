import { SupportedLanguage } from "@/lib/languageDetection";

export const localizeUnit = (unit: number | Date, currentLanguage: SupportedLanguage) => {
  if (typeof unit === 'number') {
    return localizeNumber(unit, currentLanguage)
  }

  if (unit instanceof Date) {
    return new Intl.DateTimeFormat(
      currentLanguage === 'sv' ? 'sv-SE' : 'en-US',
      { dateStyle: 'short' }
    ).format(unit);
  }
}

const defaultNumberFormatOptions = {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
}

const localizeNumber = (nr: number,
  currentLanguage: SupportedLanguage,
  options: Intl.NumberFormatOptions = defaultNumberFormatOptions) => {

  return new Intl.NumberFormat(currentLanguage === 'sv' ? 'sv-SE' : 'en-US', options).format(nr)
}

export const localizeEmployeeCount = (count: number, currentLanguage: SupportedLanguage) =>
  localizeNumber(count, currentLanguage, { maximumFractionDigits: 0 })

