import { To } from "react-router-dom";

export const localizedPath = (lang: string, path: To) => `/${lang}${path}`;

/**
 * Creates a navigation path for a region or municipality entity
 * @param entityType - "region" or "municipality"
 * @param entity - Entity object with name property or string name
 * @param viewMode - Optional view mode for municipalities (e.g., "map" or "list")
 * @returns Navigation path string
 */
export function getEntityDetailPath(
  entityType: "region" | "municipality",
  entity: { name: string } | string,
  viewMode?: string,
): string {
  const name = typeof entity === "string" ? entity : entity.name;
  const formattedName = name.toLowerCase();
  const basePath = entityType === "region" ? "/regions" : "/municipalities";

  if (entityType === "municipality" && viewMode) {
    return `${basePath}/${formattedName}?view=${viewMode}`;
  }

  return `${basePath}/${formattedName}`;
}

/**
 * Creates a click handler function for navigating to entity detail pages
 * @param navigate - React Router navigate function
 * @param entityType - "region" or "municipality"
 * @param viewMode - Optional view mode for municipalities
 * @returns Click handler function
 */
export function createEntityClickHandler(
  navigate: (path: string) => void,
  entityType: "region" | "municipality",
  viewMode?: string,
) {
  return (entity: { name: string } | string) => {
    const path = getEntityDetailPath(entityType, entity, viewMode);
    navigate(path);
  };
}
