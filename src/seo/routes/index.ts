import { SeoMeta } from "@/types/seo";
import { detectLanguageFromPath } from "@/lib/languageDetection";
import { DEFAULT_OG_IMAGE } from "@/utils/seo";
import { SITE_NAME } from "./constants";
import { resolveSeoForPattern } from "./seo-handlers";
import { getTranslation } from "./translation";
import { getCanonicalPath, normalizePathname, parseRoute } from "./utils";

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

  return resolveSeoForPattern(pattern, {
    language,
    canonical,
    pathWithoutLang,
    routeParams,
    baseSeo,
  });
}
