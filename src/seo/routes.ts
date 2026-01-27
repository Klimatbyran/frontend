import { SeoMeta } from "@/types/seo";

/**
 * TODO: Consider refactoring this file as it grows (when it exceeds ~400-500 lines or has 3+ dynamic routes).
 *
 * Recommended structure for splitting:
 *   src/seo/routes/
 *     ├── index.ts              // Main export, routes to specific configs
 *     ├── constants.ts           // Shared constants (DEFAULT_OG_IMAGE, SITE_NAME, DEFAULT_DESCRIPTION)
 *     ├── utils.ts               // Shared utilities (normalizePathname, parseRoute)
 *     ├── home.ts               // Home route
 *     ├── companies.ts          // Company routes (detail, ranked, sectors)
 *     ├── municipalities.ts     // Municipality routes (detail, ranked)
 *     ├── regions.ts            // Region routes (detail, ranked)
 *     ├── content.ts            // Articles, reports, learn-more (dynamic routes)
 *     ├── static.ts             // About, methodology, support, privacy, products
 *     └── protected.ts          // Internal pages, edit pages (with noindex)
 *
 * Benefits:
 *   - Each file is focused and manageable (~50-100 lines)
 *   - Easier to find and update specific routes
 *   - Reduces merge conflicts
 *   - Scales better as more routes are added
 */

/**
 * Default OG image for the site
 */
const DEFAULT_OG_IMAGE = "/logos/Klimatkollen_default.jpg";

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

  // TODO: Add route parsing for dynamic routes that need SEO configs:
  // - /regions/:id (region detail page)
  // - /reports/:reportId (individual report page)
  // - /insights/:id (blog/article detail page)
  // - /learn-more/:id (learn more article detail page)

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

  // Build base SEO config
  const baseSeo: SeoMeta = {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    canonical,
    og: {
      image: DEFAULT_OG_IMAGE,
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
          image: DEFAULT_OG_IMAGE,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${SITE_NAME} - Open climate data for citizens`,
          description:
            "Track emissions and climate transition progress for companies and municipalities in Sweden.",
          image: DEFAULT_OG_IMAGE,
        },
      };
    }

    case "/companies/:id": {
      // Company detail page
      const companyId = routeParams.id;
      const companyName = routeParams.name || `Company ${companyId}`;
      return {
        ...baseSeo,
        title: `${companyName} - ${SITE_NAME}`,
        description: `View emissions data and climate transition progress for ${companyName} on ${SITE_NAME}.`,
        og: {
          title: `${companyName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${companyName}.`,
          image: DEFAULT_OG_IMAGE,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${companyName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${companyName}.`,
          image: DEFAULT_OG_IMAGE,
        },
      };
    }

    case "/municipalities/:id": {
      // Municipality detail page
      const municipalityId = routeParams.id;
      const municipalityName =
        routeParams.name || `Municipality ${municipalityId}`;
      return {
        ...baseSeo,
        title: `${municipalityName} - ${SITE_NAME}`,
        description: `View emissions data and climate transition progress for ${municipalityName} municipality on ${SITE_NAME}.`,
        og: {
          title: `${municipalityName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${municipalityName} municipality.`,
          image: DEFAULT_OG_IMAGE,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${municipalityName} - ${SITE_NAME}`,
          description: `View emissions data and climate transition progress for ${municipalityName} municipality.`,
          image: DEFAULT_OG_IMAGE,
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
          image: DEFAULT_OG_IMAGE,
          type: "website",
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
          image: DEFAULT_OG_IMAGE,
          type: "website",
        },
      };
    }

    // TODO: Add SEO configs for the following public routes:
    //
    // Static/List Pages:
    // - /explore (explore page)
    // - /companies/sectors (companies by sector page)
    // - /companies/ranked (ranked companies list - staging)
    // - /municipalities (municipalities ranked list)
    // - /regions (regions ranked list - staging)
    // - /support (support page)
    // - /articles (articles/insights list page)
    // - /reports (reports list page)
    // - /learn-more (learn more overview page)
    // - /newsletter-archive (newsletter archive page)
    // - /privacy (privacy policy page)
    // - /products (products page)
    // - /products/database-download-2025 (download page)
    //
    // Dynamic Routes (need parsing in parseRoute function first):
    // - /regions/:id (region detail page - staging, needs params: id, name)
    // - /reports/:reportId (individual report page, needs params: reportId, title, description)
    // - /insights/:id (blog/article detail page, needs params: id, title, description)
    // - /learn-more/:id (learn more article detail page, needs params: id, title, description)
    //
    // Routes that should use noindex (protected/internal/error pages):
    // - /companies/:id/edit (protected edit page - should set noindex: true)
    // - /internal-pages/* (all internal dashboards - should set noindex: true)
    // - /error/:code (error pages - should set noindex: true)
    // - /403 (unauthorized page - should set noindex: true)
    // - /auth/callback (auth callback - should set noindex: true)
    // - /* (404 page - should set noindex: true)

    default: {
      // Fallback for unknown routes
      return baseSeo;
    }
  }
}
