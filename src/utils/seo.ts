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

/**
 * Recursively remove undefined and null values from an object
 * This ensures valid JSON-LD (undefined values are invalid in JSON)
 * @param obj - Object to clean
 * @returns Cleaned object with no undefined/null values
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => stripUndefined(item))
      .filter((item) => item !== null && item !== undefined) as T;
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        const cleanedValue = stripUndefined(value);
        if (cleanedValue !== undefined && cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * Strip tracking parameters from a URL
 * Removes common tracking params: utm_*, ref, source, fbclid, gclid, etc.
 * @param url - URL string (can be absolute or relative)
 * @returns URL without tracking parameters
 */
export function stripTrackingParams(url: string): string {
  try {
    // If it's a relative path, just remove query params if any
    if (!url.includes("://") && !url.includes("?")) {
      return url;
    }

    // Parse URL
    const urlObj = new URL(url, url.startsWith("/") ? getSiteOrigin() : undefined);
    
    // List of tracking parameters to remove
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "source",
      "fbclid",
      "gclid",
      "msclkid",
      "twclid",
      "li_fat_id",
      "mc_cid",
      "mc_eid",
      "_ga",
      "_gid",
    ];

    // Remove tracking parameters
    trackingParams.forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    // Reconstruct URL
    // For relative paths, return pathname + search (without origin)
    if (url.startsWith("/")) {
      return urlObj.pathname + (urlObj.search ? urlObj.search : "");
    }

    // For absolute URLs, return full URL
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn("Failed to parse URL for tracking param removal:", url, error);
    return url;
  }
}
