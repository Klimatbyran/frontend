// @ts-expect-error - i18n.js doesn't have TypeScript definitions
import i18n from "@/i18n";

export function getTranslation(
  key: string,
  language: string,
  options?: Record<string, string>,
): string {
  // Pass lng instead of changeLanguage. changeLanguage emits languageChanged
  // synchronously, and a component that both subscribes to language changes
  // and rebuilds this SEO during render will setState until React aborts.
  return i18n.t(key, { ...options, lng: language }) as string;
}
