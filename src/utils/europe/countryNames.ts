import { FeatureCollection } from "geojson";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/languageDetection";

const DISPLAY_NAMES_LOCALE: Record<SupportedLanguage, string> = {
  sv: "sv-SE",
  en: "en-GB",
};

const displayNamesCache = new Map<SupportedLanguage, Intl.DisplayNames>();

function getDisplayNames(language: SupportedLanguage): Intl.DisplayNames {
  let displayNames = displayNamesCache.get(language);
  if (!displayNames) {
    displayNames = new Intl.DisplayNames([DISPLAY_NAMES_LOCALE[language]], {
      type: "region",
    });
    displayNamesCache.set(language, displayNames);
  }

  return displayNames;
}

export function normalizeCountryName(name: string): string {
  return name.trim().toLowerCase();
}

export function getLocalizedCountryName(
  iso2: string,
  language: SupportedLanguage,
  fallback?: string,
): string {
  try {
    const localizedName = getDisplayNames(language).of(iso2);
    if (localizedName && localizedName !== iso2) {
      return localizedName;
    }
  } catch {
    // Intl.DisplayNames throws for unknown region codes in some runtimes.
  }

  return fallback ?? iso2;
}

export type CountryGeoIndex = {
  nameToIso3: Map<string, string>;
  iso3ToEnglishName: Map<string, string>;
  iso3ToIso2: Map<string, string>;
};

export function buildCountryGeoIndex(
  geoData: FeatureCollection,
): CountryGeoIndex {
  const nameToIso3 = new Map<string, string>();
  const iso3ToEnglishName = new Map<string, string>();
  const iso3ToIso2 = new Map<string, string>();

  for (const feature of geoData.features) {
    const iso3 = feature.properties?.ISO3;
    const iso2 = feature.properties?.ISO2;
    const englishName = feature.properties?.NAME;

    if (
      typeof iso3 !== "string" ||
      typeof iso2 !== "string" ||
      typeof englishName !== "string"
    ) {
      continue;
    }

    iso3ToEnglishName.set(iso3, englishName);
    iso3ToIso2.set(iso3, iso2);
    nameToIso3.set(normalizeCountryName(englishName), iso3);

    for (const language of SUPPORTED_LANGUAGES) {
      const localizedName = getLocalizedCountryName(
        iso2,
        language,
        englishName,
      );
      nameToIso3.set(normalizeCountryName(localizedName), iso3);
    }
  }

  return { nameToIso3, iso3ToEnglishName, iso3ToIso2 };
}

export function resolveCountryIso3(
  name: string,
  nameToIso3: Map<string, string>,
): string | undefined {
  return nameToIso3.get(normalizeCountryName(name));
}
