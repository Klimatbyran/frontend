import { To } from "react-router-dom";

export const localizedPath = (lang: string, path: To) => {
  return `/${lang}${path}`;
};

/**
 * Creates a navigation path for a region or municipality entity
 * @param entityType - "region" or "municipality"
 * @param entity - Entity object with name property or string name
 * @param viewMode - Optional view mode for municipalities (e.g., "map" or "list")
 * @returns Navigation path string
 */
export function getEntityDetailPath(
  entityType: "region" | "municipality" | "europe",
  entity: { name: string } | string,
  viewMode?: string,
): string {
  const name = typeof entity === "string" ? entity : entity.name;
  const formattedName = name.toLowerCase();

  if (entityType === "europe") {
    // No detail page for European countries yet, return overview page
    return "/europe";
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
 * @returns Click handler function
 */
export function createEntityClickHandler(
  navigate: (path: string) => void,
  entityType: "region" | "municipality" | "europe",
  viewMode?: string,
) {
  return (entity: { name: string } | string) => {
    const path = getEntityDetailPath(entityType, entity, viewMode);
    navigate(path);
  };
}
