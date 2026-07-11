import { To } from "react-router-dom";

export const SWEDEN_ISO3 = "SWE";

export const NATION_URL_SLUGS = {
  sv: "sverige",
  en: "sweden",
} as const;

export type AppLanguage = keyof typeof NATION_URL_SLUGS;

export function toAppLanguage(language: string): AppLanguage {
  return language === "en" ? "en" : "sv";
}

export function getNationUrlSlug(language: string): string {
  return NATION_URL_SLUGS[toAppLanguage(language)];
}

export function getNationDetailPath(language: string): string {
  return `/${getNationUrlSlug(language)}`;
}

export function isNationUrlSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  return (
    normalized === NATION_URL_SLUGS.sv || normalized === NATION_URL_SLUGS.en
  );
}

/** Resolves legacy nav paths to their language-specific nation URL. */
export function resolveNavPath(path: string, language: string): string {
  if (path === "/nation") {
    return getNationDetailPath(language);
  }
  return path;
}

export function isNationDetailPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/(sv|en)/, "") || "/";
  return (
    normalized === "/nation" ||
    normalized === getNationDetailPath("sv") ||
    normalized === getNationDetailPath("en")
  );
}

export const localizedPath = (lang: string, path: To) => {
  return `/${lang}${path}`;
};

/**
 * Creates a navigation path for a region or municipality entity
 * @param entityType - "region" or "municipality"
 * @param entity - Entity object with name property or string name
 * @param viewMode - Optional view mode for municipalities (e.g., "map" or "list")
 * @param language - App language, used for nation URLs (Sweden)
 * @returns Navigation path string
 */
export function getEntityDetailPath(
  entityType: "region" | "municipality" | "europe",
  entity: { name: string; id?: string } | string,
  viewMode?: string,
  language?: string,
): string {
  const name = typeof entity === "string" ? entity : entity.name;
  const formattedName = name.toLowerCase();

  if (entityType === "europe") {
    const countryId =
      typeof entity === "string" ? entity : (entity.id ?? entity.name);
    if (countryId.toUpperCase() === SWEDEN_ISO3) {
      return getNationDetailPath(language ?? "sv");
    }
    return `/europe/${countryId.toLowerCase()}`;
  }

  const basePath = entityType === "region" ? "/regions" : "/municipalities";

  if (entityType === "municipality" && viewMode) {
    return `${basePath}/${formattedName}?view=${viewMode}`;
  }

  return `${basePath}/${formattedName}`;
}

/**
 * Creates a click handler function for navigating to entity detail pages
 * @param navigate - React Router navigate function
 * @param entityType - "region", "municipality", or "europe"
 * @param viewMode - Optional view mode for municipalities
 * @param language - App language, used for nation URLs (Sweden)
 * @returns Click handler function
 */
export function createEntityClickHandler(
  navigate: (path: string) => void,
  entityType: "region" | "municipality" | "europe",
  viewMode?: string,
  language?: string,
) {
  return (entity: { name: string; id?: string } | string) => {
    const path = getEntityDetailPath(entityType, entity, viewMode, language);
    navigate(language ? localizedPath(language, path) : path);
  };
}
