// @ts-expect-error - i18n.js doesn't have TypeScript definitions
import i18n from "@/i18n";

export function getTranslation(
  key: string,
  language: string,
  options?: Record<string, string>,
): string {
  const currentLanguage = i18n.language;
  i18n.changeLanguage(language);
  const translated = i18n.t(key, options || {});
  i18n.changeLanguage(currentLanguage);
  return translated as string;
}
