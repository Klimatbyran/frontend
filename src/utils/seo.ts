/**
 * SEO utility functions
 */

/** Default Open Graph / Twitter card image (landing page screenshot) */
export const DEFAULT_OG_IMAGE = "/images/landing-page-og.png";

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
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

/**
 * Build an absolute URL for an image or asset
 * @param path - Relative path to image (e.g., "/images/landing-page-og.png")
 * @returns Absolute URL
 */
export function buildAbsoluteImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return buildAbsoluteUrl(path);
}
