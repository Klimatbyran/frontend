import { Helmet } from "react-helmet-async";
import { SeoMeta } from "@/types/seo";
import { buildAbsoluteUrl, buildAbsoluteImageUrl } from "@/utils/seo";
import { getDefaultOgImageUrl } from "@/utils/seo/ogImages";

interface SeoProps {
  meta: SeoMeta;
}

/**
 * SEO component that renders meta tags based on SeoMeta model
 * Handles title, description, canonical, robots, OpenGraph, and Twitter tags
 * Always provides absolute og:image URLs with fallbacks
 */
export function Seo({ meta }: SeoProps) {
  const { title, description, canonical, noindex, og, twitter } = meta;

  // Build absolute URLs
  const canonicalUrl = canonical ? buildAbsoluteUrl(canonical) : undefined;
  
  // Always provide an og:image URL (with fallback to default)
  // og.image may already be absolute (from entity SEO), or relative
  const ogImage = og?.image
    ? (og.image.startsWith("http://") || og.image.startsWith("https://")
        ? og.image
        : buildAbsoluteImageUrl(og.image))
    : getDefaultOgImageUrl();
  
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

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph - always include og:image */}
      {og && (
        <>
          {og.title && <meta property="og:title" content={og.title} />}
          {og.description && (
            <meta property="og:description" content={og.description} />
          )}
          <meta property="og:image" content={ogImage} />
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
    </Helmet>
  );
}
