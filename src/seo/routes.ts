import { SeoMeta } from "@/types/seo";
import { detectLanguageFromPath } from "@/lib/languageDetection";
import { DEFAULT_OG_IMAGE, buildAbsoluteUrl } from "@/utils/seo";
// @ts-expect-error - i18n.js doesn't have TypeScript definitions
import i18n from "@/i18n";

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
 */

const SITE_NAME = "Klimatkollen";

function getTranslation(
  key: string,
  language: string,
  options?: Record<string, string>,
): string {
  const currentLanguage = i18n.language;
  i18n.changeLanguage(language);
  const translated = i18n.t(key, options || {});
  i18n.changeLanguage(currentLanguage);
  return translated as string;
}

function normalizePathname(pathname: string): string {
  let normalized = pathname.replace(/^\/(sv|en)(\/|$)/, "/");
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  if (normalized === "") {
    normalized = "/";
  }
  return normalized;
}

/** Preserve the language prefix in canonical paths (e.g. "/sv/about"). */
function getCanonicalPath(pathname: string): string {
  if (/^\/(sv|en)\/?$/.test(pathname)) {
    const lang = pathname.match(/^\/(sv|en)/)![1];
    return `/${lang}/`;
  }
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

function parseRoute(pathname: string, params?: Record<string, string>) {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (normalized === "/" || segments.length === 0) {
    return { pattern: "/", params: {} };
  }

  if (segments[0] === "companies" && segments[1]) {
    if (segments[2] === "edit") {
      return { pattern: "/companies/:id/edit", params: {} };
    }
    return {
      pattern: "/companies/:id",
      params: { id: segments[1], ...(params || {}) },
    };
  }

  // Swedish company URLs: /foretag/:slug-:id (e.g. /foretag/volvo-cars-Q123)
  if (segments[0] === "foretag" && segments[1]) {
    const lastHyphen = segments[1].lastIndexOf("-");
    if (lastHyphen > 0) {
      return {
        pattern: "/companies/:id",
        params: {
          id: segments[1].slice(lastHyphen + 1),
          slug: segments[1].slice(0, lastHyphen),
          ...(params || {}),
        },
      };
    }
  }

  if (segments[0] === "municipalities" && segments[1]) {
    return {
      pattern: "/municipalities/:id",
      params: { id: segments[1], ...(params || {}) },
    };
  }

  if (segments[0] === "regions" && segments[1]) {
    return {
      pattern: "/regions/:id",
      params: { id: segments[1], ...(params || {}) },
    };
  }

  if (segments[0] === "insights" && segments[1]) {
    return {
      pattern: "/insights/:id",
      params: { id: segments[1], ...(params || {}) },
    };
  }

  if (segments[0] === "internal-pages") {
    return { pattern: "/internal-pages", params: {} };
  }

  if (segments[0] === "error") {
    return { pattern: "/error/:code", params: {} };
  }

  if (segments[0] === "403") {
    return { pattern: "/403", params: {} };
  }

  if (segments[0] === "auth") {
    return { pattern: "/auth/callback", params: {} };
  }

  return { pattern: normalized, params: params || {} };
}

/** Build hreflang alternates for a language-neutral path (e.g. "/about"). */
function buildHreflang(pathWithoutLang: string): SeoMeta["hreflang"] {
  const path = pathWithoutLang === "/" ? "" : pathWithoutLang;
  const svPath = `/sv${path}`;
  const enPath = `/en${path}`;
  return [
    { lang: "sv", href: buildAbsoluteUrl(svPath) },
    { lang: "en", href: buildAbsoluteUrl(enPath) },
    { lang: "x-default", href: buildAbsoluteUrl(svPath) },
  ];
}

function withDefaultOg(
  title: string,
  description: string,
  image: string = DEFAULT_OG_IMAGE,
): Pick<SeoMeta, "og" | "twitter"> {
  return {
    og: {
      title,
      description,
      image,
      imageWidth: 1200,
      imageHeight: 630,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image,
    },
  };
}

interface BuildSimpleSeoOptions {
  /** When false, titleKey is used as-is (e.g. privacyPage.seoTitle already includes the site name). */
  suffixSiteName?: boolean;
  extra?: Partial<SeoMeta>;
}

function buildSimpleSeo(
  titleKey: string,
  descriptionKey: string,
  language: string,
  canonical: string,
  options?: BuildSimpleSeoOptions,
): SeoMeta {
  const rawTitle = getTranslation(titleKey, language);
  const suffixSiteName = options?.suffixSiteName ?? true;
  const title = suffixSiteName ? `${rawTitle} - ${SITE_NAME}` : rawTitle;
  const description = getTranslation(descriptionKey, language);
  const ogImage = options?.extra?.og?.image ?? DEFAULT_OG_IMAGE;
  const social = withDefaultOg(title, description, ogImage);

  return {
    ...options?.extra,
    title,
    description,
    canonical,
    hreflang: buildHreflang(canonical.replace(/^\/(sv|en)/, "") || "/"),
    og: { ...social.og, ...options?.extra?.og },
    twitter: { ...social.twitter, ...options?.extra?.twitter },
  };
}

export function getSeoForRoute(
  pathname: string,
  params?: Record<string, string>,
): SeoMeta {
  const { pattern, params: routeParams } = parseRoute(pathname, params);
  const canonical = getCanonicalPath(pathname);
  const pathWithoutLang = normalizePathname(pathname);
  const language = detectLanguageFromPath(pathname);

  const defaultDescription = getTranslation(
    "landingPage.metaDescription",
    language,
  );

  const baseSeo: SeoMeta = {
    title: SITE_NAME,
    description: defaultDescription,
    canonical,
    og: {
      image: DEFAULT_OG_IMAGE,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };

  switch (pattern) {
    case "/": {
      const metaTitle = getTranslation("landingPage.metaTitle", language);
      const metaDescription = getTranslation(
        "landingPage.metaDescription",
        language,
      );
      const title = `${SITE_NAME} - ${metaTitle}`;
      const social = withDefaultOg(title, metaDescription);

      return {
        ...baseSeo,
        title,
        description: metaDescription,
        hreflang: buildHreflang(pathWithoutLang),
        ...social,
      };
    }

    case "/companies/:id": {
      const companyName =
        routeParams.name || getTranslation("common.company", language);
      const metaTitle = getTranslation("companyDetailPage.metaTitle", language);
      const description = getTranslation(
        "companyDetailPage.metaDescription",
        language,
        { company: companyName, siteName: SITE_NAME },
      );
      const title = `${companyName} - ${metaTitle} - ${SITE_NAME}`;
      const social = withDefaultOg(title, description);

      return { ...baseSeo, title, description, ...social };
    }

    case "/municipalities/:id": {
      const municipalityName =
        routeParams.name || getTranslation("common.municipality", language);
      const metaTitle = getTranslation(
        "municipalityDetailPage.metaTitle",
        language,
      );
      const description = getTranslation(
        "municipalityDetailPage.metaDescription",
        language,
        { municipality: municipalityName, siteName: SITE_NAME },
      );
      const title = `${municipalityName} - ${metaTitle} - ${SITE_NAME}`;
      const social = withDefaultOg(title, description);

      return { ...baseSeo, title, description, ...social };
    }

    case "/regions/:id": {
      const regionName =
        routeParams.name || getTranslation("common.region", language);
      const description = getTranslation(
        "regionDetailPage.metaDescription",
        language,
        { region: regionName, siteName: SITE_NAME },
      );
      const title = `${regionName} - ${SITE_NAME}`;
      const social = withDefaultOg(title, description);

      return { ...baseSeo, title, description, ...social };
    }

    case "/insights/:id": {
      const articleTitle =
        routeParams.title || getTranslation("insightsPage.title", language);
      const description =
        routeParams.description ||
        getTranslation("insightsPage.description", language);
      const title = `${articleTitle} - ${SITE_NAME}`;
      const ogImage = routeParams.image ?? DEFAULT_OG_IMAGE;
      const social = withDefaultOg(title, description, ogImage);

      return {
        ...baseSeo,
        title,
        description,
        og: { ...social.og, type: "article" },
        twitter: social.twitter,
      };
    }

    case "/about":
      return buildSimpleSeo(
        "aboutPage.header.title",
        "aboutPage.metaDescription",
        language,
        canonical,
      );

    case "/methodology":
      return buildSimpleSeo(
        "methodsPage.header.title",
        "methodsPage.metaDescription",
        language,
        canonical,
      );

    case "/support":
      return buildSimpleSeo(
        "supportPage.header.title",
        "supportPage.header.description",
        language,
        canonical,
      );

    case "/privacy":
      return buildSimpleSeo(
        "privacyPage.seoTitle",
        "privacyPage.seoDescription",
        language,
        canonical,
        { suffixSiteName: false },
      );

    case "/articles":
      return buildSimpleSeo(
        "insightsPage.title",
        "insightsPage.description",
        language,
        canonical,
      );

    case "/reports":
      return buildSimpleSeo(
        "reportsPage.title",
        "reportsPage.description",
        language,
        canonical,
      );

    case "/learn-more":
      return buildSimpleSeo(
        "learnMoreOverview.title",
        "learnMoreOverview.description",
        language,
        canonical,
      );

    case "/newsletter-archive":
      return buildSimpleSeo(
        "newsletterArchivePage.title",
        "newsletterArchivePage.description",
        language,
        canonical,
      );

    case "/companies":
      return buildSimpleSeo(
        "companiesOverviewPage.title",
        "companiesOverviewPage.description",
        language,
        canonical,
      );

    case "/sectors":
      return buildSimpleSeo(
        "sectorsOverviewPage.title",
        "sectorsOverviewPage.description",
        language,
        canonical,
      );

    case "/municipalities":
      return buildSimpleSeo(
        "municipalitiesOverviewPage.title",
        "municipalitiesOverviewPage.description",
        language,
        canonical,
      );

    case "/regions":
      return buildSimpleSeo(
        "regionalOverviewPage.title",
        "regionalOverviewPage.description",
        language,
        canonical,
      );

    case "/nation":
      return buildSimpleSeo(
        "nationDetailPage.title",
        "nationDetailPage.description",
        language,
        canonical,
      );

    case "/valet-2026":
      return buildSimpleSeo(
        "valet2026Page.title",
        "valet2026Page.description",
        language,
        canonical,
      );

    case "/data-download":
      return buildSimpleSeo(
        "dataDownloadPage.title",
        "dataDownloadPage.description",
        language,
        canonical,
      );

    case "/companies/:id/edit":
    case "/internal-pages":
    case "/error/:code":
    case "/403":
    case "/auth/callback":
      return { ...baseSeo, noindex: true };

    default:
      return baseSeo;
  }
}
