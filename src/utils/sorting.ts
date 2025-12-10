import { SupportedLanguage } from "@/lib/languageDetection";

/**
 * Language-specific locale mapping for sorting
 */
const LANG_LOCALE: Record<SupportedLanguage, string> = {
  sv: "sv-SE",
  en: "en-US",
};

/**
 * Get the appropriate locale for sorting based on language
 */
function getSortingLocale(language: SupportedLanguage): string {
  return LANG_LOCALE[language] ?? "sv-SE";
}

/**
 * Check if a string contains special characters that need locale-aware sorting
 */
function hasSpecialCharacters(str: string): boolean {
  // Pattern includes common special characters from multiple languages
  return /[åäöÅÄÖüÜöÖäÄßñÑéÉèÈêÊëËàÀáÁâÂäÄçÇîÎïÏôÔùÙúÚûÛ]/i.test(str);
}

/**
 * Detect the most appropriate locale for sorting based on character content
 */
function detectOptimalLocale(str: string): string {
  // Swedish characters
  if (/[åäöÅÄÖ]/.test(str)) return "sv-SE";

  // German characters
  if (/[üÜöÖäÄß]/.test(str)) return "de-DE";

  // French characters
  if (/[éÉèÈêÊëËàÀáÁâÂäÄçÇîÎïÏôÔùÙúÚûÛ]/.test(str)) return "fr-FR";

  // Spanish characters
  if (/[ñÑ]/.test(str)) return "es-ES";

  // Default to English
  return "en-US";
}

/**
 * Create a locale-aware string comparator for sorting
 * @param language The current language
 * @param options Additional Intl.Collator options
 * @returns A comparison function for use with Array.sort()
 */
export function createStringComparator(
  language: SupportedLanguage,
  options: Intl.CollatorOptions = {},
): (a: string, b: string) => number {
  const locale = getSortingLocale(language);
  const collator = new Intl.Collator(locale, {
    sensitivity: "base", // Case-insensitive, accent-insensitive
    numeric: true, // Handle numbers naturally (e.g., "item2" before "item10")
    ...options,
  });

  return (a: string, b: string) => collator.compare(a, b);
}

/**
 * Sort an array of objects by a string property using locale-aware comparison
 * @param array The array to sort
 * @param key The property key to sort by
 * @param language The current language
 * @param options Additional Intl.Collator options
 * @returns A new sorted array
 */
export function sortByStringProperty<T>(
  array: T[],
  key: keyof T,
  language: SupportedLanguage,
  options: Intl.CollatorOptions = {},
): T[] {
  const comparator = createStringComparator(language, options);

  return [...array].sort((a, b) => {
    const aValue = String(a[key] ?? "");
    const bValue = String(b[key] ?? "");
    return comparator(aValue, bValue);
  });
}

/**
 * Sort an array of objects by a string property in descending order
 * @param array The array to sort
 * @param key The property key to sort by
 * @param language The current language
 * @param options Additional Intl.Collator options
 * @returns A new sorted array
 */
export function sortByStringPropertyDesc<T>(
  array: T[],
  key: keyof T,
  language: SupportedLanguage,
  options: Intl.CollatorOptions = {},
): T[] {
  const comparator = createStringComparator(language, options);

  return [...array].sort((a, b) => {
    const aValue = String(a[key] ?? "");
    const bValue = String(b[key] ?? "");
    return comparator(bValue, aValue); // Reversed for descending
  });
}

/**
 * Create a simple string comparator that works with the current language
 * This is a lightweight alternative for simple use cases
 * @param language The current language
 * @returns A comparison function
 */
export function createSimpleStringComparator(language: SupportedLanguage) {
  const locale = getSortingLocale(language);

  // For English, use hybrid approach: detect optimal locale for special characters
  if (language === "en") {
    return (a: string, b: string) => {
      // If either string contains special characters, use optimal locale detection
      if (hasSpecialCharacters(a) || hasSpecialCharacters(b)) {
        // Use the more specific locale between the two strings
        const localeA = detectOptimalLocale(a);
        const localeB = detectOptimalLocale(b);
        const optimalLocale = localeA !== "en-US" ? localeA : localeB;
        return a.localeCompare(b, optimalLocale);
      }
      // Otherwise use English collation
      return a.localeCompare(b, locale);
    };
  }

  // For Swedish, use standard locale-aware sorting
  return (a: string, b: string) => a.localeCompare(b, locale);
}
