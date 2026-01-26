import { buildAbsoluteImageUrl } from "@/utils/seo";

/**
 * Default OG image path - stable URL for fallback
 */
export const DEFAULT_OG_IMAGE = "/logos/Klimatkollen_default.webp";

/**
 * Get the absolute URL for the default OG image
 */
export function getDefaultOgImageUrl(): string {
  return buildAbsoluteImageUrl(DEFAULT_OG_IMAGE);
}

/**
 * Get entity-specific OG image path
 * Uses predictable path structure: /og/{entityType}/{id}.png
 * 
 * @param entityType - Type of entity ("companies" or "municipalities")
 * @param id - Entity ID (e.g., company Wikidata ID or municipality name)
 * @returns Relative path to entity OG image
 */
export function getEntityOgImagePath(
  entityType: "companies" | "municipalities",
  id: string,
): string {
  return `/og/${entityType}/${id}.png`;
}

/**
 * Get entity-specific OG image URL with fallback
 * 
 * Strategy:
 * - Uses API endpoint for dynamic generation (when available)
 * - Falls back to static files if API not available
 * - Falls back to default image if entity image doesn't exist
 * 
 * @param entityType - Type of entity ("companies" or "municipalities")
 * @param id - Entity ID
 * @param fallbackToDefault - Whether to fallback to default if entity image doesn't exist (default: true)
 * @param useApi - Whether to use API endpoint (default: true when API is available)
 * @returns Absolute URL to OG image (entity-specific or default)
 */
export function getEntityOgImageUrl(
  entityType: "companies" | "municipalities",
  id: string,
  fallbackToDefault: boolean = true,
  useApi: boolean = true,
): string {
  if (!id) {
    return getDefaultOgImageUrl();
  }
  
  // Use API endpoint for dynamic generation (when implemented)
  // This will generate preview images on-demand
  if (useApi) {
    return buildAbsoluteUrl(`/api/og/${entityType}/${id}`);
  }
  
  // Fallback to static files (for testing or if API not available)
  const entityPath = getEntityOgImagePath(entityType, id);
  return buildAbsoluteImageUrl(entityPath);
}

/**
 * Get OG image URL with fallback logic
 * Always returns an absolute URL, falling back to default if needed
 * 
 * @param imagePath - Optional custom image path
 * @param entityType - Optional entity type for entity-specific images
 * @param entityId - Optional entity ID
 * @returns Absolute URL to OG image (never undefined)
 */
export function getOgImageUrl(
  imagePath?: string,
  entityType?: "companies" | "municipalities",
  entityId?: string,
): string {
  // If custom image path provided, use it
  if (imagePath) {
    return buildAbsoluteImageUrl(imagePath);
  }

  // If entity info provided, try entity-specific image
  if (entityType && entityId) {
    return getEntityOgImageUrl(entityType, entityId, true);
  }

  // Fallback to default
  return getDefaultOgImageUrl();
}
