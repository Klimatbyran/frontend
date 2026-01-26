import { SeoMeta } from "@/types/seo";
import { getDefaultOgImageUrl, getEntityOgImageUrl } from "@/utils/seo/ogImages";

/**
 * Default OG image for the site (relative path)
 */
const DEFAULT_OG_IMAGE = "/logos/Klimatkollen_default.webp";

/**
 * Site name for title suffixing
 */
const SITE_NAME = "Klimatkollen";

/**
 * Default description fallback
 */
const DEFAULT_DESCRIPTION =
  "Klimatkollen - Open climate data for citizens. Track emissions and climate transition progress for companies and municipalities in Sweden.";

/**
 * Normalize pathname by removing language prefix and trailing slashes
 * @param pathname - Full pathname (e.g., "/sv/companies/123" or "/en/about")
 * @returns Normalized path without language prefix (e.g., "/companies/123" or "/about")
 */
function normalizePathname(pathname: string): string {
  // Remove language prefix (/sv or /en)
  let normalized = pathname.replace(/^\/(sv|en)(\/|$)/, "/");
  // Remove trailing slash except for root
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  // Ensure root is just "/"
  if (normalized === "") {
    normalized = "/";
  }
  return normalized;
}

/**
 * Extract route pattern and params from pathname
 * @param pathname - Normalized pathname
 * @returns Object with pattern and extracted params
 */
function parseRoute(pathname: string, params?: Record<string, string>) {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);

  // Home route
  if (normalized === "/" || segments.length === 0) {
    return { pattern: "/", params: {} };
  }

  // Entity detail routes
  if (segments[0] === "companies" && segments[1]) {
    return {
      pattern: "/companies/:id",
      params: { id: segments[1], ...(params || {}) },
    };
  }

  if (segments[0] === "municipalities" && segments[1]) {
    return {
      pattern: "/municipalities/:id",
      params: { id: segments[1], ...(params || {}) },
    };
  }

  // Other routes
  return { pattern: normalized, params: params || {} };
}

/**
 * Get SEO metadata for a route
 * @param pathname - Full pathname (e.g., "/sv/companies/123" or "/en/about")
 * @param params - Optional route parameters (e.g., { id: "123", name: "Company Name" })
 * @returns SeoMeta object for the route
 */
export function getSeoForRoute(
  pathname: string,
  params?: Record<string, string>,
): SeoMeta {
  const { pattern, params: routeParams } = parseRoute(pathname, params);
  const canonical = normalizePathname(pathname);

  // Build base SEO config with absolute default OG image URL
  const baseSeo: SeoMeta = {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    canonical,
    og: {
      image: getDefaultOgImageUrl(),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };

  // Route-specific SEO configs
  switch (pattern) {
    case "/": {
      // Home route
      return {
        ...baseSeo,
        title: `${SITE_NAME} - Open climate data for citizens`,
        description:
          "Track emissions and climate transition progress for companies and municipalities in Sweden. Open climate data for citizens.",
        og: {
          title: `${SITE_NAME} - Open climate data for citizens`,
          description:
            "Track emissions and climate transition progress for companies and municipalities in Sweden.",
          image: getDefaultOgImageUrl(),
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${SITE_NAME} - Open climate data for citizens`,
          description:
            "Track emissions and climate transition progress for companies and municipalities in Sweden.",
        },
      };
    }

    case "/companies/:id": {
      // Company detail page
      const companyId = routeParams.id;
      const companyName = routeParams.name || `Company ${companyId}`;
      // Use entity-specific OG image (falls back to default)
      const ogImage = companyId
        ? getEntityOgImageUrl("companies", companyId, true)
        : getDefaultOgImageUrl();
      
      return {
        ...baseSeo,
        title: `${companyName} - ${SITE_NAME}`,
        description: `View emissions data and climate transition progress for ${companyName} on ${SITE_NAME}.`,
        og: {
          title: `${companyName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${companyName}.`,
          image: ogImage,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${companyName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${companyName}.`,
        },
      };
    }

    case "/municipalities/:id": {
      // Municipality detail page
      const municipalityId = routeParams.id;
      const municipalityName =
        routeParams.name || `Municipality ${municipalityId}`;
      // Use entity-specific OG image (falls back to default)
      const ogImage = municipalityId
        ? getEntityOgImageUrl("municipalities", municipalityId, true)
        : getDefaultOgImageUrl();
      
      return {
        ...baseSeo,
        title: `${municipalityName} - ${SITE_NAME}`,
        description: `View emissions data and climate transition progress for ${municipalityName} municipality on ${SITE_NAME}.`,
        og: {
          title: `${municipalityName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${municipalityName} municipality.`,
          image: ogImage,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${municipalityName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${municipalityName} municipality.`,
        },
      };
    }

    case "/about": {
      return {
        ...baseSeo,
        title: `About - ${SITE_NAME}`,
        description: `Learn about ${SITE_NAME} and our mission to provide open climate data for citizens.`,
        og: {
          title: `About - ${SITE_NAME}`,
          description: `Learn about ${SITE_NAME} and our mission to provide open climate data.`,
          image: getDefaultOgImageUrl(),
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
        },
      };
    }

    case "/methodology": {
      return {
        ...baseSeo,
        title: `Methodology - ${SITE_NAME}`,
        description: `Learn about the methodology and data sources used by ${SITE_NAME} to track emissions and climate transition.`,
        og: {
          title: `Methodology - ${SITE_NAME}`,
          description: `Learn about the methodology and data sources used by ${SITE_NAME}.`,
          image: getDefaultOgImageUrl(),
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
        },
      };
    }

    default: {
      // Fallback for unknown routes
      return baseSeo;
    }
  }
}
