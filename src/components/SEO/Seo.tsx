import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SeoMeta } from "@/types/seo";
import { buildAbsoluteUrl, buildAbsoluteImageUrl, stripTrackingParams, stripUndefined } from "@/utils/seo";
import { getDefaultOgImageUrl } from "@/utils/seo/ogImages";
import { getLanguageUrl, detectLanguageFromPath, SupportedLanguage } from "@/lib/languageDetection";

interface SeoProps {
  meta: SeoMeta;
}

/**
 * SEO component that renders meta tags based on SeoMeta model
 * Handles title, description, canonical, robots, OpenGraph, Twitter tags, hreflang, and JSON-LD structured data
 * Always provides absolute og:image URLs with fallbacks
 * Strips tracking parameters from canonical URLs
 * Ensures valid JSON-LD by removing undefined values
 */
export function Seo({ meta }: SeoProps) {
  const { title, description, canonical, noindex, og, twitter, structuredData } = meta;
  const location = useLocation();

  // Build absolute URLs and strip tracking parameters
  const canonicalUrl = canonical
    ? stripTrackingParams(buildAbsoluteUrl(canonical))
    : undefined;
  
  // Generate hreflang tags for language alternates
  const currentPath = location.pathname;
  const svPath = getLanguageUrl(currentPath, "sv");
  const enPath = getLanguageUrl(currentPath, "en");
  const svUrl = buildAbsoluteUrl(svPath);
  const enUrl = buildAbsoluteUrl(enPath);
  
  // Detect current language for locale
  const currentLanguage: SupportedLanguage = detectLanguageFromPath(currentPath) || "sv";
  const locale = currentLanguage === "sv" ? "sv_SE" : "en_US";
  const alternateLocale = currentLanguage === "sv" ? "en_US" : "sv_SE";
  
  // Always provide an og:image URL (with fallback to default)
  // og.image may already be absolute (from entity SEO), or relative
  const ogImage = og?.image
    ? (og.image.startsWith("http://") || og.image.startsWith("https://")
        ? og.image
        : buildAbsoluteImageUrl(og.image))
    : getDefaultOgImageUrl();
  
  // Generate og:image:alt from description or title
  const ogImageAlt = description || title || "Klimatkollen";
  
  // Twitter image defaults to og:image if not specified
  const twitterImage = twitter?.image
    ? buildAbsoluteImageUrl(twitter.image)
    : ogImage;
  
  // Twitter card defaults to summary_large_image when image is present
  const twitterCard = twitter?.card || "summary_large_image";

  return (
    <Helmet>
      {/* Title */}
      <title>{title}</title>

      {/* Description */}
      {description && <meta name="description" content={description} />}

      {/* Canonical - tracking params already stripped */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* hreflang - language alternates */}
      <link rel="alternate" hrefLang="sv" href={svUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={svUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph - always include og:image */}
      {og && (
        <>
          <meta property="og:site_name" content="Klimatkollen" />
          <meta property="og:locale" content={locale} />
          <meta property="og:locale:alternate" content={alternateLocale} />
          {og.title && <meta property="og:title" content={og.title} />}
          {og.description && (
            <meta property="og:description" content={og.description} />
          )}
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:alt" content={ogImageAlt} />
          {og.type && <meta property="og:type" content={og.type} />}
          {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        </>
      )}

      {/* Twitter - always include card and image when og is present */}
      {og && (
        <>
          <meta name="twitter:card" content={twitterCard} />
          {twitter?.title && (
            <meta name="twitter:title" content={twitter.title} />
          )}
          {twitter?.description && (
            <meta name="twitter:description" content={twitter.description} />
          )}
          <meta name="twitter:image" content={twitterImage} />
        </>
      )}
      
      {/* Twitter tags if explicitly provided without og */}
      {!og && twitter && (
        <>
          <meta name="twitter:card" content={twitterCard} />
          {twitter.title && (
            <meta name="twitter:title" content={twitter.title} />
          )}
          {twitter.description && (
            <meta name="twitter:description" content={twitter.description} />
          )}
          {twitterImage && (
            <meta name="twitter:image" content={twitterImage} />
          )}
        </>
      )}

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <>
          {Array.isArray(structuredData) ? (
            // Multiple structured data objects - render each in separate script tags
            structuredData.map((data, index) => (
              <script key={index} type="application/ld+json">
                {JSON.stringify(stripUndefined(data), null, 0)}
              </script>
            ))
          ) : (
            // Single structured data object
            <script type="application/ld+json">
              {JSON.stringify(stripUndefined(structuredData), null, 0)}
            </script>
          )}
        </>
      )}
    </Helmet>
  );
}
