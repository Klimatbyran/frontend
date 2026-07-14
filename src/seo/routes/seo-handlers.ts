import { SeoMeta } from "@/types/seo";
import { DEFAULT_OG_IMAGE } from "@/utils/seo";
import { SITE_NAME } from "./constants";
import { getTranslation } from "./translation";
import { buildHreflang, buildSimpleSeo, withDefaultOg } from "./utils";

interface SeoContext {
  language: string;
  canonical: string;
  pathWithoutLang: string;
  routeParams: Record<string, string>;
  baseSeo: SeoMeta;
}

function buildHomeSeo(context: SeoContext): SeoMeta {
  const metaTitle = getTranslation("landingPage.metaTitle", context.language);
  const metaDescription = getTranslation(
    "landingPage.metaDescription",
    context.language,
  );
  const title = `${SITE_NAME} - ${metaTitle}`;
  const social = withDefaultOg(title, metaDescription);

  return {
    ...context.baseSeo,
    title,
    description: metaDescription,
    hreflang: buildHreflang(context.pathWithoutLang),
    ...social,
  };
}

function buildCompanyDetailSeo(context: SeoContext): SeoMeta {
  const companyName =
    context.routeParams.name ||
    getTranslation("common.company", context.language);
  const metaTitle = getTranslation(
    "companyDetailPage.metaTitle",
    context.language,
  );
  const description = getTranslation(
    "companyDetailPage.metaDescription",
    context.language,
    { company: companyName, siteName: SITE_NAME },
  );
  const title = `${companyName} - ${metaTitle} - ${SITE_NAME}`;
  const social = withDefaultOg(title, description);

  return { ...context.baseSeo, title, description, ...social };
}

function buildMunicipalityDetailSeo(context: SeoContext): SeoMeta {
  const municipalityName =
    context.routeParams.name ||
    getTranslation("common.municipality", context.language);
  const metaTitle = getTranslation(
    "municipalityDetailPage.metaTitle",
    context.language,
  );
  const description = getTranslation(
    "municipalityDetailPage.metaDescription",
    context.language,
    { municipality: municipalityName, siteName: SITE_NAME },
  );
  const title = `${municipalityName} - ${metaTitle} - ${SITE_NAME}`;
  const social = withDefaultOg(title, description);

  return { ...context.baseSeo, title, description, ...social };
}

function buildRegionDetailSeo(context: SeoContext): SeoMeta {
  const regionName =
    context.routeParams.name ||
    getTranslation("common.region", context.language);
  const description = getTranslation(
    "regionDetailPage.metaDescription",
    context.language,
    { region: regionName, siteName: SITE_NAME },
  );
  const title = `${regionName} - ${SITE_NAME}`;
  const social = withDefaultOg(title, description);

  return { ...context.baseSeo, title, description, ...social };
}

function buildInsightsSeo(context: SeoContext): SeoMeta {
  const articleTitle =
    context.routeParams.title ||
    getTranslation("insightsPage.title", context.language);
  const description =
    context.routeParams.description ||
    getTranslation("insightsPage.description", context.language);
  const title = `${articleTitle} - ${SITE_NAME}`;
  const ogImage = context.routeParams.image ?? DEFAULT_OG_IMAGE;
  const social = withDefaultOg(title, description, ogImage);

  return {
    ...context.baseSeo,
    title,
    description,
    og: { ...social.og, type: "article" },
    twitter: social.twitter,
  };
}

const SIMPLE_SEO_ROUTES: Record<
  string,
  { titleKey: string; descriptionKey: string; suffixSiteName?: boolean }
> = {
  "/about": {
    titleKey: "aboutPage.header.title",
    descriptionKey: "aboutPage.metaDescription",
  },
  "/methodology": {
    titleKey: "methodsPage.header.title",
    descriptionKey: "methodsPage.metaDescription",
  },
  "/support": {
    titleKey: "supportPage.header.title",
    descriptionKey: "supportPage.header.description",
  },
  "/privacy": {
    titleKey: "privacyPage.seoTitle",
    descriptionKey: "privacyPage.seoDescription",
    suffixSiteName: false,
  },
  "/articles": {
    titleKey: "insightsPage.title",
    descriptionKey: "insightsPage.description",
  },
  "/reports": {
    titleKey: "reportsPage.title",
    descriptionKey: "reportsPage.description",
  },
  "/learn-more": {
    titleKey: "learnMoreOverview.title",
    descriptionKey: "learnMoreOverview.description",
  },
  "/newsletter-archive": {
    titleKey: "newsletterArchivePage.title",
    descriptionKey: "newsletterArchivePage.description",
  },
  "/companies": {
    titleKey: "companiesOverviewPage.title",
    descriptionKey: "companiesOverviewPage.description",
  },
  "/sectors": {
    titleKey: "sectorsOverviewPage.title",
    descriptionKey: "sectorsOverviewPage.description",
  },
  "/municipalities": {
    titleKey: "municipalitiesOverviewPage.title",
    descriptionKey: "municipalitiesOverviewPage.description",
  },
  "/regions": {
    titleKey: "regionalOverviewPage.title",
    descriptionKey: "regionalOverviewPage.description",
  },
  "/nation": {
    titleKey: "nationDetailPage.title",
    descriptionKey: "nationDetailPage.description",
  },
  "/data-download": {
    titleKey: "dataDownloadPage.title",
    descriptionKey: "dataDownloadPage.description",
  },
};

const NOINDEX_PATTERNS = new Set([
  "/companies/:id/edit",
  "/internal-pages",
  "/error/:code",
  "/403",
  "/auth/callback",
]);

type SeoHandler = (context: SeoContext) => SeoMeta;

const PATTERN_HANDLERS: Record<string, SeoHandler> = {
  "/": buildHomeSeo,
  "/companies/:id": buildCompanyDetailSeo,
  "/municipalities/:id": buildMunicipalityDetailSeo,
  "/regions/:id": buildRegionDetailSeo,
  "/insights/:id": buildInsightsSeo,
};

export function resolveSeoForPattern(
  pattern: string,
  context: SeoContext,
): SeoMeta {
  if (NOINDEX_PATTERNS.has(pattern)) {
    return { ...context.baseSeo, noindex: true };
  }

  const handler = PATTERN_HANDLERS[pattern];
  if (handler) {
    return handler(context);
  }

  const simpleRoute = SIMPLE_SEO_ROUTES[pattern];
  if (simpleRoute) {
    return buildSimpleSeo(
      simpleRoute.titleKey,
      simpleRoute.descriptionKey,
      context.language,
      context.canonical,
      { suffixSiteName: simpleRoute.suffixSiteName },
    );
  }

  return context.baseSeo;
}
