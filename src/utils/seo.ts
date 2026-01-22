/**
 * SEO utility functions
 */

/**
 * Get the site origin from environment variable
 * Falls back to a default if not set
 */
export function getSiteOrigin(): string {
  return import.meta.env.VITE_SITE_ORIGIN || "https://klimatkollen.se";
}

/**
 * Build an absolute URL from a relative path
 * @param path - Relative path (e.g., "/companies/123")
 * @returns Absolute URL (e.g., "https://klimatkollen.se/companies/123")
 */
export function buildAbsoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

/**
 * Build an absolute URL for an image or asset
 * @param path - Relative path to image (e.g., "/images/social-picture.png")
 * @returns Absolute URL
 */
export function buildAbsoluteImageUrl(path: string): string {
  // If already absolute, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return buildAbsoluteUrl(path);
}
