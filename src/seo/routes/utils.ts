import { SeoMeta } from "@/types/seo";
import { DEFAULT_OG_IMAGE, buildAbsoluteUrl } from "@/utils/seo";
import { SITE_NAME } from "./constants";
import { getTranslation } from "./translation";

export function normalizePathname(pathname: string): string {
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
export function getCanonicalPath(pathname: string): string {
  if (/^\/(sv|en)\/?$/.test(pathname)) {
    const lang = pathname.match(/^\/(sv|en)/)![1];
    return `/${lang}/`;
  }
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

interface ParsedRoute {
  pattern: string;
  params: Record<string, string>;
}

function parseCompanyRoute(
  segments: string[],
  params?: Record<string, string>,
): ParsedRoute | null {
  if (segments[0] !== "companies" || !segments[1]) {
    return null;
  }
  if (segments[2] === "edit") {
    return { pattern: "/companies/:id/edit", params: {} };
  }
  return {
    pattern: "/companies/:id",
    params: { id: segments[1], ...(params || {}) },
  };
}

function parseForetagRoute(
  segments: string[],
  params?: Record<string, string>,
): ParsedRoute | null {
  if (segments[0] !== "foretag" || !segments[1]) {
    return null;
  }
  const lastHyphen = segments[1].lastIndexOf("-");
  if (lastHyphen <= 0) {
    return null;
  }
  return {
    pattern: "/companies/:id",
    params: {
      id: segments[1].slice(lastHyphen + 1),
      slug: segments[1].slice(0, lastHyphen),
      ...(params || {}),
    },
  };
}

function parseEntityRoute(
  segment: string,
  pattern: string,
  segments: string[],
  params?: Record<string, string>,
): ParsedRoute | null {
  if (segments[0] !== segment || !segments[1]) {
    return null;
  }
  return {
    pattern,
    params: { id: segments[1], ...(params || {}) },
  };
}

const STATIC_ROUTE_PATTERNS: Record<string, string> = {
  "internal-pages": "/internal-pages",
  error: "/error/:code",
  "403": "/403",
  auth: "/auth/callback",
};

export function parseRoute(
  pathname: string,
  params?: Record<string, string>,
): ParsedRoute {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (normalized === "/" || segments.length === 0) {
    return { pattern: "/", params: {} };
  }

  const companyRoute = parseCompanyRoute(segments, params);
  if (companyRoute) return companyRoute;

  const foretagRoute = parseForetagRoute(segments, params);
  if (foretagRoute) return foretagRoute;

  const municipalityRoute = parseEntityRoute(
    "municipalities",
    "/municipalities/:id",
    segments,
    params,
  );
  if (municipalityRoute) return municipalityRoute;

  const regionRoute = parseEntityRoute(
    "regions",
    "/regions/:id",
    segments,
    params,
  );
  if (regionRoute) return regionRoute;

  const insightsRoute = parseEntityRoute(
    "insights",
    "/insights/:id",
    segments,
    params,
  );
  if (insightsRoute) return insightsRoute;

  const staticPattern = STATIC_ROUTE_PATTERNS[segments[0]];
  if (staticPattern) {
    return { pattern: staticPattern, params: {} };
  }

  return { pattern: normalized, params: params || {} };
}

/** Build hreflang alternates for a language-neutral path (e.g. "/about"). */
export function buildHreflang(pathWithoutLang: string): SeoMeta["hreflang"] {
  const path = pathWithoutLang === "/" ? "" : pathWithoutLang;
  const svPath = `/sv${path}`;
  const enPath = `/en${path}`;
  return [
    { lang: "sv", href: buildAbsoluteUrl(svPath) },
    { lang: "en", href: buildAbsoluteUrl(enPath) },
    { lang: "x-default", href: buildAbsoluteUrl(svPath) },
  ];
}

export function withDefaultOg(
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

export function buildSimpleSeo(
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
