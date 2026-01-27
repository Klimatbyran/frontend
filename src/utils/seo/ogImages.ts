import { buildAbsoluteImageUrl, buildAbsoluteUrl } from "@/utils/seo";

/**
 * Default OG image path - stable URL for fallback
 */
export const DEFAULT_OG_IMAGE = "/logos/Klimatkollen_default.webp";

/**
 * Check if API endpoint should be used for OG image generation
 * Can be overridden via environment variable for development/testing
 */
function shouldUseApiEndpoint(): boolean {
  // Allow disabling API via environment variable (for local testing with static files)
  const useApiEnv = import.meta.env.VITE_OG_USE_API;
  if (useApiEnv === "false" || useApiEnv === "0") {
    return false;
  }
  // Default to true (API endpoint is the production approach)
  return true;
}

/**
 * Get the absolute URL for the default OG image
 */
export function getDefaultOgImageUrl(): string {
  return buildAbsoluteImageUrl(DEFAULT_OG_IMAGE);
}

/**
 * Get entity-specific OG image path (for static files fallback)
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
 * Get entity-specific OG image URL
 * 
 * Strategy (API-first approach):
 * - Uses API endpoint for dynamic generation (default)
 * - Falls back to static files if API disabled via env var or useApi=false
 * - Falls back to default image if entity ID is missing
 * 
 * @param entityType - Type of entity ("companies" or "municipalities")
 * @param id - Entity ID
 * @param useApi - Whether to use API endpoint (default: true, respects VITE_OG_USE_API env var)
 * @returns Absolute URL to OG image (entity-specific or default)
 */
export function getEntityOgImageUrl(
  entityType: "companies" | "municipalities",
  id: string,
  useApi?: boolean,
): string {
  if (!id) {
    return getDefaultOgImageUrl();
  }
  
  // Determine if API should be used (respects env var if useApi not explicitly provided)
  const shouldUseApi = useApi !== undefined ? useApi : shouldUseApiEndpoint();
  
  // Use API endpoint for dynamic generation (production approach)
  if (shouldUseApi) {
    return buildAbsoluteUrl(`/api/og/${entityType}/${id}`);
  }
  
  // Fallback to static files (for local testing or if API not available)
  const entityPath = getEntityOgImagePath(entityType, id);
  return buildAbsoluteImageUrl(entityPath);
}

/**
 * Get article/blog post OG image URL
 * Uses build-time generated preview images (articles are frontend-only)
 * Falls back to static image or default
 * 
 * @param articleId - Article/blog post ID
 * @param staticImagePath - Optional static image path to use as fallback
 * @returns Absolute URL to OG image
 */
export function getArticleOgImageUrl(
  articleId: string,
  staticImagePath?: string,
): string {
  // Articles are frontend-only (markdown files), so use build-time generated images
  if (articleId) {
    const articlePath = `/og/articles/${articleId}.png`;
    return buildAbsoluteImageUrl(articlePath);
  }
  
  // Fallback to static image or default
  if (staticImagePath) {
    return buildAbsoluteImageUrl(staticImagePath);
  }
  
  return getDefaultOgImageUrl();
}

/**
 * Get report OG image URL
 * Uses build-time generated preview images (reports are frontend-only)
 * Falls back to static image or default
 * 
 * @param reportId - Report ID
 * @param staticImagePath - Optional static image path to use as fallback
 * @returns Absolute URL to OG image
 */
export function getReportOgImageUrl(
  reportId: string,
  staticImagePath?: string,
): string {
  // Reports are frontend-only (static constants), so use build-time generated images
  if (reportId) {
    const reportPath = `/og/reports/${reportId}.png`;
    return buildAbsoluteImageUrl(reportPath);
  }
  
  // Fallback to static image or default
  if (staticImagePath) {
    return buildAbsoluteImageUrl(staticImagePath);
  }
  
  return getDefaultOgImageUrl();
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
    return getEntityOgImageUrl(entityType, entityId);
  }

  // Fallback to default
  return getDefaultOgImageUrl();
}
